/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import * as mongoose from "mongoose";
import { ORDER_TRACKINGS_COLLECTION } from "../../models/database-collection";
import UserFriendlyOrderStatus from "./order-status-user";
import { CompletionEntity } from "./order-tracking.dto";

export const OrderTrackingModelName = "OrderTrackingModel";

// PARTIALLY_FILLED

const makeUserOrderStatus = function makeUserOrderStatus(x: OrderTrackingModel) {
  if (!x || !x.events) {
    x.userOrderStatus = UserFriendlyOrderStatus.NA;
    return;
  }
  if (x.events.some((e) => e.status === "FILLED") && x.completed) {
    x.userOrderStatus = UserFriendlyOrderStatus.FILLED;
    return;
  }
  if (x.events.some((e) => e.status === "CANCELED")) {
    x.userOrderStatus = UserFriendlyOrderStatus.CANCELED;
    return;
  }
  if (x.events.some((e) => e.status === "PARTIALLY_FILLED")) {
    x.userOrderStatus = UserFriendlyOrderStatus.PARTIAL;
    return;
  }
  if (x.events.some((e) => e.status === "NEW")) {
    x.userOrderStatus = UserFriendlyOrderStatus.WAITING;
    return;
  }
  if (x.aborted) {
    x.userOrderStatus = UserFriendlyOrderStatus.FAILED;
    return;
  }
  x.userOrderStatus = UserFriendlyOrderStatus.NA;
};

const OrderEventSchema = new mongoose.Schema(
  {
    at: { type: Date },
    status: { type: String },
    exOrderId: { type: String },
    side: { type: String },
    sbl: { type: String },
    exch: { type: String },
    type: { type: String }, // order type
    qOrig: { type: String },
    qExec: { type: String },
    qRem: { type: String },
    qExecCumul: { type: String },
    source: { type: String },
    pAsk: { type: String },
    pExec: { type: String },
    cumulQuoteCost: { type: String },
    delayUntilUpdater: { type: Number },
    delayOrderSubmit: { type: Number },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.id;
        delete ret.delayUntilUpdater; // remove unnecessary field
        delete ret.delayOrderSubmit;
      },
    },
  }
);

const OrderCompletionSchema = new mongoose.Schema(
  {
    qExec: { type: Number },
    pExec: { type: Number },
    cumulQuoteCost: { type: Number },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.id;
      },
    },
  }
);
export const OrderTrackingSchema = new mongoose.Schema(
  {
    stratId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: { type: mongoose.Schema.Types.ObjectId },
    botSubId: { type: mongoose.Schema.Types.ObjectId },
    exchKeyId: { type: mongoose.Schema.Types.ObjectId },
    signalId: { type: String },
    ctx: { type: String }, // manual trade strategy order context (E1, E2, TP1, TP2,SL)
    ctxBot: { type: String }, // open or close position position (algobot)
    stratType: { type: String }, // Strategie Event Type
    created_at: {
      type: Date,
    },
    updated_at: {
      type: Date,
    },
    side: { type: String },
    orderType: { type: String },
    priceAsked: { type: String },
    qtyBaseAsked: { type: String, required: false }, // requested quantity in BTC for instance
    qtyQuoteAsked: { type: String, required: false }, // requested quantity in USDT for instance (binance only)
    sbl: { type: String },
    exch: { type: String }, // exchange name
    initiator: { type: String }, // "direct" | "mstrat" | "algobot" | "userbot"

    accountType: { type: String, required: false },
    accountLeverage: { type: String, required: false },
    aborted: { type: Boolean },
    completed: { type: Boolean },

    events: [OrderEventSchema],
    completion: OrderCompletionSchema,
    cycleSequence: {
      type: Number,
      required: false,
    },
    error: {
      type: String,
      required: false,
    },
    errorAt: {
      type: Date,
      required: false,
    },
    errorReason: {
      type: String,
      required: false,
    },
    userAccess: {
      type: Object,
      required: false,
    },
  },
  {
    collection: ORDER_TRACKINGS_COLLECTION,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        if (!ret.ctxBot || ret.ctxBot === "") {
          delete ret.ctxBot;
        }
        if (!ret.ctx || ret.ctx === "") {
          delete ret.ctx;
        }

        ret.id = ret._id;
        delete ret._id;
        delete ret.type;
        makeUserOrderStatus(ret);
        delete ret.events; // do not expose order status events
        // delete ret.error; // do not expose: (too much of implementation details)
      },
    },
  }
)
  .index({
    signalId: 1,
  })
  .index({
    userId: 1,
  })
  .index({
    botSubId: 1,
  })
  .index({
    initiator: 1,
  })
  .index({
    stratId: 1,
  });

// TODO: index by user, bot, initiator

interface EventEntity {
  at: Date;
  status: string;
  exOrderId: string;
  side: string;
  sbl: string;
  exch: string;
  type: string;
  qOrig: string;
  qExec: string;
  qRem: string;
  qExecCumul: string;
  source: string;
  pAsk: string;
  pExec: string;
  cumulQuoteCost: string;
}

export interface OrderTrackingModel extends mongoose.Document {
  id: mongoose.Types.ObjectId;
  botId: string;
  userId: string;
  exchKeyId: string;
  botSubId: string;
  stratId: string;
  ctxBot: string;
  ctx: string;
  side: string;
  stratType: string;
  orderType: string;
  priceAsked: string;
  qtyBaseAsked: string;
  qtyQuoteAsked?: any;
  sbl: string;
  exch: string;
  initiator: string;
  accountType?: string;
  accountLeverage?: string;
  aborted: boolean;
  completed: boolean;
  cycleSequence: number;
  signalId: string;
  completion: CompletionEntity;
  error?: string;
  errorAt: Date;
  errorReason: string;
  events: EventEntity[];
  userAccess?: any;
  created_at: Date;
  updated_at: Date;
  userOrderStatus: UserFriendlyOrderStatus;
}
