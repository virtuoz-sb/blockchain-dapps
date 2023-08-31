import { model, Document, Schema } from "mongoose";
import { ISafeModel, SchemaOf, ObjectId } from "./model.utils";
import { ICoinMarketVolume } from "../types";
import { Tokens } from './Tokens';

const schema: SchemaOf<ICoinMarketVolume> = {
  token: { type: ObjectId, ref: Tokens.modelName },
  open: { type: Number },
  high: { type: Number },
  low: { type: Number },
  close: { type: Number },
  volume: { type: Number },
  timestamp: { type: Date, default: function(){return new Date()} },
  created: { type: Date, default: function(){return new Date()} }
};

export interface ICoinMarketVolumeDocument extends Document, ICoinMarketVolume {}
export interface ICoinMarketVolumeModel extends ISafeModel<ICoinMarketVolume> {}

const CoinMarketVolumeSchema: Schema = new Schema(schema);

CoinMarketVolumeSchema.statics = {
  populateModel(object: any): Promise<ICoinMarketVolumeDocument> {
    return object
      // .populate('token')
  },
  async safeCreate(initial: Partial<ICoinMarketVolume>): Promise<ICoinMarketVolumeDocument> {
    return this.create(initial);
  },
  async safeUpdate(id: string, updates: Partial<ICoinMarketVolume>): Promise<ICoinMarketVolumeDocument> {
    return this.findByIdAndUpdate(id, updates);
  },
  async safeDelete(id: string): Promise<ICoinMarketVolumeDocument> {
    return this.findByIdAndDelete(id);
  }
};

export const CoinMarketVolumes = model<ICoinMarketVolume>("coinMarketVolumes", CoinMarketVolumeSchema) as ICoinMarketVolumeModel;
export const CurrentCoinMarketVolumes = model<ICoinMarketVolume>("currentCoinMarketVolumes", CoinMarketVolumeSchema) as ICoinMarketVolumeModel;
