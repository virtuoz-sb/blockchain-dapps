import { Injectable } from "@nestjs/common";
import { UpdateQuery } from "mongoose";

import { mongoDB } from "@torobot/shared";

@Injectable()
export class CounterService {
  constructor() { }

  async getNextSequenceValue(sequenceName: string): Promise<number> {
    const sequenceDocument = await mongoDB.Counters.findOneAndUpdate(
      {'sequenceName': sequenceName},
      { $inc: {sequenceValue: 1} },
      { new: true, upsert: true }
    );
    return sequenceDocument.sequenceValue;
  }
}