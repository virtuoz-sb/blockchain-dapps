/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
import { Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as proxy from "http-proxy-middleware";

export default class CryptowatchProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CryptowatchProxyMiddleware.name);

  private cryptoWatchProxy = proxy.createProxyMiddleware({
    changeOrigin: true,
    followRedirects: true,
    target: "https://api.cryptowat.ch",
    pathRewrite: (path, req) => {
      const parts = path.split("/");
      const cat = parts[parts.length - 3];
      const exchange = parts[parts.length - 2];
      const pair = parts[parts.length - 1];

      let newExchange = exchange;
      if (exchange === "binance-future") {
        newExchange = "binance";
      } else if (exchange === "kucoin-future") {
        newExchange = "kucoin";
      } else if (exchange === "ftx-future") {
        newExchange = "ftx";
      }

      if (cat === "orderbook") {
        return path.replace(path, `/markets/${exchange}/${pair}/orderbook`);
      }
      if (cat === "tradehistory") {
        return path.replace(path, `/markets/${exchange}/${pair}/trades`);
      }
    },
    secure: false,
    headers: {
      // "X-yolo": "yola",
      authorization: "", // overwrites jwt from original request
      cookie: "", // overwrites any cookie from original request
      origin: "", // don't send origin to cryptowatch or you'll got 'Origin not allowed' error 403
      "x-cw-api-key": `${process.env.CRYPTOWATCH_API_PUB}`,
    },
    onProxyReq: (proxyReq, req, res) => {
      // delete req.headers.cookie; // WARNING: this does not delete anything
      this.logger.debug(`Proxying ${req.method} request originally made to '${req.originalUrl}' is sent to ${req.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // this.logger.debug(`proxyRes statusCode: ${proxyRes.statusCode} , request was sent to ${req.path}`);

      if (proxyRes.statusCode > 202) {
        this.logger.error(`proxyRes ERROR statusCode: ${proxyRes.statusCode} , request was sent to ${req.path}`);
      }
    },
    onError: (err, req, res) => {
      this.logger.error(`onError : ${err}`);
      res.status(520).send("Proxy Error");
    },
  });

  use(req: Request, res: Response, next: () => void) {
    this.cryptoWatchProxy(req, res, next);
  }
}
