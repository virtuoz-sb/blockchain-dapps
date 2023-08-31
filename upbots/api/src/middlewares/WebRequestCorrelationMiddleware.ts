import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import { Types } from "mongoose";

@Injectable()
export default class WebRequestCorrelationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(WebRequestCorrelationMiddleware.name);

  async use(req: RequestWithCorrelation, _: Response, next: () => void) {
    try {
      const webReqId = new Types.ObjectId();
      // this.logger.debug(`creating web request correlationid ${webReqId.toHexString()}`);
      req.webReqId = webReqId.toHexString();
      next();
      // this.logger.debug(`end of ${webReqId.toHexString()}`);
    } catch (err) {
      this.logger.warn(`error creating correlation id`);
      this.logger.error(err);
    }
  }
}

export type RequestWithCorrelation = Request & {
  /**
   * web request identifier that can be used a global correlation identifier.
   * Correlating backend process logs stemming from a particular request (helps with log correlation and debugging purposes)
   */
  webReqId: string;
};
