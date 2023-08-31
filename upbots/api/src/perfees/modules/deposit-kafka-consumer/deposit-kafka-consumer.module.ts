/* eslint-disable import/prefer-default-export */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import DepositKafkaConsumerController from "./deposit-kafka-consumer.controller";

import PerfeesSharedModule from "../../perfees-shared.module";

@Module({
  providers: [],
  imports: [PerfeesSharedModule],
  controllers: [DepositKafkaConsumerController],
})
export default class DepositKafkaConsumerModule {}
