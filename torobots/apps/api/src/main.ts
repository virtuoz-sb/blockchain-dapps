import { Logger, NestApplicationOptions } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from "nest-winston";
import * as winston from "winston";
import { AppModule } from './app.module';
import { RedisIoAdapter } from './core/adapter/redis-io.adapter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { environments } from './environments/environments';
import { CustomSocketIoAdapter } from './core/adapter/custom-socket-io.adapter';
import setupDocumentation from "./app.documentation";
import { connectMongoDB } from "@torobot/shared";

const redis = environments.redis;

async function bootstrap() {
  const opt: NestApplicationOptions = {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(winston.format.timestamp(), nestWinstonModuleUtilities.format.nestLike()),
        }),
      ],
      level: process.env.LOG_LEVEL,
    }),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, opt);

  app.enableCors();
  app.enableShutdownHooks();
  app.set('trust proxy', environments.proxyEnabled);
  app.setGlobalPrefix('api');

  if (redis.enabled) {
    app.useWebSocketAdapter(new RedisIoAdapter(redis.host, redis.port, app));
  } else {
    app.useWebSocketAdapter(new CustomSocketIoAdapter(app));
  }

  setupDocumentation(app);
  connectMongoDB(environments.mongoUri);
  
  const port = environments.port;
  const logger = new Logger('NestApplication');

  await app.listen(port, () =>
    logger.log(`Server(${process.env.NODE_ENV}) initialized on port ${port}`),
  );
}

bootstrap();
