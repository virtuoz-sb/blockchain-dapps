import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderTrackingDto } from "../model/order-tracking.dto";
import { OrderTrackingModel, OrderTrackingModelName } from "../model/order-tracking.schema";

@Injectable()
export default class DirectOrderDataService {
  private readonly logger = new Logger(DirectOrderDataService.name);

  constructor(@InjectModel(OrderTrackingModelName) private orderTrackModel: Model<OrderTrackingModel>) {}

  async getDirectOrders(userId: string, page = 0, perPage = 10): Promise<OrderTrackingDto[]> {
    const res = await this.orderTrackModel
      .find({ userId, initiator: "direct" }, null, {
        sort: { updated_at: -1 },
      })
      .limit(perPage)
      .skip(page * perPage);
    return res ? res.map((x) => x.toJSON()) : new Array<OrderTrackingDto>();
  }

  async getOrders(
    userId: string,
    page = 0,
    perPage = 10,
    initiatorFilters?: string[],
    sort = "",
    sortDir = ""
  ): Promise<OrderTrackingDto[]> {
    this.logger.debug(`getOrders, userId : ${userId}`);
    this.logger.debug(`getOrders, page : ${page}`);
    this.logger.debug(`getOrders, perPage : ${perPage}`);
    this.logger.debug(`getOrders, initiatorFilters : ${initiatorFilters}`);
    this.logger.debug(`getOrders, sort : ${sort}`);
    this.logger.debug(`getOrders, sortDir : ${sortDir}`);

    let sortFilter = {};
    if (!sort) {
      sortFilter = { updated_at: -1 };
    } else {
      sortFilter[sort] = sortDir && sortDir === "desc" ? -1 : 1;
    }

    /*
    let query = { userId, $in: [] };
    if (initiatorFilters && initiatorFilters.length > 0) {
      {
        query.$in.push({ initiator: initiatorFilters });
      }
    }
    */
    let res = [];
    if (initiatorFilters && initiatorFilters.length > 0) {
      this.logger.debug(`getOrders, case 1`);
      res = await this.orderTrackModel
        .find({ userId, initiator: { $in: initiatorFilters } }, null, {
          sort: sortFilter,
        })
        .limit(perPage)
        .skip(page * perPage);
    } else {
      this.logger.debug(`getOrders, case 2`);
      res = await this.orderTrackModel
        .find({ userId }, null, {
          sort: sortFilter,
        })
        .limit(perPage)
        .skip(page * perPage);
    }

    return res ? res.map((x) => x.toJSON()) : new Array<OrderTrackingDto>();
  }

  async updateDirectOrder(userId: string, orderTrackingId: string, payload: any) {
    const res = await this.orderTrackModel.updateOne({ _id: orderTrackingId, userId }, payload);
  }
}
