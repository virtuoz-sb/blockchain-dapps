/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as proxy from "http-proxy-middleware";
import { IncomingMessage } from "http";
import * as moment from "moment";
import * as stringHash from "string-hash";
import ApiErrorResponse from "../shared/api-error-reponse";
import AlgobotDataService from "../algobot/services/algobot.data-service";
import SignalTrackingService from "../algobot/services/signal-tracking.service";
import { SignalPayloadTrace } from "../algobot/models/signal-tracking.dto";
import { RequestWithCorrelation } from "./WebRequestCorrelationMiddleware";
import { WebhookResponse } from "../algobot/models/webhook-reponse";
import { RequestBotId } from "./BotPairPriceMiddleware";
import parseIp from "../utilities/ip.parser";

@Injectable()
export default class WebhookProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebhookProxyMiddleware.name);

  constructor(private algobotDataService: AlgobotDataService, private signalTrackingService: SignalTrackingService) {
    this.logger.debug(`WEBHOOK_ENGINE_ADDRESS: config ${process.env.WEBHOOK_ENGINE_ADDRESS}`);
    if (!process.env.WEBHOOK_ENGINE_ADDRESS) {
      throw new Error(`Cannot init WebhookProxyMiddleware, missing config WEBHOOK_ENGINE_ADDRESS '${process.env.WEBHOOK_ENGINE_ADDRESS}'`);
    }
  }

  private webhookProxyMiddleware = proxy.createProxyMiddleware({
    changeOrigin: true,
    followRedirects: true,
    selfHandleResponse: true, // true for manual mode: @see https://github.com/http-party/node-http-proxy#modify-response
    target: "".concat("http://", process.env.WEBHOOK_ENGINE_ADDRESS), // http://localhost:8187",
    pathRewrite: (path, req) => {
      const parts = path.split("/"); // [,api,hook]
      this.logger.debug(`path ${path} pathRewrite parts ${parts}`);
      if (parts.length > 3 && parts[3] === "algobot") {
        return "/algobot/webhook"; // /api/hook/algobot --> /algobot/webhook
      }
      return "/";
    },
    timeout: 600000,
    proxyTimeout: 600000,
    secure: false,
    logLevel: "debug",
    headers: {
      authorization: "", // overwrites jwt from original request
      cookie: "", // overwrites any cookie from original request
      origin: "", // don't send origin to cryptowatch or you'll got 'Origin not allowed' error 403
    },
    onProxyReq: (proxyReq, req: RequestWithCorrelation & RequestBotId, res) => {
      const signal = req?.body as SignalPayloadTrace;
      if (signal) {
        let bodyData = JSON.stringify({}); // default body
        if (signal.order) {
          this.logger.log(`***---algobot webhook order: ${JSON.stringify(signal.order)}`);
          const isValidSecretKey = this.isValidSecretKey(signal.order.botId, signal.order.secret);
          if (!isValidSecretKey) {
            this.logger.error(`***---non valid secret key for the webhook: ${signal.order.secret}`);
            return;
          }
          const webhookSecrets = process.env.WEBHOOK_SECRET.split(" ");
          signal.order.secret = webhookSecrets[0];
          signal.order.webReqId = req.webReqId; // add correlation id to engine algobots webhook request
          signal.order.estimatedPrice = req.estimatedBotPrice;
          signal.order.ip = parseIp(req.headers["x-forwarded-for"], req.connection?.remoteAddress);
          bodyData = JSON.stringify(signal);
          this.logger.warn(
            `${req.webReqId} algobot ${signal.order.position} for bot ${signal.order.botId} request streamed ${req.method} request from '${req.originalUrl}' to ${req.path} from ip ${signal.order.ip}`
          );
        } else {
          this.logger.warn(`algobot proxy received en empty request webhook order`);
        }

        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        // Stream the incoming request content to target server
        proxyReq.write(bodyData);
        this.logger.warn(`algobot proxy request written..`);
      } else {
        this.logger.warn(`algobot proxy received a null webhook body request; cannot proceeed any further: ${signal.order}`);
      }
    },
    onProxyRes: (proxyRes: IncomingMessage, req: RequestWithCorrelation, resp: Response) => {
      this.logger.debug(`${req.webReqId} target server being received`);
      proxyRes.on("data", (chunk) => {});
      proxyRes.on("end", () => {
        // NOTE: this is never executed in production (as request is cancelled if engine takes more than 2 sec), hence proxy never receives response (proxy.onError is executed instead)
        const final = Buffer.from(JSON.stringify({ success: true, date: new Date() }));
        resp.set("content-length", final.length.toString()); // re-set header after body modification
        resp.set("Content-Type", "application/json");
        resp.set("Cache-Control", "no-store");
        resp.status(202); // propagate statuscode

        resp.end(final, () => {
          this.logger.warn(`${req.webReqId} target server responded with statusCode ${proxyRes.statusCode}`);
        }); // selfHandleResponse: must be set to true (proxy manual mode)
      });
    },
    onError: (err, req: RequestWithCorrelation, res) => {
      this.logger.warn(
        `${req.webReqId} target server webhook Proxy onError (error maybe due to webhook request cancelled after 3 seconds)`
      );
      this.logger.warn(err);
      const errorResponse = ({
        code: 520,
        message: "WHProxy Error",
      } as unknown) as ApiErrorResponse;
      res.status(520).send(errorResponse);
    },
  });

  async use(req: Request, res: Response, next: () => void) {
    const closingSignal = await this.checkCloseWebhookSignal(req.body);
    const currentStratType = req.body.order.stratType;
    if (closingSignal) {
      req.body.order.position = "close";
      req.body.order.stratType = closingSignal.stratType;
    }
    this.webhookProxyMiddleware(req, res, next);
    // NOTE http-proxy-middleware is designed to be the last middelware so avoid nexting() and handle save algobot inside onProxyRes
    // next();

    if (closingSignal) {
      const nowTime = moment(moment.now());
      const lastSignalTime = moment(closingSignal.createdAt);
      const diffTime = moment.duration(nowTime.diff(lastSignalTime));
      const diffSecs = diffTime.seconds();
      if (diffSecs >= 30) {
        this.sendReopenWebhookSignal(req.body, currentStratType);
      }
    }
  }

  private isValidSecretKey(botId: string, secret: string) {
    const webhookSecrets = process.env.WEBHOOK_SECRET.split(" ");
    const secretSplits = secret.split(".upbots.");
    if (webhookSecrets.includes(secretSplits[0])) {
      return true;
    }
    return false;

    // const webhookSecrets = process.env.WEBHOOK_SECRET.split(" ");
    // if (webhookSecrets.includes(secret)) {
    //   return true;
    // }
    // const algobot = await this.algobotDataService.getBotById(botId);
    // if (!algobot || !algobot.creator) {
    //   return false;
    // }
    // const creatorHash = await stringHash(algobot.creator);
    // const secretSplits = secret.split(".upbots.");
    // if (secretSplits.length === 2 && webhookSecrets.includes(secretSplits[0]) && secretSplits[1] === String(creatorHash)) {
    //   return true;
    // }
    // return false;
  }

  private async checkCloseWebhookSignal(payload) {
    if (payload.order.reopen) {
      return null;
    }
    if (payload.order.userFilter && payload.order.userFilter.length > 0) {
      return null;
    }

    const algobot = await this.algobotDataService.getBotById(payload.order.botId);
    if (algobot && algobot.category === "copybot") {
      return null;
    }

    const botSignal = await this.signalTrackingService.getLastSignalOfBot(payload.order.botId);
    if (botSignal && botSignal.position === "open" && payload.order.position === "open") {
      return botSignal;
    }
    return null;
  }

  private async sendReopenWebhookSignal(payload, stratType) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(10000);

    payload.order.position = "open";
    payload.order.stratType = stratType;
    payload.order.reopen = true;
    this.signalTrackingService.sendWebhookSignal(payload);
  }
}

// export type PayloadResponse = WebhookResponse & { yournewprop: string };
export type PayloadResponse = WebhookResponse;
