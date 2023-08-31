/* eslint-disable no-plusplus */
import { Test, TestingModule } from "@nestjs/testing";
import { HttpService } from "@nestjs/common";
import { PartialBalances } from "ccxt";
import { getModelToken } from "@nestjs/mongoose";
import PortfolioService from "../../../src/portfolio/services/portfolio.service";
import ExchangeKeyService from "../../../src/exchange-key/services/exchange-key.service";
import SettingsService from "../../../src/settings/services/settings.service";
import {
  CredentialInfo,
  PortfolioSummary,
  BtcAmount,
  AccountTotal,
  DistributionOverview,
  DistributionAmount,
  ExchangeCredentials,
} from "../../../src/portfolio/models";
import { ExchangeRates } from "../../../src/types";
import BinanceProxy from "../../../src/exchangeProxy/services/binance-proxy";
import BinanceUsProxy from "../../../src/exchangeProxy/services/binanceus-proxy";
import BinanceFutureProxy from "../../../src/exchangeProxy/services/binance-future-proxy";
import BitmexProxy from "../../../src/exchangeProxy/services/bitmex-proxy";
import FtxProxy from "../../../src/exchangeProxy/services/ftx-proxy";
import { integer4Precision } from "../../../src/utilities/math.util";
import { Evolution } from "../../../src/portfolio/models/evolution.schema";
import { ExchangeBalance } from "../../../src/exchangeProxy/models/exchange-balance.model";
import BitmexTestProxy from "../../../src/exchangeProxy/services/bitmex_test-proxy";
import HuobiproProxy from "../../../src/exchangeProxy/services/huobipro-proxy";
import ConversionRateService from "../../../src/cryptoprice/conversion-rate.service";
import KucoinProxy from "../../../src/exchangeProxy/services/kucoin-proxy";
import KucoinFutureProxy from "../../../src/exchangeProxy/services/kucoin-future-proxy";
import OkexProxy from "../../../src/exchangeProxy/services/okex-proxy";
import FtxFutureProxy from "../../../src/exchangeProxy/services/ftx-future-proxy";
import CoinBaseProProxy from "../../../src/exchangeProxy/services/coinbasepro-proxy";
import { ExchangeSettingsReponse } from "../../../src/settings/models/exchange-settings.dto";
import ProxyFactoryService from "../../../src/exchangeProxy/services/proxy-factory.service";

describe("PortfolioService", () => {
  let sut: PortfolioService;
  let findCredentialsForExchangeMock: jest.Mock<Promise<CredentialInfo[]>, [string, string[]]>;
  let getRatesMock: jest.Mock<Promise<ExchangeRates>, [string[]]>;
  let getTotalBalanceMock: jest.Mock<Promise<ExchangeBalance>, [string, string, ExchangeCredentials]>;
  let getExchangesSettingsMock: jest.Mock<Promise<ExchangeSettingsReponse>>;
  const precision = 12;
  const btcInEuroRate = 6150.42;
  const btcInUsdRate = 7050.42;
  const usdtInUsdRate = 1.002;

  // helper functions
  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const stubRates = (xcurrencyStartIndex, eurRate, usdRate: number, ...otherRates: number[]) => {
    let x = {
      BTC: {
        BTC: 1,
        USD: usdRate,
        EUR: eurRate,
      },
    } as ExchangeRates;
    otherRates.forEach((v, i) => {
      x = {
        ...x,
        // adding X00, X01, X02, X03, X04 currencies
        [`X${zeroPad(i + xcurrencyStartIndex, 2)}`]: {
          BTC: v,
        },
      };
    });
    return x;
  };

  const btc2eur = (amount: number, rate: number = btcInEuroRate) => amount * rate;
  const btc2usd = (amount: number, rate: number = btcInUsdRate) => amount * rate;

  /**
   * each unit test will have its own testing module and mock instances
   */
  beforeEach(async () => {
    findCredentialsForExchangeMock = jest.fn();
    getRatesMock = jest.fn();
    getTotalBalanceMock = jest.fn();
    getExchangesSettingsMock = jest.fn();

    const keyServiceMockFactory = jest.fn<Partial<ExchangeKeyService>, []>(() => ({
      getDecryptedExchangeCredentials: findCredentialsForExchangeMock,
    }));
    const ConversionRateServiceMockFactory = jest.fn<Partial<ConversionRateService>, []>(() => ({
      getConversionRates: getRatesMock,
    }));
    const BinanceProxyMockFactory = jest.fn<Partial<BinanceProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const BinanceUsProxyMockFactory = jest.fn<Partial<BinanceUsProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const BinanceFutureProxyMockFactory = jest.fn<Partial<BinanceFutureProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));

    const BitmexProxyMockFactory = jest.fn<Partial<BitmexProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const BitmexTestProxyMockFactory = jest.fn<Partial<BitmexTestProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const HuobiproProxyMockFactory = jest.fn<Partial<HuobiproProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const KucoinProxyMockFactory = jest.fn<Partial<KucoinProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const KucoinFutureProxyMockFactory = jest.fn<Partial<KucoinProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const OkexProxyMockFactory = jest.fn<Partial<OkexProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const FtxProxyMockFactory = jest.fn<Partial<FtxProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const FtxFutureProxyMockFactory = jest.fn<Partial<FtxFutureProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const CoinBaseProProxyMockFactory = jest.fn<Partial<CoinBaseProProxy>, []>(() => ({
      getTotalBalance: getTotalBalanceMock,
    }));
    const SettingsServiceMockFactory = jest.fn<Partial<SettingsService>, []>(() => ({
      getExchangesSettings: getExchangesSettingsMock,
    }));
    const HttpsServiceMockFactory = jest.fn<Partial<HttpService>, []>(() => ({}));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: ExchangeKeyService, useClass: keyServiceMockFactory },
        {
          provide: ConversionRateService,
          useClass: ConversionRateServiceMockFactory,
        },
        {
          provide: ProxyFactoryService,
          useClass: ProxyFactoryService,
        },
        { provide: BinanceProxy, useClass: BinanceProxyMockFactory },
        { provide: BinanceUsProxy, useClass: BinanceUsProxyMockFactory },
        { provide: BinanceFutureProxy, useClass: BinanceFutureProxyMockFactory },
        { provide: BitmexProxy, useClass: BitmexProxyMockFactory },
        { provide: BitmexTestProxy, useClass: BitmexTestProxyMockFactory },
        { provide: HuobiproProxy, useClass: HuobiproProxyMockFactory },
        { provide: FtxProxy, useClass: FtxProxyMockFactory },
        { provide: KucoinProxy, useClass: KucoinProxyMockFactory },
        { provide: KucoinFutureProxy, useClass: KucoinFutureProxyMockFactory },
        { provide: OkexProxy, useClass: OkexProxyMockFactory },
        { provide: FtxFutureProxy, useClass: FtxFutureProxyMockFactory },
        { provide: CoinBaseProProxy, useClass: CoinBaseProProxyMockFactory },
        { provide: SettingsService, useClass: SettingsServiceMockFactory },
        { provide: HttpService, useClass: HttpsServiceMockFactory },
        {
          provide: getModelToken(Evolution.name),
          useValue: {}, // new mockUserModel(),
        },
      ],
    }).compile();

    sut = module.get<PortfolioService>(PortfolioService);
  });

  it("should be defined (injection set up)", () => {
    expect(sut).toBeDefined();
  });

  describe("when 1 key account set up for a UNKNOWN exchange", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      const credInfo = [
        {
          id: "id1",
          keyName: "keyname",
          exchangeName: "UNKNOWN",
          valid: true,
          credentials: {
            apiKey: "apikey",
            secret: "secretkey",
          },
        },
      ] as CredentialInfo[];
      const exchangeSettings = {
        compatibleExchanges: [{ name: "binance", label: "Binance" }],
        tradingSettings: [],
      } as ExchangeSettingsReponse;
      getExchangesSettingsMock.mockResolvedValue(exchangeSettings);
      findCredentialsForExchangeMock.mockResolvedValue(credInfo);
      getTotalBalanceMock.mockResolvedValue({} as ExchangeBalance);
      getRatesMock.mockResolvedValue({} as ExchangeRates);
    });

    it("should throw an error", async () => {
      expect(sut.getPortforlioSummary("user@unit.test")).rejects.toThrow(
        "UNKNOWN is not handled by the api, please update app settings and check if Proxy is existing."
      );
    });
  });

  describe("when no key account set up", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      const credInfo = [] as CredentialInfo[];
      findCredentialsForExchangeMock.mockResolvedValue(credInfo);
      getTotalBalanceMock.mockResolvedValue({} as ExchangeBalance);
      getRatesMock.mockResolvedValue({} as ExchangeRates);
      const exchangeSettings = {
        compatibleExchanges: [{ name: "binance", label: "Binance" }],
        tradingSettings: [],
      } as ExchangeSettingsReponse;
      getExchangesSettingsMock.mockResolvedValue(exchangeSettings);
    });

    it("should return empty portfolio summary", async () => {
      const expected = new PortfolioSummary();
      expect(await sut.getPortforlioSummary("user@unit.test")).toStrictEqual(expected);
    });

    it("should should not call the balance", async () => {
      await sut.getPortforlioSummary("user@unit.test");

      expect(getTotalBalanceMock).not.toHaveBeenCalled();
      // expect(getTotalBalanceMock).toHaveBeenCalledTimes(0);
    });

    it("should should not call the crypto price", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getRatesMock).toHaveBeenCalledTimes(0);
    });
  });

  // --------------------------
  // -------  1 KEY  ----------
  // --------------------------
  describe("when 1 key account set up", () => {
    beforeEach(() => {
      // jest.resetAllMocks();
      const credInfo = [
        {
          id: "id1",
          keyName: "keyname",
          exchangeName: "binance",
          valid: true,
          credentials: {
            apiKey: "apikey",
            secret: "secretkey",
          },
        },
      ] as CredentialInfo[];
      const exchangeSettings = {
        compatibleExchanges: [{ name: "binance", label: "Binance" }],
        tradingSettings: [],
      } as ExchangeSettingsReponse;
      getExchangesSettingsMock.mockResolvedValue(exchangeSettings);
      findCredentialsForExchangeMock.mockResolvedValue(credInfo);
      getTotalBalanceMock.mockResolvedValue({
        exchange: "binance",
        subAccountBalances: [],
        totalBalances: {
          BTC: 1,
          X02: 5, // crypto 2
          X03: 0.002,
          X04: 0,
          X05: 0,
        } as PartialBalances,
      } as ExchangeBalance);
      getRatesMock.mockResolvedValueOnce(stubRates(2, btcInEuroRate, btcInUsdRate, 0.5, 0.1));
    });

    it("should return converted portfolio summary", async () => {
      const expected = new PortfolioSummary();
      const totBtc = 1 + 2.5 + 0.0002;
      const total = new BtcAmount({
        btc: totBtc,
        eur: btc2eur(totBtc),
        usd: btc2usd(totBtc),
      });
      expected.accounts.push({
        id: "id1",
        name: "keyname",
        exchange: "binance",
        subAccounts: [],
        total,
      } as AccountTotal);
      expected.aggregated = total; // only one key hence same total

      const distri = new DistributionOverview();
      distri.BTC = new DistributionAmount({
        btc: 1,
        eur: btc2eur(1),
        usd: btc2usd(1),
        percentage: integer4Precision(1 / totBtc),
        currency: "BTC",
        currencyAmount: 1,
      });
      distri.X02 = new DistributionAmount({
        btc: 2.5, // x02 converted to btc
        eur: btc2eur(2.5),
        usd: btc2usd(2.5),
        percentage: integer4Precision(2.5 / totBtc),
        currency: "X02",
        currencyAmount: 5,
      });
      distri.X03 = new DistributionAmount({
        btc: 0.0002, // x03 converted to btc
        eur: btc2eur(0.0002),
        usd: btc2usd(0.0002),
        percentage: integer4Precision(0.0002 / totBtc),
        currency: "X03",
        currencyAmount: 0.002,
      });
      expected.distribution = distri;

      expected.ignoredCurrencies = [];

      // ACT and ASSERT
      expect(await sut.getPortforlioSummary("user@unit.test")).toStrictEqual(expected);
    });

    it("should call crypto prices", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getRatesMock).toHaveBeenCalledTimes(1);
    });

    it("should fetch balance from exchange", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getTotalBalanceMock).toHaveBeenCalledTimes(1);
    });
  });

  // --------------------------
  // -------  1 KEY with USDT conversion  ----------
  // --------------------------
  describe("when 1 key account set up with USDT conversion", () => {
    beforeEach(() => {
      // jest.resetAllMocks();
      const credInfo = [
        {
          id: "keyid1",
          keyName: "keyname",
          exchangeName: "binance",
          valid: true,
          credentials: {
            apiKey: "apikey",
            secret: "secretkey",
          },
        },
      ] as CredentialInfo[];
      const exchangeSettings = {
        compatibleExchanges: [{ name: "binance", label: "Binance" }],
        tradingSettings: [],
      } as ExchangeSettingsReponse;
      getExchangesSettingsMock.mockResolvedValue(exchangeSettings);
      findCredentialsForExchangeMock.mockResolvedValue(credInfo);
      getTotalBalanceMock.mockResolvedValue({
        exchange: "binance",
        subAccountBalances: [],
        totalBalances: {
          USDT: 100,
          BTC: 0.1, // crypto 2
        } as PartialBalances,
      });
      const rates = stubRates(0, btcInEuroRate, btcInUsdRate);
      const usdtInBtc = usdtInUsdRate / btcInUsdRate;

      rates.USDT = {
        BTC: usdtInBtc,
        USD: usdtInUsdRate,
      };
      getRatesMock.mockResolvedValueOnce(rates);
    });

    function isObjectNumberFieldCloseTo(toCompare: object, expected: object) {
      Object.getOwnPropertyNames(toCompare).forEach((k) => {
        if (typeof toCompare[k] === "number") {
          expect(toCompare[k]).toBeCloseTo(expected[k], precision);
        }
      });
    }

    it("should return converted portfolio summary", async () => {
      const expected = new PortfolioSummary();
      const usdtInBtc = (100.0 * usdtInUsdRate) / btcInUsdRate; // 100 USDT in btc
      const totBtc = 0.1 + usdtInBtc;
      const total = new BtcAmount({
        btc: totBtc,
        eur: btc2eur(totBtc),
        usd: btc2usd(totBtc),
      });
      expected.accounts.push({
        id: "keyid1",
        name: "keyname",
        exchange: "binance",
        subAccounts: [],
        total,
      } as AccountTotal);
      expected.aggregated = total; // only one key hence same total

      const distri = new DistributionOverview();
      distri.USDT = new DistributionAmount({
        btc: usdtInBtc,
        eur: btc2eur(usdtInBtc),
        usd: btc2usd(usdtInBtc),
        percentage: integer4Precision(usdtInBtc / totBtc),
        currency: "USDT",
        currencyAmount: 100,
      });
      distri.BTC = new DistributionAmount({
        btc: 0.1, // x02 converted to btc
        eur: btc2eur(0.1),
        usd: btc2usd(0.1),
        percentage: integer4Precision(0.1 / totBtc),
        currency: "BTC",
        currencyAmount: 0.1,
      });
      expected.distribution = distri;

      // ACT and ASSERT
      const sum = await sut.getPortforlioSummary("user@unit.test");
      expect(sum.accounts).toStrictEqual(expected.accounts);
      expect(sum.aggregated).toStrictEqual(expected.aggregated);
      expect(sum.distribution.BTC).toStrictEqual(expected.distribution.BTC);
      isObjectNumberFieldCloseTo(sum.distribution.USDT, expected.distribution.USDT);
    });

    it("should call crypto prices", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getRatesMock).toHaveBeenCalledTimes(1); // all rates are called in one go
    });

    it("should fetch balance from exchange", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getTotalBalanceMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when 3 key accounts set up", () => {
    beforeEach(() => {
      // jest.resetAllMocks();
      const credInfo = [
        {
          id: "keyid1",
          keyName: "keyname",
          exchangeName: "binance",
          valid: true,
          credentials: {
            apiKey: "apikey",
            secret: "secretkey",
          },
        },
        {
          id: "keyid2",
          keyName: "keyname2",
          exchangeName: "binance", // same exchange but different key
          valid: true,
          credentials: {
            apiKey: "apikey2",
            secret: "secretkey2",
          },
        },
        {
          id: "keyid3",
          keyName: "keyname3",
          exchangeName: "binance",
          valid: true,
          credentials: {
            apiKey: "apikey3",
            secret: "secretkey3",
          },
        },
      ] as CredentialInfo[];
      const exchangeSettings = {
        compatibleExchanges: [{ name: "binance", label: "Binance" }],
        tradingSettings: [],
      } as ExchangeSettingsReponse;
      getExchangesSettingsMock.mockResolvedValue(exchangeSettings);
      findCredentialsForExchangeMock.mockResolvedValue(credInfo);
      getTotalBalanceMock
        .mockResolvedValueOnce({
          exchange: "binance",
          subAccountBalances: [],
          totalBalances: {
            BTC: 1,
            x02: 5, // crypto 2
            x03: 0.002,
            x04: 0,
            x05: 0,
          } as PartialBalances,
        })
        .mockResolvedValueOnce({
          exchange: "binance",
          subAccountBalances: [],
          totalBalances: {
            BTC: 0,
            x02: 1,
            x03: 0,
            x04: 1, // crypto 4
            x05: 0,
          },
        })
        .mockResolvedValueOnce({
          exchange: "binance",
          subAccountBalances: [],
          totalBalances: {
            BTC: 0,
            x02: 0,
            x03: 0,
            x04: 1, // crypto 4
            x05: 1,
          },
        });
      getRatesMock.mockResolvedValueOnce(stubRates(2, btcInEuroRate, btcInUsdRate, 0.5, 0.1, 2, 5, 66666666666666666666));
    });

    it("should return converted portfolio summary with 3 totals and 1 aggregated", async () => {
      const expected = new PortfolioSummary();
      const total1 = 1 + 2.5 + 0.0002;
      const total2 = 0.5 + 2;
      const total3 = 2 + 5;
      const eurConversionRate = 6150.42; // btc in eur
      const usdConversionRate = 7050.42; // btc in usd
      const total = new BtcAmount({
        btc: total1 + total2 + total3,
        eur: (total1 + total2 + total3) * eurConversionRate,
        usd: (total1 + total2 + total3) * usdConversionRate,
      });
      expected.accounts.push(
        {
          id: "keyid1",
          name: "keyname",
          exchange: "binance",
          subAccounts: [],
          total: new BtcAmount({
            btc: total1,
            eur: total1 * eurConversionRate,
            usd: total1 * usdConversionRate,
          }),
        },
        {
          id: "keyid2",
          name: "keyname2",
          exchange: "binance",
          subAccounts: [],
          total: new BtcAmount({
            btc: total2,
            eur: total2 * eurConversionRate,
            usd: total2 * usdConversionRate,
          }),
        },
        {
          id: "keyid3",
          name: "keyname3",
          exchange: "binance",
          subAccounts: [],
          total: new BtcAmount({
            btc: total3,
            eur: total3 * eurConversionRate,
            usd: total3 * usdConversionRate,
          }),
        }
      );
      expected.aggregated = total;
      const actual = await sut.getPortforlioSummary("user@unit.test");
      expect(actual.accounts).toStrictEqual(expected.accounts);
      expect(actual.aggregated).toStrictEqual(expected.aggregated);
      // expect(actual.distribution).toStrictEqual(expected.distribution); // see other test case
    });

    it("should call crypto prices", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getRatesMock).toHaveBeenCalledTimes(1); // all rates are called in one go
    });

    it("should fetch balance from exchange", async () => {
      await sut.getPortforlioSummary("user@unit.test");
      expect(getTotalBalanceMock).toHaveBeenCalledTimes(3);
    });
  });

  // TEST REPARTITION
  describe("when 2 key accounts and many crypto distribution in portfolio", () => {
    let totalBtc = 0;
    let rates: number[];
    let cryptoValues: number[];
    let cryptoValuesInBtc: number[];

    beforeEach(() => {
      // jest.resetAllMocks();
      const credInfo = [
        {
          keyName: "keyname",
          exchangeName: "binance",
          valid: true,
          credentials: {
            apiKey: "apikey",
            secret: "secretkey",
          },
        },
        {
          keyName: "keyname2",
          exchangeName: "binance",
          valid: true,
          credentials: {
            apiKey: "apikey2",
            secret: "secretkey2",
          },
        },
      ] as CredentialInfo[];
      const exchangeSettings = {
        compatibleExchanges: [{ name: "binance", label: "Binance" }],
        tradingSettings: [],
      } as ExchangeSettingsReponse;
      getExchangesSettingsMock.mockResolvedValue(exchangeSettings);
      findCredentialsForExchangeMock.mockResolvedValue(credInfo);
      const p1 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]; // btc at index 0
      const p2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1]; // portfolio balances 2
      rates = [1, 0.5, 0.1, 2, 5, 10, 20, 30, 40, 50, 60, 70]; // btc at index 0
      cryptoValues = p1.map<number>((val, i) => val + p2[i]); // sum crypto accross portfolios
      cryptoValuesInBtc = cryptoValues.map((val, i) => val * rates[i]);
      totalBtc = cryptoValuesInBtc.reduce((prev, curr) => prev + curr, 0);
      getTotalBalanceMock
        .mockResolvedValueOnce({
          exchange: "binance",
          subAccountBalances: [],
          totalBalances: {
            btc: p1[0],
            x01: p1[1], // crypto 2
            x02: p1[2],
            x03: p1[3],
            x04: p1[4],
            x05: p1[5],
            x06: p1[6],
            x07: p1[7],
            x08: p1[8],
          } as PartialBalances,
        })
        .mockResolvedValueOnce({
          exchange: "binance",
          subAccountBalances: [],
          totalBalances: {
            btc: p2[0],
            x09: p2[9],
            x10: p2[10],
            x11: p2[11],
          },
        });
      // note that the order matters
      getRatesMock.mockResolvedValueOnce(stubRates(1, 6150.42, 7050.42, 0.5, 0.1, 2, 5, 10, 20, 30, 40, 50, 60, 70));
    });

    it("should return a percentage repartition that sums up to 1", async () => {
      const actual: PortfolioSummary = await sut.getPortforlioSummary("user@unit.test");
      expect(actual.distribution).toBeDefined();
      // expect(getTotalBalanceMock).toHaveBeenCalledTimes(3);

      // sum should be 100%
      let percentage = 0;
      const currencies: string[] = [];
      Object.entries(actual.distribution).forEach(([key, value]) => {
        percentage += value.percentage;
        currencies.push(key);
      });
      /*   for (const [key, value] of Object.entries(actual.distribution)) {
        // console.log(key);
        // console.log(value);
        percentage += value.percentage;
        currencies.push(key);
      } */
      expect(percentage).toBe(10000); // since we use integer4Precision() 100%=10000
    });

    it("should return the 8 largest currencies (converted to BTC) repartition accross all exchange-keys", async () => {
      const expectedDistri = new DistributionOverview();
      expectedDistri.x11 = new DistributionAmount({
        btc: cryptoValuesInBtc[11],
        eur: btc2eur(cryptoValuesInBtc[11]),
        usd: btc2usd(cryptoValuesInBtc[11]),
        percentage: integer4Precision(cryptoValuesInBtc[11] / totalBtc),
        currency: "x11",
        currencyAmount: cryptoValues[11],
      });
      expectedDistri.x10 = new DistributionAmount({
        btc: cryptoValuesInBtc[10],
        eur: btc2eur(cryptoValuesInBtc[10]),
        usd: btc2usd(cryptoValuesInBtc[10]),
        percentage: integer4Precision(cryptoValuesInBtc[10] / totalBtc),
        currency: "x10",
        currencyAmount: cryptoValues[10],
      });
      expectedDistri.x09 = new DistributionAmount({
        btc: cryptoValuesInBtc[9],
        eur: btc2eur(cryptoValuesInBtc[9]),
        usd: btc2usd(cryptoValuesInBtc[9]),
        percentage: integer4Precision(cryptoValuesInBtc[9] / totalBtc),
        currency: "x09",
        currencyAmount: cryptoValues[9],
      });
      expectedDistri.x08 = new DistributionAmount({
        btc: cryptoValuesInBtc[8],
        eur: btc2eur(cryptoValuesInBtc[8]),
        usd: btc2usd(cryptoValuesInBtc[8]),
        percentage: integer4Precision(cryptoValuesInBtc[8] / totalBtc),
        currency: "x08",
        currencyAmount: cryptoValues[8],
      });
      expectedDistri.x07 = new DistributionAmount({
        btc: cryptoValuesInBtc[7],
        eur: btc2eur(cryptoValuesInBtc[7]),
        usd: btc2usd(cryptoValuesInBtc[7]),
        percentage: integer4Precision(cryptoValuesInBtc[7] / totalBtc),
        currency: "x07",
        currencyAmount: cryptoValues[7],
      });
      expectedDistri.x06 = new DistributionAmount({
        btc: cryptoValuesInBtc[6],
        eur: btc2eur(cryptoValuesInBtc[6]),
        usd: btc2usd(cryptoValuesInBtc[6]),
        percentage: integer4Precision(cryptoValuesInBtc[6] / totalBtc),
        currency: "x06",
        currencyAmount: cryptoValues[6],
      });
      expectedDistri.x05 = new DistributionAmount({
        btc: cryptoValuesInBtc[5],
        eur: btc2eur(cryptoValuesInBtc[5]),
        usd: btc2usd(cryptoValuesInBtc[5]),
        percentage: integer4Precision(cryptoValuesInBtc[5] / totalBtc),
        currency: "x05",
        currencyAmount: cryptoValues[5],
      });
      expectedDistri.x04 = new DistributionAmount({
        btc: cryptoValuesInBtc[4],
        eur: btc2eur(cryptoValuesInBtc[4]),
        usd: btc2usd(cryptoValuesInBtc[4]),
        percentage: integer4Precision(cryptoValuesInBtc[4] / totalBtc),
        currency: "x04",
        currencyAmount: cryptoValues[4],
      });

      // compute remaining percentage
      let mainPercentage = 0;
      Object.entries(expectedDistri).forEach(([key, val]) => {
        if (key !== "other") {
          mainPercentage += val.percentage;
        }
      });
      /*  for (const [key, val] of Object.entries(expectedDistri)) {
        if (key !== "other") {
          mainPercentage += val.percentage;
        }
      } */
      expectedDistri.other = new DistributionAmount({
        currency: "BTC",
        currencyAmount: 3.6,
        percentage: 1e4 - mainPercentage,
        btc: 3.6,
        eur: btc2eur(3.6),
        usd: btc2usd(3.6),
      });

      // ACT
      const actual = await sut.getPortforlioSummary("user@unit.test", null, null, 8);
      expect(actual.distribution).toBeDefined();
      expect(actual.distribution).toStrictEqual(expectedDistri);
      // expect(getTotalBalanceMock).toHaveBeenCalledTimes(3);

      const currencies: string[] = [];
      Object.entries(actual.distribution).forEach(([key]) => {
        currencies.push(key);
      });
      /*  for (const [key, value] of Object.entries(actual.distribution)) {
        currencies.push(key);
      } */
      expect(currencies).toContain("x11");
      expect(currencies).toContain("x10");
      expect(currencies).toContain("x09");
      expect(currencies).toContain("x08");
      expect(currencies).toContain("x07");
      expect(currencies).toContain("x06");
      expect(currencies).toContain("x05");
      expect(currencies).toContain("x04");
      expect(currencies).toContain("other");
    });

    it.only("when X01..X11 + BTC balance, it should return ALL 12 currencies (converted to BTC) repartition accross all exchange-keys", async () => {
      const expectedDistri = new DistributionOverview();

      for (let index = 11; index >= 1; index--) {
        const currency = `x${`00${index}`.slice(-2)}`;
        if (currency !== "x02") {
          expectedDistri[currency] = new DistributionAmount({
            btc: cryptoValuesInBtc[index],
            eur: btc2eur(cryptoValuesInBtc[index]),
            usd: btc2usd(cryptoValuesInBtc[index]),
            percentage: integer4Precision(cryptoValuesInBtc[index] / totalBtc),
            currency,
            currencyAmount: cryptoValues[index],
          });
        } else {
          // x02 currency is the smallest one, hence is percentage is updated to account for floating errors and make sure the total percentage is 10000
          expectedDistri[currency] = new DistributionAmount({
            btc: cryptoValuesInBtc[index],
            eur: btc2eur(cryptoValuesInBtc[index]),
            usd: btc2usd(cryptoValuesInBtc[index]),
            percentage: 2,
            currency,
            currencyAmount: cryptoValues[index],
          });
        }
      }

      // no other currency
      expectedDistri.btc = new DistributionAmount({
        currency: "btc",
        currencyAmount: cryptoValues[0],
        percentage: integer4Precision(cryptoValuesInBtc[0] / totalBtc),
        btc: cryptoValuesInBtc[0],
        eur: btc2eur(cryptoValuesInBtc[0]),
        usd: btc2usd(cryptoValuesInBtc[0]),
      });

      // ACT
      const actual = await sut.getPortforlioSummary("user@unit.test"); // allcoins
      expect(actual.distribution).toBeDefined();
      expect(actual.distribution).toStrictEqual(expectedDistri);
      // expect(getTotalBalanceMock).toHaveBeenCalledTimes(3);

      const currencies: string[] = [];
      Object.entries(actual.distribution).forEach(([key]) => {
        currencies.push(key);
      });
      /*  for (const [key, value] of Object.entries(actual.distribution)) {
        currencies.push(key);
      } */
      expect(currencies).toContain("x11");
      expect(currencies).toContain("x10");
      expect(currencies).toContain("x09");
      expect(currencies).toContain("x08");
      expect(currencies).toContain("x07");
      expect(currencies).toContain("x06");
      expect(currencies).toContain("x05");
      expect(currencies).toContain("x04");
      expect(currencies).toContain("x03");
      expect(currencies).toContain("x02");
      expect(currencies).toContain("x01");
      expect(currencies).toContain("btc");
    });
  });
});
