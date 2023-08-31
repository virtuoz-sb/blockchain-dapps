import { Injectable, Logger, HttpService } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SignalTrackingDto, SignalTrackingModel } from "../models/signal-tracking.dto";
import { AlgoBotsDto } from "../models/algobot.dto";
import AlgobotDataService from "./algobot.data-service";
import { SignalTrackingModelName } from "../models/signal-tracking.schema";
import ConversionRateService from "../../cryptoprice/conversion-rate.service";

@Injectable()
export default class SignalTrackingService {
  private readonly logger = new Logger(SignalTrackingService.name);

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(SignalTrackingModelName) private signalTrackingModel: Model<SignalTrackingModel>,
    private algobotDataService: AlgobotDataService,
    private rateSvc: ConversionRateService
  ) {}

  public async estimateSignalPrice(botId: string): Promise<number> {
    try {
      const botData = await this.getBotData(botId);
      const { base, quote } = botData;
      const symbolValue = await this.rateSvc.getSymbolsEstimatedPrices([base], [quote]);
      const estimatedPrice = symbolValue[base][quote];
      this.logger.debug(`estimated pair price for bot ${botId}: ${estimatedPrice} ${base}/${quote}`);

      return estimatedPrice;
    } catch (err) {
      this.logger.error(`failed to estimate pair price for bot ${botId}`);
      this.logger.error(err);
      return 0;
    }
  }

  private async getBotData(botId: string): Promise<AlgoBotsDto> {
    const bot = this.algobotDataService.getBotById(botId);
    return bot;
  }

  async getTimerangeSignalTrackings(botId: string, start: Date): Promise<SignalTrackingDto[]> {
    const res = await this.signalTrackingModel.find({ botId, signalDateTime: { $gte: start } }, null, {
      sort: { signalDateTime: 1, botCycle: 1, botVer: 1, position: -1 },
    });

    return res ? res.map((x) => x.toJSON()) : new Array<SignalTrackingDto>();
  }

  async getLastSignalOfBot(botId) {
    const lastSignalTracking = await this.signalTrackingModel
      .findOne({ botId })
      .sort({ signalDateTime: -1, botCycle: -1, botVer: -1, position: 1 });
    return lastSignalTracking;
  }

  async sendWebhookSignal(payload) {
    const apiUrl = `${process.env.API_URL}/api/hook/algobot/`;
    try {
      const res = await this.httpService.post(apiUrl, payload).toPromise();
      const { data } = res;
      return data;
    } catch (err) {
      this.logger.error(`Close Bot order ERROR: ${err}`);
      return err;
    }
  }
}
