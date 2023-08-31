/* eslint-disable no-await-in-loop */

import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import msDelay from "src/utilities/delay";
import SignalTrackingService from "../algobot/services/signal-tracking.service";
import { SignalPayload } from "../algobot/models/signal-tracking.dto";

@Injectable()
export default class BotPairPriceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BotPairPriceMiddleware.name);

  constructor(private signalTrackingService: SignalTrackingService) {}

  async use(req: RequestBotId, _: Response, next: () => void) {
    const signal = req?.body as SignalPayload;

    try {
      this.logger.debug(`fetching estimateSignalPrice for bot ${signal?.order?.botId}`);
      if (signal) {
        let estim = 0;
        let retryCount = 3;
        while (estim === 0 && retryCount > 0) {
          estim = await this.signalTrackingService.estimateSignalPrice(signal.order.botId);
          retryCount -= 1;
          if (estim > 0) {
            break;
          } else {
            estim = 0;
          }
          msDelay(1000);
        }
        req.estimatedBotPrice = estim;
      }
    } catch (err) {
      this.logger.warn(`error fetching estimateSignalPrice for bot ${signal?.order?.botId}`);
      this.logger.error(err);
    }
    next();
  }
}

export type RequestBotId = Request & {
  estimatedBotPrice: number;
};
