import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";
import * as bodyParser from "body-parser";

@Injectable()
export default class BodyParserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    bodyParser.json()(req, res, next);
  }
}
