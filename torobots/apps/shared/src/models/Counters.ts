import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf } from "./model.utils";
import { ICounter } from '../types';

const schema: SchemaOf<ICounter> = {
  sequenceName: { type: String, required: true },
  sequenceId: { type: String, require: false },
  sequenceValue: { type: Number, required: false },
  created: { type: Date, default: function () { return new Date() } },
  updated: { type: Date, default: function () { return new Date() } },
};

export interface ICounterDocument extends Document, ICounter { }
export interface ICounterModel extends ISafeModel<ICounter> { }

const CounterSchema = new Schema(schema);

export const Counters = model<ICounter>("counters", CounterSchema) as ICounterModel;