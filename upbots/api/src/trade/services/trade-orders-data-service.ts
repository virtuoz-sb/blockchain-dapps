import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { OrderTrackingDto } from "../model/order-tracking.dto";
import { OrderTrackingModel, OrderTrackingModelName } from "../model/order-tracking.schema";

@Injectable()
export default class TradeOrdersDataService {
  private readonly logger = new Logger(TradeOrdersDataService.name);

  constructor(@InjectModel(OrderTrackingModelName) private orderModel: Model<OrderTrackingModel>) {}

  async getTradeOrders(userId, strategyId: string): Promise<OrderTrackingDto[]> {
    Logger.debug(`getTradeOrders for user ${userId} stratId:${strategyId}`);
    const res = await this.orderModel.find({ stratId: strategyId }, null, {
      sort: { updated_at: -1 },
    });

    // this.logger.debug(` getTradeOrders stringify result : ${JSON.stringify(res)}`);
    return res ? res.map((x) => x.toJSON()) : new Array<OrderTrackingDto>();
  }
}
