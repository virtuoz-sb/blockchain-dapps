import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import DailyRateDataService from "./services/daily-rate.data.service";
import CurrencyQuoteSchema from "../models/currency-quote.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: "DailyRate", schema: CurrencyQuoteSchema }])],
  providers: [DailyRateDataService],
})
export default class MarketModule {}
