import { Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { PriceStrategy } from "../model/price-strategy-dto";

@Injectable()
export default class TradeStrategyDataService {
  private readonly logger = new Logger(TradeStrategyDataService.name);

  constructor(@InjectModel("PriceStrategyModel") private stratModel: Model<PriceStrategy>) {}

  async getUserStrategies(userId: string, page = 0, perPage = 10): Promise<PriceStrategy[]> {
    this.logger.debug(`getUserStrategies for user ${userId} page:${page}, pagesize:${perPage}`);
    const res = await this.stratModel
      .find({ "account.userID": userId }, null, {
        sort: { updated_at: -1 },
      })
      .select("created_at updated_at side phase account.userID account.apiKeyID market.exchange market.symbol stopLoss takeProfits entries") // avoid exposing all props
      .limit(perPage)
      .skip(page * perPage);
    // this.logger.debug(`mapping: ${JSON.stringify(res)}`);
    return res ? res.map((x) => x.toJSON()) : new Array<PriceStrategy>();
  }

  async strategyExist(userId: string, stratId: string): Promise<boolean> {
    const res = await this.stratModel.exists({ "account.userID": userId, _id: stratId });
    // Logger.debug(`strategyExist? for user ${userId} stratId:${stratId} res: ${JSON.stringify(res)}`);
    return res;
  }
}
