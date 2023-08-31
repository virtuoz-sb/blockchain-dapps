import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import AlgoBotModule from "../algobot/algobot.module";
import SharedModule from "../shared/shared.module";
import SignalsController from "./controllers/signals.controller";

@Module({
  imports: [AlgoBotModule, SharedModule],
  controllers: [SignalsController],
})
export default class SignalsModule {}
