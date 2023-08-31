/* eslint-disable import/no-cycle */
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WebsocketGateway } from "./websocket.gateway";
import OrderEventController from "./order-event.controller";
import AuthModule from "../auth/auth.module";
import PerformanceModule from "../performance/performance.module";
import SocketSessionService from "./services/user-socket-session.service";
import NotificationSchema from "./models/notification.schema";
import NotificationRepository, { NOTIFICATION_MODEL_NAME } from "./repositories/notification.repository";
import NotificationController from "./controllers/notification.controller";
import { OrderTrackingSchema, OrderTrackingModelName } from "../trade/model/order-tracking.schema";
import PerformanceCyclesSchema from "../performance/models/performance-cycles.schema";
import * as BotWallet from "../perfees/models/bot-wallet.model";
import * as FeeTracking from "../perfees/models/fee-tracking.model";
import AlgoBotSchema from "../algobot/models/algobot.schema";
import UserSchema from "../models/user.schema";
import MailService from "../shared/mail.service";

@Module({
  imports: [
    AuthModule,
    PerformanceModule,
    MongooseModule.forFeature([
      { name: NOTIFICATION_MODEL_NAME, schema: NotificationSchema },
      { name: OrderTrackingModelName, schema: OrderTrackingSchema },
      { name: "PerformanceCyclesModel1", schema: PerformanceCyclesSchema },
      { name: BotWallet.ModelName, schema: BotWallet.Schema },
      { name: FeeTracking.ModelName, schema: FeeTracking.Schema },
      { name: "AlgobotsModel", schema: AlgoBotSchema },
      { name: "User", schema: UserSchema },
    ]), // model service implicitly
  ], // needs JWTService from JwtModule
  controllers: [OrderEventController, NotificationController],
  providers: [WebsocketGateway, SocketSessionService, NotificationRepository, MailService],
  exports: [WebsocketGateway],
})
export default class NotificationModule {}
