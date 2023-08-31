/* eslint-disable func-names */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import * as mongoose from "mongoose";
import { STRATEGY_COLLECTION } from "../../models/database-collection"; // relative path for tests

const EntrySchema = new mongoose.Schema(
  {
    // status: { type: Number },
    triggerprice: { type: mongoose.Schema.Types.Decimal128 },
    limitprice: { type: mongoose.Schema.Types.Decimal128 },
    quantity: { type: mongoose.Schema.Types.Decimal128 },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.id;
        delete ret.requested;
        delete ret.confirmed;
        if (ret.triggerprice) {
          ret.triggerprice = ret.triggerprice.toString();
        }
        if (ret.limitprice) {
          ret.limitprice = ret.limitprice.toString();
        }
        if (ret.quantity) {
          ret.quantity = ret.quantity.toString();
        }
      },
    },
  }
);

const TakeProfitSchema = new mongoose.Schema(
  {
    // status: { type: Number },
    quantity: { type: mongoose.Schema.Types.Decimal128 },
    trigger: { type: mongoose.Schema.Types.Decimal128 },
  },
  {
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret._id;
        delete ret.id;
        delete ret.status;
        if (ret.quantity) {
          ret.quantity = ret.quantity.toString();
        }
        if (ret.trigger) {
          ret.trigger = ret.trigger.toString();
        }
      },
    },
  }
);

const PriceStrategySchema = new mongoose.Schema(
  {
    // created_at: { type: Date, required: true },
    // updated_at: { type: Date, required: true },
    side: { type: Number }, // declare props used by virtual properties
    phase: { type: Number },
    stopLoss: { type: mongoose.Schema.Types.Decimal128 },
    takeProfits: [TakeProfitSchema],
    entries: [EntrySchema],
  },
  {
    collection: STRATEGY_COLLECTION,
    toJSON: {
      virtuals: true, // enable computed properties (+id prop)
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id; // remove internal _id prop

        if (ret.stopLoss) {
          ret.stopLoss = ret.stopLoss.toString(); // convert mongo $numberDecimal to string
        }
      },
    },
  }
);

/* maps enum description */
PriceStrategySchema.virtual("phaseDescription").get(function () {
  switch (this.phase) {
    case 0:
      return "not_set";
    case 1:
      return "waiting for entry";
    case 2:
      return "entry requested";
    case 3:
      return "partial entry";
    case 4:
      return "entered";
    case 5:
      return "takeprofit requested";
    case 6:
      return "takeprofit reached";
    case 7:
      return "locked";
    case 8:
      return "closed - missed entry";
    case 9:
      return "closing - by stoploss";
    case 10:
      return "closing - by takeprofit";
    case 11:
      return "closed - by stoploss";
    case 12:
      return "closed - by takeprofit";
    case 13:
      return "cancelled by user";
    case 14:
      return "error";
    default:
      return "unknown";
  }
});

PriceStrategySchema.virtual("sideDescription").get(function () {
  switch (this.side) {
    case 0:
      return "not_set";
    case 1:
      return "long"; // buy entry
    case 2:
      return "short"; // sell entry
    default:
      return "unknown";
  }
});

export default PriceStrategySchema;
