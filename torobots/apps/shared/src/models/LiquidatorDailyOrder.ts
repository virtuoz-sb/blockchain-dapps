import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ILiquidatorDailyOrder } from "../types";
import { LiquidatorBots } from '.';

const schema: SchemaOf<ILiquidatorDailyOrder> = {
  liquidator:  { type: ObjectId, ref: LiquidatorBots.modelName },
  buy: { type: Number, default: 0 },
  sell: { type: Number, default: 0 },
  date: { type: String, required: true },
  created: { type: Date, default: function(){return new Date()} },
};

export interface ILiquidatorDailyOrderDocument extends Document, ILiquidatorDailyOrder {}
export interface ILiquidatorDailyOrderModel extends ISafeModel<ILiquidatorDailyOrder> {}

const ILiquidatorDailyOrderSchema: Schema = new Schema(schema);

ILiquidatorDailyOrderSchema.statics = {
  populateModel(object: any): Promise<ILiquidatorDailyOrderDocument> {
    return object.populate()
  },
  async safeCreate(initial: Partial<ILiquidatorDailyOrder>): Promise<ILiquidatorDailyOrderDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ILiquidatorDailyOrder>): Promise<ILiquidatorDailyOrderDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ILiquidatorDailyOrderDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const LiquidatorDailyOrders = model<ILiquidatorDailyOrder>("liquidatorDailyOrders", ILiquidatorDailyOrderSchema) as ILiquidatorDailyOrderModel;
