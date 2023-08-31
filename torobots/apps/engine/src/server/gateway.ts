import EventEmitter from "events";
import HTTP from "http";
import path from "path";
import _ from "lodash";
import express, { Express } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { ActivityStatus, STATUS_ACTIVE, STATUS_INACTIVE } from "@torobot/shared";
import { connectMongoDB, mongoDB } from "@torobot/shared";
import { initRoutes } from "./router";
import config from '../config';
import { logger } from "../utils";

import { initScanner, startCurrencyScan } from "../scan/index";

export class Gateway extends EventEmitter {
  port: number;
  originURL: string;
  startTime: Date;
  status: ActivityStatus;
  app: Express;
  httpServer: HTTP.Server;
  
  constructor(port: number, originURL: string) {
    super();
    this.port = port;
    this.originURL = originURL;
    this.status = STATUS_INACTIVE;
    this.startTime = new Date();
  }

  async start(): Promise<void> {
    const { port, originURL } = this;
    const app = express();
    const httpServer = HTTP.createServer(app);

    this.app = app;
    this.httpServer = httpServer;

    app.use(cors())
    // for parsing json
    app.use(
      bodyParser.json({
        limit: '20mb'
      })
    )

    // for parsing application/x-www-form-urlencoded
    this.app.use(
      bodyParser.urlencoded({
        limit: '20mb',
        extended: true
      })
    );

    // define routes
    this.app.get("/ping", (req, res) => {
      logger.log('gateway', 'info', `ping request: ${new Date()}`);
      res.send("pong");
    });

    this.app.get("/status", (req, res) => {
      const { status, startTime } = this;
      res.json({ startTime, status });
    });

    initRoutes(this.app);
    await connectMongoDB(config.MONGO_URI);
    initScanner();
    startCurrencyScan();

    return new Promise((resolve) => {
      this.httpServer.listen(port, () => {
        logger.log('gateway', 'info', `gateway initialized on port ${port}`);
        this.status = STATUS_ACTIVE;
        logger.log('gateway', 'info', `initialize gateway: done\n`);
        return resolve();
      });
    });    
  }
}

// import { startBot, stopBot } from "../bot"
// async function testMongoDB() {
//   startBot("61b8ffeafc89af7974a78ff5");
// }