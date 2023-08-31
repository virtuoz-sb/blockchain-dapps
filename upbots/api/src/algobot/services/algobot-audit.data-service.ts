/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-underscore-dangle */
import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { OrderTrackingModel } from "../../trade/model/order-tracking.schema";
import { AlgobotOrderCorrelationDto, OrderTrackingRawDtoForAdmin } from "../models/algobot-order-correlation.dto";
import { AlgoBotSubscriptionModel } from "../models/algobot-subscription.model";
import OrderAuditQuery from "../models/order-audit-query.model";
import { SignalTrackingAuditModel, SignalTrackingAuditsModelName } from "../models/signal-tracking-audit";
import mapToBotSubscriptionDto from "./mapper/bot-subscription.mapper";

@Injectable()
export default class AlgobotAuditDataService {
  private readonly logger = new Logger(AlgobotAuditDataService.name);

  constructor(@InjectModel(SignalTrackingAuditsModelName) private signalAuditModel: Model<SignalTrackingAuditModel>) {}

  async getAlgbobotsOrdersForAdmin(query: OrderAuditQuery): Promise<AlgobotOrderCorrelationDto[]> {
    this.logger.debug(`getAlgbobotsOrdersForAdmin query ${JSON.stringify(query)}`);
    let match = {};

    if (query.botId) {
      match = { ...match, botId: Types.ObjectId(query.botId) };
    }
    if (query.botCycle) {
      match = { ...match, botCycle: query.botCycle };
    }
    if (query.signalCorrelation) {
      match = { ...match, signalCorrelation: query.signalCorrelation };
    }

    const agg = [
      { $match: match },
      {
        $lookup: {
          from: "COL_ALGOBOTS_SUBSCRIPTIONS",
          localField: "botId",
          foreignField: "botId",
          as: "botsub",
        },
      },
      {
        $unwind: {
          path: "$botsub",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "COL_ORDER_TRACKINGS",
          let: { audit_botsubid: "$botsub._id", audit_signal: "$signalCorrelation" },
          pipeline: [
            { $match: { $expr: { $and: [{ $eq: ["$$audit_botsubid", "$botSubId"] }, { $eq: ["$$audit_signal", "$signalId"] }] } } },
          ],
          as: "order",
        },
      },
      {
        $unwind: {
          path: "$order",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          updatedAt: -1,
          "botsub.updatedAt": -1,
          "orders.updatedAt": -1,
        },
      },
    ];

    const audits = await this.signalAuditModel
      .aggregate(agg)
      .limit(query.pageSize)
      .skip(query.page * query.pageSize);
    return audits ? audits.map((x) => this.mapToDto(x)) : new Array<AlgobotOrderCorrelationDto>();
  }

  private mapToDto(m: AlgobotAuditOrderCorrelation): AlgobotOrderCorrelationDto {
    if (!m) return null;
    const {
      privateSignal,
      engineSuccess,
      engineStatusCode,
      ipAddresses,
      signalCorrelation,
      successes,
      followers,
      failures,
      execTime,
      botId,
      position,
      botCycle,
      createdAt,
      updatedAt,
      botsub,
      order,
    } = m;

    const mappedBotSub = mapToBotSubscriptionDto(botsub);
    const convertedOrder = order as OrderTrackingRawDoc; // OrderTrackingDoc is not the real entity returned by query pipeline so we extend the type by casting
    const mappedOrderTrack = this.mapTopOrderTrackRawDto(convertedOrder);
    return {
      id: (m._id as Types.ObjectId).toHexString(),
      privateSignal,
      engineSuccess,
      engineStatusCode,
      ipAddresses,
      signalCorrelation,
      successes,
      followers,
      failures,
      execTime,
      botId,
      position,
      botCycle,
      createdAt,
      updatedAt,
      botsub: mappedBotSub,
      order: mappedOrderTrack,
    } as AlgobotOrderCorrelationDto;
  }

  private mapTopOrderTrackRawDto(m: OrderTrackingRawDoc): OrderTrackingRawDtoForAdmin {
    if (!m) return null;

    const {
      userId,
      exchKeyId,
      stratId,
      botSubId,
      cycleSequence,
      ctx,
      ctxBot,
      side,
      orderType,
      // priceAsked,
      // qtyBaseAsked,
      // qtyQuoteAsked,
      sbl,
      exch,
      initiator,
      aborted,
      completed,
      signalId,
      completion,
      events,
      created_at,
      updated_at,
      // error,
      errorReason,
      errorAt,
    } = m;

    return {
      id: (m._id as Types.ObjectId).toHexString(),
      botId: m.botId ? ((m.botId as unknown) as Types.ObjectId).toHexString() : null,
      userId,
      exchKeyId,
      stratId,
      botSubId,
      cycleSequence,
      ctx,
      ctxBot,
      side,
      orderType,

      sbl,
      exch,
      initiator,
      aborted,
      completed,
      signalId,
      completion,
      events,

      created_at,
      updated_at,
      // error,
      errorReason,
      errorAt,
    } as OrderTrackingRawDtoForAdmin;
  }
}
type AlgobotAuditOrderCorrelation = SignalTrackingAuditModel & {
  botsub: AlgoBotSubscriptionModel;
  order: OrderTrackingModel;
};

type OrderTrackingRawDoc = OrderTrackingModel & {
  // see also OrderTrackingEntity
  // aborted: boolean;
  // completed: boolean;
  // signalId: string;
  events: any;
};
