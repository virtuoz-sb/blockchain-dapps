/* eslint-disable no-param-reassign */

import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston";
import * as winston from "winston";
import { Logger, NestApplicationOptions } from "@nestjs/common";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { urlencoded, json } from "express";
import AppModule from "./app.module";
import setupDocumentation from "./app.documentation";
import setupRouteListing from "./app.route-listing";
// import { microserviceConfig } from "./perfees/modules/deposit-kafka-consumer/microservice.config";

function sanitizeUri(uri: string): string {
  return (uri || "").replace(/(.*)([^:]*)(:[^@]*)@/, "$1$2:*****@");
}

function connectAMQP(app: NestExpressApplication) {
  if (process.env.DISABLE_RABBITMQ_TRANSPORT === "true") {
    Logger.log("INFO: RABBITMQ transport is not enabled", "main");
    return;
  }
  if (!process.env.AMQP_HOST || !(process.env.AMQP_HOST.length > 0)) {
    Logger.warn("WARN: no AMQP connection (empty or missing AMQP_HOST in env variables), hence no websocket-order-events possible", "main");
    return;
  }
  if (!process.env.AMQP_ORDER_EVENT_Q || !(process.env.AMQP_ORDER_EVENT_Q.length > 0)) {
    Logger.warn("WARN: invalid AMQP configuration (empty or missing AMQP_ORDER_EVENT_Q in env variables)", "main");
    return;
  }
  const amqpUrls = [];
  const hosts = process.env.AMQP_HOST.split(",");
  const ports = process.env.AMQP_PORT.split(",");
  const user = process.env.AMQP_USER;
  const password = process.env.AMQP_PASSWORD;
  hosts.forEach((host, index) => {
    let amqpUrl = "";
    const port = ports.length > index ? parseInt(ports[index], 10) : 5672;
    if (user && password) {
      amqpUrl = `amqp://${user}:${password}@${host}:${port}/`;
    } else {
      amqpUrl = `amqp://${host}:${port}/`;
    }
    amqpUrls.push(amqpUrl);
  });
  Logger.log(`using AMQP url: ${amqpUrls.map(sanitizeUri).join(", ")} for q ${process.env.AMQP_ORDER_EVENT_Q}`, "main");

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: amqpUrls,
      queue: process.env.AMQP_ORDER_EVENT_Q,
      queueOptions: {
        arguments: {
          "x-dead-letter-exchange": "dead_letter_exchange",
        },
      },
      // noAck: false, // To enable manual acknowledgment mode, set the noAck property to false
    },
  });
}

// function connectKafka(app: NestExpressApplication) {
//   if (process.env.DISABLE_KAFKA_TRANSPORT === "true") {
//     Logger.log("INFO: Kafka transport is not enabled", "main");
//     return;
//   }

//   if (!process.env.KAFKA_BROKERS || !(process.env.KAFKA_BROKERS.length > 0)) {
//     Logger.warn("WARN: no Kafka connection (empty or missing KAFKA_BROKERS in env variables)", "main");
//     return;
//   }

//   if (!process.env.KAFKA_CONSUMER_GROUP_ID || !(process.env.KAFKA_CONSUMER_GROUP_ID.length > 0)) {
//     Logger.warn("WARN: no Kafka group id (empty or missing KAFKA_CONSUMER_GROUP_ID in env variables)", "main");
//     return;
//   }

//   if (
//     !(
//       process.env.KAFKA_TOPIC_NAME_DEPOSIT_TX &&
//       process.env.KAFKA_TOPIC_NAME_DEPOSIT_TX_REMOVE &&
//       process.env.KAFKA_TOPIC_NAME_DEPOSIT_TX_CONFIRM
//     )
//   ) {
//     Logger.warn("WARN: Kafka topics are invalid", "main");
//     return;
//   }
//   try {
//     app.connectMicroservice<MicroserviceOptions>(microserviceConfig);
//   } catch (e) {
//     Logger.log(`Kafka connection issue ${e}`, "main");
//   }
//   Logger.log(`Kafka connected`, "main");
// }

Logger.log(`API start, NODE_ENV: ${process.env.NODE_ENV}`, "main");

Logger.debug(`Log level: ${process.env.LOG_LEVEL}`, "main");

if (process.env.NODE_ENV === "test") {
  process.env.MONGODB_URI = process.env.MONGODB_URI_TEST;
  Logger.log("----------TESTING IN PROCESS----------", "main");
  Logger.log(`using TEST database ${sanitizeUri(process.env.MONGODB_URI)}`, "main");
}
Logger.log(`using database ${sanitizeUri(process.env.MONGODB_URI)}`, "main");

async function bootstrap() {
  const frontURLs = process.env.FRONT_URL.split(" ");
  const chainBackendURL = process.env.CHAIN_BACKEND_URL;
  const cors: CorsOptions = {
    methods: "*",
    origin: [...frontURLs, chainBackendURL],
  };
  const opt: NestApplicationOptions = {
    cors,
    // see https://github.com/upbots/upbots-webapp/issues/324
    bodyParser: false, // WebhookProxyMiddleware needs this set to false or proxy fails for POST request
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
        }),
        // other transports...
      ],
      level: process.env.LOG_LEVEL,
    }),
  };
  // const app = await NestFactory.create(AppModule);
  // const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const app = await NestFactory.create<NestExpressApplication>(AppModule, opt);

  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  app.setGlobalPrefix("api");

  connectAMQP(app);
  // if (process.env.ENABLE_PERF_FEES_FEATURE === "1") {
  //   connectKafka(app);
  // }

  if (process.env.NODE_ENV !== "production") {
    setupDocumentation(app);
    Logger.debug(`Api doc generated for NODE_ENV: ${process.env.NODE_ENV}`, "main");
  } else {
    Logger.debug(`NO api doc generated for NODE_ENV: ${process.env.NODE_ENV}`, "main");
  }
  await app.startAllMicroservicesAsync();
  Logger.debug(`Api startAllMicroservicesAsync executed'`);

  await app.listen(process.env.PORT);
  setupRouteListing(app);
}

bootstrap();
