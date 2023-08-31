/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { DigitsCountingPrecisionMode } from "../../../src/db_seeds/precision-mode";
import TradeFormatValidity from "../../../src/trade/services/trade-format-validity.service";
import SettingsService from "../../../src/settings/services/settings.service";
import BinanceProxy from "../../../src/exchangeProxy/services/binance-proxy";
import BitmexProxy from "../../../src/exchangeProxy/services/bitmex-proxy";
import ExchangeKeyDataService from "../../../src/exchange-key/services/exchange-key.data.service";
import { TradeFormatsDto } from "../../../src/settings/models/exchange-settings.dto";
import { MinMax, Precision } from "../../../src/settings/models/market-pair-settings.model";
import ProxyFactoryService from "../../../src/exchangeProxy/services/proxy-factory.service";

describe("Trade format validity service", () => {
  let service: TradeFormatValidity;
  let exchangeKeyDataService: ExchangeKeyDataService;
  let confInstance: ConfigService;
  let getOrderFormatsMock: jest.Mock<Promise<TradeFormatsDto>>;
  let setExchangeProxyMock: jest.Mock<BinanceProxy | BitmexProxy, [string]>;

  /**
   * each unit test will have its own testing module and mock instances
   */
  beforeEach(async () => {
    getOrderFormatsMock = jest.fn();
    setExchangeProxyMock = jest.fn();

    const settingsServiceFactory = jest.fn<Partial<SettingsService>, []>(() => ({
      getOrderFormats: getOrderFormatsMock,
    }));
    const ProxyFactoryServiceMock = jest.fn<Partial<ProxyFactoryService>, []>(() => ({
      setExchangeProxy: setExchangeProxyMock,
    }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeFormatValidity,
        {
          provide: SettingsService,
          useClass: settingsServiceFactory,
        },
        {
          provide: ProxyFactoryService,
          useClass: ProxyFactoryServiceMock,
        },
        ConfigService,
      ],
    }).compile();
    service = module.get<TradeFormatValidity>(TradeFormatValidity);
    confInstance = module.get<ConfigService>(ConfigService);
  });

  it("should be defined (injection set up)", () => {
    expect(service).toBeDefined();
  });

  describe("When format rules is empty", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      const tradeFormats: TradeFormatsDto = {
        exchange: "{exchange}",
        formatRules: {},
      };
      getOrderFormatsMock.mockResolvedValue(tradeFormats);
      setExchangeProxyMock.mockReturnValue(new BinanceProxy(exchangeKeyDataService, confInstance));
    });

    it("should throw an error", async () => {
      await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1, 1)).rejects.toThrow(
        "Couldn't find {symbol} in {exchange}."
      );
    });
  });

  describe("When format rules is not empty and has exhaustive conditions (limits & precision)", () => {
    const tradeFormats: TradeFormatsDto = {
      exchange: "binance",
      formatRules: {
        "{market}": {
          symbol: "{symbol}",
          // pairType: "{pairType}",
          limits: {
            amount: { min: 0.01, max: 1000 },
            price: { min: 0.00001, max: 1000 },
            cost: { min: 0.0001, max: 100000 },
          },
          precisionMode: DigitsCountingPrecisionMode.DECIMAL_PLACES,
          precision: {
            amount: 2,
            price: 5,
          } as Precision,
        },
      },
    };

    const tradeFormatsBitmex: TradeFormatsDto = {
      exchange: "bitmex",
      formatRules: {
        "{market}": {
          symbol: "{symbol}",
          // pairType: "{pairType}",
          limits: {
            amount: { min: 0.01, max: 1000 },
            price: { min: 0.00001, max: 1000 },
            cost: { min: 0.0001, max: 100000 },
          },
          precisionMode: DigitsCountingPrecisionMode.TICK_SIZE,
          precision: {
            amount: 2,
            price: 5,
          } as Precision,
        },
      },
    };

    const tradeFormatsWithoutCostLimit: TradeFormatsDto = {
      exchange: "binance",
      formatRules: {
        "{market}": {
          symbol: "{symbol}",
          // pairType: "{pairType}", //deprecated
          limits: {
            amount: { min: 0.01, max: 1000 },
            price: { min: 0.00001, max: 1000 },
            cost: {} as MinMax,
          },
          precisionMode: DigitsCountingPrecisionMode.DECIMAL_PLACES,
          precision: {
            amount: 2,
            price: 5,
          } as Precision,
        },
      },
    };

    const tradeFormatsWithoutMaxLimit: TradeFormatsDto = {
      exchange: "binance",
      formatRules: {
        "{market}": {
          symbol: "{symbol}",
          // pairType: "{pairType}",
          limits: {
            amount: { min: 1 } as MinMax,
            price: { min: 1 } as MinMax,
            cost: { min: 2 } as MinMax,
          },
          precisionMode: DigitsCountingPrecisionMode.DECIMAL_PLACES,
          precision: {
            amount: 2,
            price: 5,
          } as Precision,
        },
      },
    };

    const tradeFormatsWithoutMinLimit: TradeFormatsDto = {
      exchange: "binance",
      formatRules: {
        "{market}": {
          symbol: "{symbol}",
          // pairType: "{pairType}",
          limits: {
            amount: { max: 10 } as MinMax,
            price: { max: 10 } as MinMax,
            cost: { max: 100 } as MinMax,
          },
          precisionMode: DigitsCountingPrecisionMode.DECIMAL_PLACES,
          precision: {
            amount: 2,
            price: 5,
          } as Precision,
        },
      },
    };

    beforeEach(() => {
      jest.resetAllMocks();
      getOrderFormatsMock.mockResolvedValue(tradeFormats);
      setExchangeProxyMock.mockReturnValue(new BinanceProxy(exchangeKeyDataService, confInstance));
    });

    it("should return an object with a checkList, a validity, a suggested trade and comments.", async () => {
      await service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1, 1).then((response) => {
        expect(
          Object.keys(response).includes("validity") &&
            Object.keys(response).includes("checkList") &&
            Object.keys(response).includes("suggestedInput") &&
            Object.keys(response).includes("comments")
        ).toStrictEqual(true);
      });
    });

    describe("When it checks valid trades", () => {
      it("should return an object with validity=true, check-list values true, suggested trade = initial trade", async () => {
        const couples = [
          [1, 1],
          [0.01, 1],
          [0.05, 1],
          [100, 0.00005],
          [500.67, 0.00001],
          [100, 1000],
          [50.99, 35],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: true,
            checkList: { costLimit: true, quantityLimit: true, priceLimit: true, quantityPrecision: true, pricePrecision: true },
            suggestedInput: { quantity, price },
          });
        }
      });
    });

    describe("When it checks trades with cost issues", () => {
      it("should return an object with validity=false, checklist with costLimit=false, and no suggested trade", async () => {
        const couples = [
          [1000, 1000],
          [0, 100],
          [100, 0],
          [0.01, 0.00001],
          [0.05, 0.000001],
          [990, 880],
          [990.89798, 1000],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: false },
            suggestedInput: {},
          });
        }
      });
    });

    describe("When it checks trades with valid cost but minimum quantity limit issues", () => {
      it("should return an object with validity=false, checkList with quantityLimit=false and a valid suggested trade", async () => {
        const { min } = tradeFormats.formatRules["{market}"].limits.amount;
        const couples = [
          [0.001, 1000],
          [0.0099, 1000],
        ];

        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityLimit: false },
            suggestedInput: { quantity: min, price },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, min, price)).resolves.toMatchObject({
            validity: true,
          });
        }
      });
    });

    describe("When it checks trades with valid cost but maximum quantity limit issues", () => {
      it("should return an object with validity=false, checkList with quantityLimit=false and a valid suggested trade", async () => {
        const { max } = tradeFormats.formatRules["{market}"].limits.amount;
        const couples = [
          [1001, 0.0001],
          [2000, 0.0001],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityLimit: false },
            suggestedInput: { quantity: max, price },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, max, price)).resolves.toMatchObject({
            validity: true,
          });
        }
      });
    });

    describe("When it checks trades with valid cost but minimum price limit issues", () => {
      it("should return an object with validity=false, checkList with priceLimit=false and a valid suggested trade", async () => {
        const { min } = tradeFormats.formatRules["{market}"].limits.price;
        const couples = [
          [1000, 0.0000099],
          [1000, 0.0000005],
        ];

        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, priceLimit: false },
            suggestedInput: { quantity, price: min },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, min)).resolves.toMatchObject({
            validity: true,
          });
        }
      });
    });

    describe("When it checks trades with valid cost but maximum price limit issues", () => {
      it("should return an object with validity=false, checkList with priceLimit=false and a valid suggested trade", async () => {
        const { max } = tradeFormats.formatRules["{market}"].limits.price;
        const couples = [
          [1, 1500],
          [1, 5000.90865],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, priceLimit: false },
            suggestedInput: { quantity, price: max },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, max)).resolves.toMatchObject({
            validity: true,
          });
        }
      });
    });

    describe("When it checks trades with no cost condition but any other limit combination issues", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        getOrderFormatsMock.mockResolvedValue(tradeFormatsWithoutCostLimit);
        setExchangeProxyMock.mockReturnValue(new BinanceProxy(exchangeKeyDataService, confInstance));
      });

      it("should return an object with validity=false, and checkList with relevant feedback and a valid suggested trade", async () => {
        const maxQ = tradeFormatsWithoutCostLimit.formatRules["{market}"].limits.amount.max;
        const maxP = tradeFormatsWithoutCostLimit.formatRules["{market}"].limits.price.max;
        const minQ = tradeFormatsWithoutCostLimit.formatRules["{market}"].limits.amount.min;
        const minP = tradeFormatsWithoutCostLimit.formatRules["{market}"].limits.price.min;

        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100000000, 100000000)).resolves.toMatchObject({
          validity: false,
          checkList: { priceLimit: false, quantityLimit: false, costLimit: true },
          suggestedInput: { quantity: maxQ, price: maxP },
        });
        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, maxQ, maxP)).resolves.toMatchObject({ validity: true });

        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.00000001, 0.0000001)).resolves.toMatchObject({
          validity: false,
          checkList: { priceLimit: false, quantityLimit: false, costLimit: true },
          suggestedInput: { quantity: minQ, price: minP },
        });
        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, minQ, minP)).resolves.toMatchObject({ validity: true });

        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.000000001, 100000000)).resolves.toMatchObject({
          validity: false,
          checkList: { priceLimit: false, quantityLimit: false, costLimit: true },
          suggestedInput: { quantity: minQ, price: maxP },
        });
        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, maxQ, maxP)).resolves.toMatchObject({ validity: true });

        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100000000, 0.00000001)).resolves.toMatchObject({
          validity: false,
          checkList: { priceLimit: false, quantityLimit: false, costLimit: true },
          suggestedInput: { quantity: maxQ, price: minP },
        });
        await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, minQ, minP)).resolves.toMatchObject({ validity: true });
      });
    });

    describe("When it checks trades with valid cost but maximum price limit issues", () => {
      it("should return an object with validity=false, checkList with priceLimit=false and a valid suggested trade", async () => {
        const { max } = tradeFormats.formatRules["{market}"].limits.price;
        const couples = [
          [1, 1500],
          [1, 5000.90865],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, priceLimit: false },
            suggestedInput: { quantity, price: max },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, max)).resolves.toMatchObject({
            validity: true,
          });
        }
      });
    });

    describe("When it checks trades with cost issues and there are quantity or price issues", () => {
      it("should reject the trade based on the cost issue with no suggested trade doesn't matter the other limit issues", async () => {
        const couples = [
          [1000000, 1000000],
          [0, 0],
          [1000000000000000, 0.0000000009],
          [0.0000000009, 1000000000000000],
          [0.000000000000007, 0.00000000000009],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: false },
            suggestedInput: {},
          });
        }
      });
    });

    describe("When precision mode is DECIMAL_PLACES", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        getOrderFormatsMock.mockResolvedValue(tradeFormats);
        setExchangeProxyMock.mockReturnValue(new BinanceProxy(exchangeKeyDataService, confInstance));
      });

      it("should be valid", async () => {
        const couples = [
          [0.01, 10],
          [10, 0.00001],
          [0.2, 10],
          [10, 0.0005],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: true,
          });
        }
      });

      describe("When it checks trades with quantity precision issues", () => {
        it("should return an object with validity=false, checKlist with quantityPrecision=false and a valid suggested trade", async () => {
          const couples = [
            [0.001, 100],
            [0.0100001, 100],
            [0.0100001, 100],
            [0.01098701, 100],
          ];
          for (const couple of couples) {
            const [quantity, price] = couple;
            await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
              validity: false,
              checkList: { costLimit: true, quantityPrecision: false },
              suggestedInput: { quantity: 0.01, price },
            });
            await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.01, price)).resolves.toMatchObject({
              validity: true,
            });
          }
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.1048973, 100)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityPrecision: false },
            suggestedInput: { quantity: 0.1, price: 100 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.1, 100)).resolves.toMatchObject({ validity: true });
        });
      });

      describe("When it checks trades with price precision issues", () => {
        it("should return an object with validity=false, checKlist with quantityPrecision=false and a valid suggested trade", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 0.000010001)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, pricePrecision: false },
            suggestedInput: { quantity: 100, price: 0.00001 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 0.00001)).resolves.toMatchObject({
            validity: true,
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 0.000019001)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, pricePrecision: false },
            suggestedInput: { quantity: 100, price: 0.00002 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 0.00002)).resolves.toMatchObject({
            validity: true,
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1000, 0.000001)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, pricePrecision: false },
            suggestedInput: { quantity: 1000, price: 0.00001 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1000, 0.00001)).resolves.toMatchObject({
            validity: true,
          });
        });
      });

      describe("When it checks trades with cost issues and there are quantity or price precision issues", () => {
        it("should reject the trade based on the cost issue with no suggested trade doesn't matter the other precision issues", async () => {
          const couples = [
            [1000000.0000000001, 1000000.0000001],
            [1000000000000000.000000009, 0.0000000009],
            [0.0000000009, 1000000000000000.0000000056789],
          ];
          for (const couple of couples) {
            const [quantity, price] = couple;
            await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
              validity: false,
              checkList: { costLimit: false },
              suggestedInput: {},
            });
          }
        });
      });
    });

    describe("When precision mode is TICK_SIZE", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        getOrderFormatsMock.mockResolvedValue(tradeFormatsBitmex);
        setExchangeProxyMock.mockReturnValue(new BitmexProxy(exchangeKeyDataService, confInstance));
      });

      it("should be valid", async () => {
        const couples = [
          [2, 10],
          [12, 5],
        ];
        for (const couple of couples) {
          const [quantity, price] = couple;
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, quantity, price)).resolves.toMatchObject({
            validity: true,
          });
        }
      });

      describe("When it checks trades with quantity precision issues", () => {
        it("should return an object with validity=false, checKlist with quantityPrecision=false and a valid suggested trade", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.1048973, 100)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityPrecision: false },
            suggestedInput: { quantity: 2, price: 100 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 2, 100)).resolves.toMatchObject({ validity: true });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 3, 100)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityPrecision: false },
            suggestedInput: { quantity: 4, price: 100 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 4, 100)).resolves.toMatchObject({ validity: true });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 39, 100)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityPrecision: false },
            suggestedInput: { quantity: 40, price: 100 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 40, 100)).resolves.toMatchObject({ validity: true });
        });
      });

      describe("When it checks trades with price precision issues", () => {
        it("should return an object with validity=false, checKlist with quantityPrecision=false and a valid suggested trade", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 0.000010001)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, pricePrecision: false },
            suggestedInput: { quantity: 100, price: 5 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 6)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, pricePrecision: false },
            suggestedInput: { quantity: 100, price: 5 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 5)).resolves.toMatchObject({ validity: true });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 49)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, pricePrecision: false },
            suggestedInput: { quantity: 100, price: 50 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 50)).resolves.toMatchObject({ validity: true });
        });
      });

      describe("When it checks trades with any combinations of precision issues", () => {
        it("should return an object with validity=false, checKlist with relevant feedback and a valid suggested trade", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.2, 0.900010001)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityPrecision: false, pricePrecision: false },
            suggestedInput: { quantity: 2, price: 5 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 2, 5)).resolves.toMatchObject({ validity: true });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 39, 49)).resolves.toMatchObject({
            validity: false,
            checkList: { costLimit: true, quantityPrecision: false, pricePrecision: false },
            suggestedInput: { quantity: 40, price: 50 },
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 40, 50)).resolves.toMatchObject({ validity: true });
        });
      });
    });

    describe("When formatRules is not empty but have uncomplete min limits conditions", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        getOrderFormatsMock.mockResolvedValue(tradeFormatsWithoutMinLimit);
        setExchangeProxyMock.mockReturnValue(new BinanceProxy(exchangeKeyDataService, confInstance));
      });

      describe("When other conditions are valid", () => {
        it("should return on object with validity=true", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1, 1)).resolves.toMatchObject({ validity: true });
        });
      });

      describe("When other conditions are not valid", () => {
        it("should return on object with validity=true", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1, 1000)).resolves.toMatchObject({ validity: false });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1000, 1)).resolves.toMatchObject({ validity: false });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 10000000, 10000000)).resolves.toMatchObject({
            validity: false,
          });
        });
      });
    });

    describe("When formatRules is not empty but have uncomplete max limits conditions", () => {
      beforeEach(() => {
        jest.resetAllMocks();
        getOrderFormatsMock.mockResolvedValue(tradeFormatsWithoutMaxLimit);
        setExchangeProxyMock.mockReturnValue(new BinanceProxy(exchangeKeyDataService, confInstance));
      });

      describe("When other conditions are valid", () => {
        it("should return on object with validity=true", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 10, 10)).resolves.toMatchObject({ validity: true });
        });
      });

      describe("When other conditions are not valid", () => {
        it("should return on object with validity=true", async () => {
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 0.1, 100)).resolves.toMatchObject({
            validity: false,
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 100, 0.1)).resolves.toMatchObject({
            validity: false,
          });
          await expect(service.checkTradeFormat("{exchange}", "{symbol}", null, null, 1, 1)).resolves.toMatchObject({ validity: false });
        });
      });
    });
  });
});
