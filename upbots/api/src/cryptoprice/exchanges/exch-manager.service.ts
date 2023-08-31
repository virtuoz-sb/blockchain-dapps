import { Injectable, HttpService, Logger } from "@nestjs/common";
import KucoinExchService from "./kucoin-exch.service";
import KucoinFutureExchService from "./kucoin-future-exch.service";
import FtxExchService from "./ftx-exch.service";

@Injectable()
export default class ExchManagerService {
  private readonly logger = new Logger(ExchManagerService.name);

  constructor(
    private kucoinExchService: KucoinExchService,
    private kucoinFutureExchService: KucoinFutureExchService,
    private ftxExchService: FtxExchService
  ) {}

  async getAllMarkets(exch: string) {
    if (exch === "kucoin") {
      return this.kucoinExchService.getAllTicker();
    }
    if (exch === "kucoin-future") {
      return this.kucoinFutureExchService.getAllTicker();
    }
    if (exch === "ftx") {
      return this.ftxExchService.getAllMarkets();
    }
    return [];
  }

  async getSingleMarket(exch: string, symbol: string) {
    const result = null;
    if (exch === "kucoin") {
      return this.kucoinExchService.getTicker(symbol);
    }
    if (exch === "ftx") {
      return this.ftxExchService.getSingleMarket(symbol);
    }
    return null;
  }

  async getOrderBook(exch: string, symbol: string) {
    if (exch === "kucoin") {
      return this.kucoinExchService.getOrderBook(symbol);
    }
    if (exch === "ftx") {
      return this.ftxExchService.getOrderBook(symbol);
    }
    return {};
  }

  async getOrderHistories(exch: string, symbol: string) {
    if (exch === "kucoin") {
      return this.kucoinExchService.getOrderHistories(symbol);
    }
    if (exch === "ftx") {
      return this.ftxExchService.getOrderHistories(symbol);
    }
    return {};
  }
}
