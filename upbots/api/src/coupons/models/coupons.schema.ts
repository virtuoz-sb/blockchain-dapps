import * as mongoose from "mongoose";
import { COUPONS } from "../../models/database-collection";

/**
 * Coupons mongoose schema.
 *
 * @see ./coupons.types.ts
 */
const CouponsSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    promoName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    couponType: {
      type: String,
      enum: ["unique", "global"],
      required: true,
    },

    // If coupon is unique, should save a userId when is activated by user.

    activated: {
      type: Boolean,
      required: true,
      default: false,
    },
    activationDate: {
      type: Date,
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // If coupon is global, should always have a validity duration.

    validFrom: {
      type: Date,
      required: false,
    },
    validTo: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true, collection: COUPONS }
);
CouponsSchema.index({ code: 1, promoName: 1 }, { unique: true });

export default CouponsSchema;
