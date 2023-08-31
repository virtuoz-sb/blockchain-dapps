import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DailyRate } from "../../types";

@Injectable()
export default class DailyRateDataService {
  constructor(@InjectModel("DailyRate") private dailyRateModel: Model<DailyRate>) {}

  async findLatest(baseCurrency: string, quoteCurrency: string): Promise<DailyRate> {
    return this.dailyRateModel.findOne({ baseCurrency, quoteCurrency }).sort({ timestamp: -1 });
  }
}
