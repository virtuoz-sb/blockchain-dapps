/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import * as mongoose from "mongoose";
import { NOTIFICATIONS_COLLECTION } from "../../models/database-collection";

const NotificationSchema = new mongoose.Schema(
  {
    exOrderId: String,
    orderTrack: { type: mongoose.Schema.Types.ObjectId }, // legacy prop is string (not ObjectId)
    status: String,
    type: String,
    side: String,
    sbl: String,
    exch: String,
    qOrig: String,
    qExec: String,
    qRem: String,
    qExecCumul: String,
    accountRef: { type: mongoose.Schema.Types.ObjectId }, // legacy prop is string (not ObjectId)
    userId: String, // legacy prop is string (not ObjectId)
    source: String,
    pAsk: String,
    pExec: String,
    cumulQuoteCost: String,
    initiator: String,
    errorReason: String,
    botName: String,
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, required: false },
  },
  {
    collection: NOTIFICATIONS_COLLECTION,
    timestamps: true,
    toJSON: {
      // virtuals: true,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id; // remove internal _id prop
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.title; // legacy props needs to be removed (not displayed)
        delete ret.description; // legacy props needs to be removed (not displayed)
        delete ret.exDelay; // legacy props needs to be removed (not displayed)

        if (ret.logtime && ret.logtime.length > 0) {
          // migrate legacy field
          ret.createdAt = new Date(Date.parse(ret.logtime));
          delete ret.logtime;
        }
      },
    },
  }
)
  .index(
    {
      orderTrack: 1,
      status: 1,
    }
    // { unique: true }
  )
  .index({
    userId: 1,
  });

// TODO: add read index

export default NotificationSchema;
