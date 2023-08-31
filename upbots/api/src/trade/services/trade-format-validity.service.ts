/* eslint-disable prefer-const */
import { Injectable } from "@nestjs/common";
import KucoinFutureProxy from "src/exchangeProxy/services/kucoin-future-proxy";
import KucoinProxy from "../../exchangeProxy/services/kucoin-proxy";
import OkexProxy from "../../exchangeProxy/services/okex-proxy";
import BinanceProxy from "../../exchangeProxy/services/binance-proxy";
import BinanceUsProxy from "../../exchangeProxy/services/binanceus-proxy";
import BinanceFutureProxy from "../../exchangeProxy/services/binance-future-proxy";
import BitmexProxy from "../../exchangeProxy/services/bitmex-proxy";
import BitmexTestProxy from "../../exchangeProxy/services/bitmex_test-proxy";
import FtxProxy from "../../exchangeProxy/services/ftx-proxy";
import FtxFutureProxy from "../../exchangeProxy/services/ftx-future-proxy";
import HuobiproProxy from "../../exchangeProxy/services/huobipro-proxy";
import CoinbaseproProxy from "../../exchangeProxy/services/coinbasepro-proxy";
import { ValidityCheckDto } from "../model/trade-formats-dto";
import SettingsService from "../../settings/services/settings.service";
import ProxyFactoryService from "../../exchangeProxy/services/proxy-factory.service";
import { FormatRules } from "../../settings/models/exchange-settings.dto";
import { DigitsCountingPrecisionMode } from "../../db_seeds/precision-mode";
import { Precision } from "../../settings/models/market-pair-settings.model";

@Injectable()
export default class TradeFormatValidity {
  private exchangeProxy:
    | BitmexProxy
    | BitmexTestProxy
    | BinanceProxy
    | BinanceUsProxy
    | BinanceFutureProxy
    | FtxProxy
    | FtxFutureProxy
    | HuobiproProxy
    | KucoinProxy
    | KucoinFutureProxy
    | OkexProxy
    | CoinbaseproProxy;

  constructor(private settingsService: SettingsService, private proxyFactoryService: ProxyFactoryService) {}

  async checkTradeFormat(
    exchange: string,
    symbol: string,
    baseCurrency: string,
    quoteCurrency: string,
    quantity: number,
    price: number
  ): Promise<ValidityCheckDto> {
    const formatRules = await this.setRules(exchange, symbol, baseCurrency, quoteCurrency);
    const market = Object.keys(formatRules)[0];
    const { limits, precision, precisionMode } = formatRules[market];
    const tradeCandidate: ValidityCheckDto = this.createCandidate(exchange, market, precision, precisionMode, symbol, quantity, price);

    let checkedTrade = this.checkCost(tradeCandidate, limits);
    if (checkedTrade.validity) {
      // Continues checks only if cost is valid.
      checkedTrade = await this.checkQuantity(checkedTrade, limits, precision, precisionMode);
      checkedTrade = await this.checkPrice(checkedTrade, limits, precision, precisionMode);
      // If any checks has failed, check if cost condition is still respected by suggested trade
      if (!checkedTrade.validity) {
        checkedTrade = this.checkCost(checkedTrade, limits);
      }
    }

    return checkedTrade;
  }

  async checkPriceFormatOnly(exchange: string, symbol: string, price: number): Promise<ValidityCheckDto> {
    const formatRules = await this.setRules(exchange, symbol);
    const market = Object.keys(formatRules)[0];
    const { limits, precision, precisionMode } = formatRules[market];
    const tradeCandidate: ValidityCheckDto = this.createCandidate(exchange, market, precision, precisionMode, symbol, undefined, price);
    const checkedTrade = await this.checkPrice(tradeCandidate, limits, precision, precisionMode);
    return checkedTrade;
  }

  async checkQuantityFormatOnly(exchange: string, symbol: string, quantity: number): Promise<ValidityCheckDto> {
    const formatRules = await this.setRules(exchange, symbol);
    const market = Object.keys(formatRules)[0];
    const { limits, precision, precisionMode } = formatRules[market];
    const tradeCandidate: ValidityCheckDto = this.createCandidate(exchange, market, precision, precisionMode, symbol, quantity, undefined);
    const checkedTrade = await this.checkQuantity(tradeCandidate, limits, precision, precisionMode);
    return checkedTrade;
  }

  private async checkQuantity(
    tradeCandidate: ValidityCheckDto,
    limits: any,
    precision: any,
    precisionMode: DigitsCountingPrecisionMode
  ): Promise<ValidityCheckDto> {
    let { exchange, checkList, validity, suggestedInput, comments } = tradeCandidate;

    if (precisionMode !== DigitsCountingPrecisionMode.DECIMAL_PLACES && precisionMode !== DigitsCountingPrecisionMode.TICK_SIZE) {
      // SIGNIFICANT_DIGITS or inexistant
      throw new Error("This precision mode is not handled by upbots API.");
    }

    if (precisionMode === DigitsCountingPrecisionMode.DECIMAL_PLACES) {
      if (this.getInputDecimalPlacesPrecision(tradeCandidate.suggestedInput.quantity) <= precision.amount === false) {
        // Precision of amount must be <= precision['amount']
        suggestedInput = {
          ...suggestedInput,
          quantity: await this.exchangeProxy.decimalToPrecision(tradeCandidate.suggestedInput.quantity, precision.amount),
        };
        comments += `Quantity precision is not correct (Expected precision: ${precision.amount}). `;
        checkList.quantityPrecision = false;
        validity = false;
      } else {
        checkList.quantityPrecision = true;
      }
    }
    if (precisionMode === DigitsCountingPrecisionMode.TICK_SIZE) {
      if (precision.amount) {
        if (this.isMultipleOfPrecision(tradeCandidate.suggestedInput.quantity, precision.amount) === false) {
          suggestedInput = {
            ...suggestedInput,
            quantity: await this.exchangeProxy.decimalToPrecision(tradeCandidate.suggestedInput.quantity, precision.amount),
          };
          if (suggestedInput.quantity === 0 && precision.amount) {
            suggestedInput.quantity = precision.amount; // fix Tick_size returns 0 behavior
          }
          comments += `Quantity precision is not correct (Expected to be a multiple of ${precision.amount}). `;
          checkList.quantityPrecision = false;
          validity = false;
        } else {
          checkList.quantityPrecision = true;
        }
      } else {
        comments += `${exchange} API doesn't provide specifications regarding quantity precision. `;
        checkList.quantityPrecision = true;
      }
    }

    if (limits.amount) {
      if (limits.amount.min && tradeCandidate.suggestedInput.quantity >= limits.amount.min === false) {
        // Order amount >= limits['min']['amount']
        suggestedInput = {
          ...suggestedInput,
          quantity: limits.amount.min,
        };
        comments += `Quantity is too small (Min: ${limits.amount.min}). `;
        checkList.quantityLimit = false;
        validity = false;
      } else if (limits.amount.max && tradeCandidate.suggestedInput.quantity <= limits.amount.max === false) {
        // Order amount <= limits['max']['amount']
        suggestedInput = {
          ...suggestedInput,
          quantity: limits.amount.max,
        };
        comments = `Quantity is too big (Max: ${limits.amount.max}). `;
        checkList.quantityLimit = false;
        validity = false;
      } else {
        checkList.quantityLimit = true;
      }
    } else {
      comments += `${exchange} API doesn't provide specifications regarding quantity limits. `;
      checkList.quantityLimit = true;
    }

    const checkedTrade: ValidityCheckDto = {
      ...tradeCandidate,
      validity,
      checkList,
      suggestedInput,
      comments,
    };

    return checkedTrade;
  }

  private async checkPrice(
    tradeCandidate: ValidityCheckDto,
    limits: any,
    precision: any,
    precisionMode: DigitsCountingPrecisionMode
  ): Promise<ValidityCheckDto> {
    let { exchange, checkList, validity, suggestedInput, comments } = tradeCandidate;

    if (precisionMode !== DigitsCountingPrecisionMode.DECIMAL_PLACES && precisionMode !== DigitsCountingPrecisionMode.TICK_SIZE) {
      // SIGNIFICANT_DIGITS or inexistant
      throw new Error("This precision mode is not handled by upbots API.");
    }

    if (precisionMode === DigitsCountingPrecisionMode.DECIMAL_PLACES) {
      if (this.getInputDecimalPlacesPrecision(tradeCandidate.suggestedInput.price) <= precision.price === false) {
        // Precision of price must be <= precision['price']
        suggestedInput = {
          ...suggestedInput,
          price: await this.exchangeProxy.decimalToPrecision(tradeCandidate.suggestedInput.price, precision.price),
        };
        comments += `Price precision is not correct (Expected precision: ${precision.price}). `;
        checkList.pricePrecision = false;
        validity = false;
      } else {
        checkList.pricePrecision = true;
      }
    }
    if (precisionMode === DigitsCountingPrecisionMode.TICK_SIZE) {
      if (precision.price) {
        if (this.isMultipleOfPrecision(tradeCandidate.suggestedInput.price, precision.price) === false) {
          suggestedInput = {
            ...suggestedInput,
            price: await this.exchangeProxy.decimalToPrecision(tradeCandidate.suggestedInput.price, precision.price),
          };
          if (suggestedInput.price === 0 && precision.price) {
            suggestedInput.price = precision.price; // fix Tick_size returns 0 behavior
          }
          comments += `Price precision is not correct (Expected to be a multiple of ${precision.price}). `;
          checkList.pricePrecision = false;
          validity = false;
        } else {
          checkList.pricePrecision = true;
        }
      } else {
        comments += `${exchange} API doesn't provide specifications regarding price precision. `;
        checkList.pricePrecision = true;
      }
    }

    if (limits.price) {
      if (limits.price.min && tradeCandidate.suggestedInput.price >= limits.price.min === false) {
        // Order price >= limits['min']['price']
        suggestedInput = {
          ...suggestedInput,
          price: limits.price.min,
        };
        comments = `Price is too small (Min: ${limits.price.min}). `;
        checkList.priceLimit = false;
        validity = false;
      } else if (limits.price.max && tradeCandidate.suggestedInput.price <= limits.price.max === false) {
        // Order price <= limits['max']['price']
        suggestedInput = {
          ...suggestedInput,
          price: limits.price.max,
        };
        comments += `Price is too big (Max: ${limits.price.max}). `;
        checkList.priceLimit = false;
        validity = false;
      } else {
        checkList.priceLimit = true;
      }
    } else {
      comments += `${exchange} API doesn't provide specifications regarding price limits. `;
      checkList.priceLimit = true;
    }

    const checkedTrade: ValidityCheckDto = {
      ...tradeCandidate,
      validity,
      checkList,
      suggestedInput,
      comments,
    };

    return checkedTrade;
  }

  private checkCost(tradeCandidate: ValidityCheckDto, limits: any): ValidityCheckDto {
    let { exchange, checkList, validity, suggestedInput, comments } = tradeCandidate;
    const cost = suggestedInput.quantity * suggestedInput.price;

    if (limits.cost.min && cost >= limits.cost.min === false) {
      // Order cost (amount * price) >= limits['min']['cost']
      comments += `Total trade cost is too small (Min: ${limits.cost.min}). Modify either quantity or price. `;
      checkList.costLimit = false;
      suggestedInput = {};
      validity = false;
    } else if (limits.cost.max && cost <= limits.cost.max === false) {
      // Order cost (amount * price) <= limits['max']['cost']
      comments += `Total trade cost is too big (Max: ${limits.cost.max}). Modify either quantity or price.`;
      checkList.costLimit = false;
      suggestedInput = {};
      validity = false;
    } else if (!limits.cost.min && !limits.cost.max) {
      comments += `${exchange} API doesn't provide specifications regarding total trade cost limits. `;
      checkList.costLimit = true;
    } else {
      checkList.costLimit = true;
    }

    const checkedTrade: ValidityCheckDto = {
      ...tradeCandidate,
      validity,
      checkList,
      suggestedInput,
      comments,
    };

    return checkedTrade;
  }

  private getInputDecimalPlacesPrecision(input: number): number {
    if (input.toString().split(".")[1]) {
      return input.toString().split(".")[1].length;
    }
    return 0;
  }

  private isMultipleOfPrecision(input: number, precision: number): boolean {
    if (input % precision === 0) {
      return true;
    }
    return false;
  }

  private async setRules(exchange: string, symbol: string, baseCurrency?: string, quoteCurrency?: string): Promise<FormatRules> {
    let orderFormats = { formatRules: {} };
    if (baseCurrency && quoteCurrency) {
      orderFormats = await this.settingsService.getOrderFormatByCurrency(exchange, baseCurrency, quoteCurrency);
    } else {
      orderFormats = await this.settingsService.getOrderFormats(exchange, [], [symbol]);
    }
    const { formatRules } = orderFormats;
    this.exchangeProxy = await this.proxyFactoryService.setExchangeProxy(exchange);

    if (Object.keys(formatRules).length === 0) {
      throw new Error(`Couldn't find ${symbol} in ${exchange}.`);
    }

    return formatRules;
  }

  private createCandidate(
    exchange: string,
    market: string,
    precision: Precision,
    precisionMode: DigitsCountingPrecisionMode,
    symbol: string,
    quantity?: number,
    price?: number
  ): ValidityCheckDto {
    let suggestedInput = {};
    if (quantity !== undefined) suggestedInput = { ...suggestedInput, quantity };
    if (price) suggestedInput = { ...suggestedInput, price };
    // console.log(suggestedInput);
    return {
      exchange,
      market,
      symbol,
      validity: true, // Default, becomes false if any checks fails.
      checkList: {},
      suggestedInput,
      precisionMode,
      precisionRules: precision,
      comments: "",
    };
  }
}
