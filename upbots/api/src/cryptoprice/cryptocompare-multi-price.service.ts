import { Injectable, HttpService, HttpStatus, HttpException, Logger, CACHE_MANAGER, Inject } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { AxiosRequestConfig } from "axios";
import { Cache } from "cache-manager";
import { map, tap } from "rxjs/operators";
import { Model } from "mongoose";
import * as moment from "moment";
import { CryptoCompare } from "../types/cryptoCompare";
import { ExchangeRates, ExchangeRatesError, ExchangeRatesResponse } from "../types";

@Injectable()
export default class CryptoCompareMultiPriceService {
  private readonly logger = new Logger(CryptoCompareMultiPriceService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private configService: ConfigService,
    @InjectModel("CryptoCompare") private CryptoCompareModel: Model<CryptoCompare>
  ) {}

  async listCryptoPrices(fromSymbols: string[], toSymbols: string[]): Promise<ExchangeRates> {
    // WARNING : ASYNCHRONICITY
    this.logger.debug(`listCryptoPrices call fromSymbols/toSymbols: ${fromSymbols}/${toSymbols}`);
    const maxlength = 250;

    // remove duplicates
    const uniqueFromSymbols = [...new Set(fromSymbols)];
    this.logger.debug(`listCryptoPrices uniqueFromSymbols: ${uniqueFromSymbols}`);

    // MAXLENGTH OK
    const fsymsJoined = uniqueFromSymbols.join(",");
    if (fsymsJoined.length <= maxlength) {
      const rates: ExchangeRates = await this.getCryptoPrices(uniqueFromSymbols, toSymbols);
      // THIS IS FOR WRONG OXYGEN COIN
      const fixedRates = await this.fixCryptoPrices(rates);
      return Promise.resolve(fixedRates);
    }

    // SPLIT from symbols as MAXLENGTH EXCEEDED
    const fsymsList = new Array<string[]>();
    let fsymsOccurence = fsymsJoined;
    // security for infinite loop : i < 1000
    for (let i = 0; i < 1000 && fsymsOccurence.length > maxlength; ) {
      const position = fsymsOccurence.substr(0, maxlength).lastIndexOf(",");
      fsymsList.push(fsymsOccurence.substr(0, position).split(","));
      fsymsOccurence = fsymsOccurence.substr(position + 1);
      i += 1;
    }
    fsymsList.push(fsymsOccurence.split(","));

    // CONSOLIDATE OUTPUT RATES
    const rates: ExchangeRates = {};
    /* eslint-disable-next-line no-restricted-syntax */
    for (const fsyms of fsymsList) {
      /* eslint-disable-next-line no-await-in-loop */
      const fsymsRates = await this.getCryptoPrices(fsyms, toSymbols);
      Object.keys(fsymsRates).forEach((key) => {
        rates[key] = fsymsRates[key];
      });
    }

    // THIS IS FOR WRONG OXYGEN COIN
    const fixedRates = await this.fixCryptoPrices(rates);
    return Promise.resolve(fixedRates);
  }

  async oldGetCryptoPrices(fromSymbols: string[], toSymbols: string[]): Promise<ExchangeRates> {
    const apiKey = this.configService.get<string>("CRYPTO_COMPARE_API_KEY");
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Apikey ${apiKey}`,
      },
    };
    const apiUrl = `${process.env.CRYPTO_COMPARE_API}/data/pricemulti?fsyms=${fromSymbols.join(",")}&tsyms=${toSymbols.join(",")}`;
    this.logger.log(`getCryptoPrices call: ${apiUrl}`);

    return this.httpService
      .get<ExchangeRatesResponse>(apiUrl, config)
      .pipe(
        // tap((x) => this.logger.debug(`get multipe price rates cryptoCompare API response status: ${x.status}`)),
        // TODO: handle cryptocompare error (even when status is 200): parse response and look for Response: "error"
        map((x) => x.data),
        tap((x) => this.logger.debug(`get multipe price rates: ${JSON.stringify(x)}`))
      )
      .toPromise()
      .then((d) => {
        if (!d) {
          return Promise.reject(new HttpException("No multi-price not found", HttpStatus.FAILED_DEPENDENCY));
        }
        const err = d as ExchangeRatesError;
        if (err.Response) {
          // error handling
          this.logger.error(`listCryptoPrices (cryptoCompare) error: ${err.Response} msg: ${err.Message}, type: ${err.Type}`);
          if (err.Type === 2) {
            // Type 2:
            // - there is no data
            // - input param such as fsyms or tsyms empty
            // - input param such as fsyms or tsyms invalid as maxlength reached
            return Promise.reject(new HttpException(`No multi-price no data: ${err.Message}`, HttpStatus.NOT_FOUND));
          }
          return Promise.reject(new HttpException(`Multi-price error: ${err.Message}`, HttpStatus.BAD_GATEWAY));
        }

        return d as ExchangeRates;
      });
  }

  async getCryptoPrices(fromSymbols: string[], toSymbols: string[]): Promise<ExchangeRates> {
    let cryptoCompareFromSymbols = this.configService.get<string>("CRYPTOCOMPARE_FROM_SYMBOLS");
    let cryptoCompareToSymbols = this.configService.get<string>("CRYPTOCOMPARE_TO_SYMBOLS");
    cryptoCompareFromSymbols = cryptoCompareFromSymbols
      .split(",")
      .sort((a, b) => a.localeCompare(b))
      .join(",")
      .toLowerCase();
    cryptoCompareToSymbols = cryptoCompareToSymbols
      .split(",")
      .sort((a, b) => a.localeCompare(b))
      .join(",")
      .toLowerCase();

    // sort strings
    const sortedFromSymbols = fromSymbols
      .sort((a, b) => a.localeCompare(b))
      .join(",")
      .toLowerCase();
    const sortedToSymbols = toSymbols
      .sort((a, b) => a.localeCompare(b))
      .join(",")
      .toLowerCase();

    let cryptoCompare = await this.CryptoCompareModel.findOne({
      fromLists: cryptoCompareFromSymbols,
      toLists: cryptoCompareToSymbols,
    });
    const coinsIncluded = cryptoCompareFromSymbols.includes(sortedFromSymbols) && cryptoCompareToSymbols.includes(sortedToSymbols);
    if (cryptoCompare) {
      // last update less then 10 minutes
      if (coinsIncluded && moment(cryptoCompare.updatedAt).add(20, "minutes").isAfter(new Date())) {
        // get only toSymbols
        this.logger.log(`getCryptoPrices data from cache`);
        return cryptoCompare.data as ExchangeRates;
      }
    } else {
      cryptoCompare = await this.CryptoCompareModel.create({ fromLists: cryptoCompareFromSymbols, toLists: cryptoCompareToSymbols });
    }

    const apiKey = this.configService.get<string>("CRYPTO_COMPARE_API_KEY");
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Apikey ${apiKey}`,
      },
    };

    let apiUrl = `${process.env.CRYPTO_COMPARE_API}/data/pricemulti?fsyms=${sortedFromSymbols}&tsyms=${sortedToSymbols}`;
    if (coinsIncluded) {
      apiUrl = `${process.env.CRYPTO_COMPARE_API}/data/pricemulti?fsyms=${cryptoCompareFromSymbols}&tsyms=${cryptoCompareToSymbols}`;
    }
    this.logger.log(`getCryptoPrices call: ${apiUrl}`);

    return this.httpService
      .get<ExchangeRatesResponse>(apiUrl, config)
      .pipe(
        // tap((x) => this.logger.debug(`get multipe price rates cryptoCompare API response status: ${x.status}`)),
        // TODO: handle cryptocompare error (even when status is 200): parse response and look for Response: "error"
        map((x) => x.data),
        tap((x) => this.logger.debug(`get multipe price rates: ${JSON.stringify(x)}`))
      )
      .toPromise()
      .then((d) => {
        if (!d) {
          return Promise.reject(new HttpException("No multi-price not found", HttpStatus.FAILED_DEPENDENCY));
        }
        const err = d as ExchangeRatesError;
        if (err.Response) {
          // error handling
          this.logger.error(`listCryptoPrices (cryptoCompare) error: ${err.Response} msg: ${err.Message}, type: ${err.Type}`);
          if (err.Type === 2) {
            // Type 2:
            // - there is no data
            // - input param such as fsyms or tsyms empty
            // - input param such as fsyms or tsyms invalid as maxlength reached
            return Promise.reject(new HttpException(`No multi-price no data: ${err.Message}`, HttpStatus.NOT_FOUND));
          }
          return Promise.reject(new HttpException(`Multi-price error: ${err.Message}`, HttpStatus.BAD_GATEWAY));
        }
        if (coinsIncluded) {
          cryptoCompare.data = d;
          cryptoCompare.save();
        }

        return d as ExchangeRates;
      });
  }

  async getCryptoPricesByCoingeckoAPI(fromSymbols: string[], toSymbols: string[]): Promise<ExchangeRates> {
    const primaryResult = await this.cache.get("get_gecko_coin_rates");
    const primarySymbols = await this.cache.get("get_gecko_coin_symbols");

    const currentSymbols = `${fromSymbols.join(",")},${toSymbols.join(",")}`;

    if (primaryResult && primarySymbols === currentSymbols) {
      this.logger.debug(`Get crypto prices (cache data): ${currentSymbols}`);
      return JSON.parse(primaryResult) as ExchangeRates;
    }
    this.logger.debug(`Get crypto prices from CoinGecko API: ${currentSymbols}`);
    const COINGECKO_API = "https://api.coingecko.com/api/v3/simple/price";
    const apiUrl = `${COINGECKO_API}?ids=${fromSymbols.join(",")}&vs_currencies=${toSymbols.join(",")}`;

    return this.httpService
      .get<ExchangeRatesResponse>(apiUrl)
      .pipe(
        // tap((x) => this.logger.debug(`get multipe price rates cryptoCompare API response status: ${x.status}`)),
        // TODO: handle cryptocompare error (even when status is 200): parse response and look for Response: "error"
        map((x) => x.data),
        tap((x) => this.logger.debug(`coingecko-get multipe price rates: ${JSON.stringify(x)}`))
      )
      .toPromise()
      .then((d) => {
        if (!d) {
          return Promise.reject(new HttpException("coingecko-No multi-price not found", HttpStatus.FAILED_DEPENDENCY));
        }
        const err = d as ExchangeRatesError;
        if (err.Response) {
          // error handling
          this.logger.error(`coingecko-listCryptoPrices (cryptoCompare) error: ${err.Response} msg: ${err.Message}, type: ${err.Type}`);
          if (err.Type === 2) {
            // Type 2:
            // - there is no data
            // - input param such as fsyms or tsyms empty
            // - input param such as fsyms or tsyms invalid as maxlength reached
            return Promise.reject(new HttpException(`coingecko-No multi-price no data: ${err.Message}`, HttpStatus.NOT_FOUND));
          }
          return Promise.reject(new HttpException(`coingecko-Multi-price error: ${err.Message}`, HttpStatus.BAD_GATEWAY));
        }
        const result = d as ExchangeRates;
        this.cache.set("get_gecko_coin_symbols", currentSymbols, { ttl: 60 });
        this.cache.set("get_gecko_coin_rates", JSON.stringify(result), { ttl: 60 });
        return result;
      });
  }

  /**
   * workaround to derive all exchange rates that have a mistake since not available in cryptocompre api
   * example coin: oxygen
   */
  async fixCryptoPrices(rates: ExchangeRates): Promise<ExchangeRates> {
    const newRates = { ...rates };
    if (newRates.OXY) {
      const coingeckoPrices: any = await this.getCryptoPricesByCoingeckoAPI(["oxygen"], ["btc", "eur", "usd"]);
      if (coingeckoPrices && coingeckoPrices.oxygen) {
        const oxygenRate = { BTC: coingeckoPrices.oxygen.btc, EUR: coingeckoPrices.oxygen.eur, USD: coingeckoPrices.oxygen.usd };
        newRates.OXY = oxygenRate;
      }
    }
    return Promise.resolve(newRates);
  }
}
