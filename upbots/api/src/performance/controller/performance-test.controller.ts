import { Controller, Body, Post, UseGuards } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import AdminGuard from "../../shared/admin.guard";
import UserFromJWT from "../../utilities/user.decorator";
import { PerformanceCycleDto, MeasuredObjects, PerformanceCycleModel } from "../models/performance.models";
import { OrderTrackingModelName, OrderTrackingModel } from "../../trade/model/order-tracking.schema";
// import { WebsocketGateway } from "../../notif/websocket.gateway";
import { User as UserDocument } from "../../types/user";

@ApiTags("performance-test")
@Controller("performance-test")
@UseGuards(AdminGuard)
@UseGuards(AuthGuard("jwt"))
export default class PerformanceTestController {
  constructor(
    @InjectModel("PerformanceCyclesModel") private performanceCyclesModel: Model<PerformanceCycleModel>,
    @InjectModel(OrderTrackingModelName) private orderTrackingModel: Model<OrderTrackingModel>
  ) {}

  @Post("/new-performance-cycle")
  async newPerformanceCycle(@Body() cycle: PerformanceCycleDto): Promise<any> {
    if (process.env.ENABLE_PERF_FEES_FEATURE === "1" && process.env.PERF_FEES_FEATURE_TEST === "1") {
      const cycleDto: PerformanceCycleDto = await this.performanceCyclesModel.findOneAndUpdate(
        { cycleSequence: cycle.cycleSequence, subBotId: cycle.subBotId, measuredObject: MeasuredObjects.SUBSCRIPTION },
        { ...cycle },
        { upsert: true }
      );
      const cycleModel = await this.performanceCyclesModel.findOne({
        cycleSequence: cycle.cycleSequence,
        subBotId: cycle.subBotId,
        measuredObject: MeasuredObjects.SUBSCRIPTION,
      });

      return cycleModel;
    }
    return null;
  }

  @Post("/new-order-tracking")
  async newOrderTracking(@Body() orderTracking: any): Promise<any> {
    if (process.env.ENABLE_PERF_FEES_FEATURE === "1" && process.env.PERF_FEES_FEATURE_TEST === "1") {
      const trackingDto: any = await this.orderTrackingModel.findOneAndUpdate(
        {
          cycleSequence: orderTracking.cycleSequence,
          userId: orderTracking.userId,
          botId: orderTracking.botId,
          botSubId: orderTracking.botSubId,
          initiator: "algobot",
        },
        { ...orderTracking },
        { upsert: true }
      );

      const orderTrackingModel = await this.orderTrackingModel.findOne({
        cycleSequence: orderTracking.cycleSequence,
        userId: orderTracking.userId,
        botId: orderTracking.botId,
        botSubId: orderTracking.botSubId,
        initiator: "algobot",
      });

      return orderTrackingModel;
    }
    return null;
  }
}
