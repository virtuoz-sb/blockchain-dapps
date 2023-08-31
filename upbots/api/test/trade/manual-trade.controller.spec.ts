import { Test, TestingModule } from "@nestjs/testing";

import { ConfigModule } from "@nestjs/config";
import DirectOrderService from "../../src/trade/services/direct-order.sevice";
import { CreateDirectOrderDto, OrderCreatedResponseDto } from "../../src/trade/model/create-simple-order.dto";
import StrategyOrderTradeController from "../../src/trade/strategy-order.controller";
import StrategyRequestService from "../../src/trade/services/strategy-request.service";
import { CreateManualSignalStrategyDto, StratCreatedResponseDto } from "../../src/trade/model/create-strategy-dto";
import TradeStrategyDataService from "../../src/trade/services/trade-strategy-data-service";
import TradeOrdersDataService from "../../src/trade/services/trade-orders-data-service";
import { PriceStrategy } from "../../src/trade/model/price-strategy-dto";
import { OrderTrackingDto } from "../../src/trade/model/order-tracking.dto";
import SettingsService from "../../src/settings/services/settings.service";
import TradeFormatValidity from "../../src/trade/services/trade-format-validity.service";

describe("ManualTrade Controller", () => {
  let controller: StrategyOrderTradeController;
  let requestNewStrategyMock: jest.Mock<Promise<StratCreatedResponseDto>, [string, CreateManualSignalStrategyDto]>;
  beforeEach(async () => {
    requestNewStrategyMock = jest.fn((userId: string, data: CreateManualSignalStrategyDto) => {
      const r = new StratCreatedResponseDto();
      r.id = "fake-strat-id-unit-test";
      return Promise.resolve(r);
    });
    const serviceFactory = jest.fn<Partial<StrategyRequestService>, []>(() => ({
      requestNewStrategy: requestNewStrategyMock,
    }));

    const getUserStrategiesMock = jest.fn((userId: string, page, pageSize: number) => {
      return Promise.resolve(new Array<PriceStrategy>());
    });
    const stratDataServiceFactory = jest.fn<Partial<TradeStrategyDataService>, []>(() => ({
      getUserStrategies: getUserStrategiesMock,
    }));

    const getTradeOrdersMock = jest.fn((userId, stratId: string) => {
      return Promise.resolve(new Array<OrderTrackingDto>());
    });
    const ordersDataServiceFactory = jest.fn<Partial<TradeOrdersDataService>, []>(() => ({
      getTradeOrders: getTradeOrdersMock,
    }));
    const settingsServiceFactory = jest.fn<Partial<SettingsService>, []>(() => ({}));
    const tradeFormatValidityServiceFactory = jest.fn<Partial<TradeFormatValidity>, []>(() => ({}));

    const simpleOrderMock = jest.fn((userId: string, data: CreateDirectOrderDto) => {
      return Promise.resolve(new OrderCreatedResponseDto());
    });
    const simpleOrderServiceFactory = jest.fn<Partial<DirectOrderService>, []>(() => ({
      directOrder: simpleOrderMock,
    }));

    // this.stratService.strategyExist(user.id, stratId)
    const module: TestingModule = await Test.createTestingModule({
      // NO NEED FOR MONGOOSE module on unit test as services dependencies are MOCKED
      imports: [
        ConfigModule.forRoot({
          envFilePath: [".env", ".env.dev"],
          isGlobal: true,
        }),
        // MongooseModule.forRoot(process.env.MONGODB_URI_TEST, {
        //   useNewUrlParser: true,
        //   useUnifiedTopology: true,
        // }),
        // MongooseModule.forFeature([
        //   { name: "PriceStrategyModel", schema: PriceStrategySchema },
        // ]),
      ],
      controllers: [StrategyOrderTradeController],
      providers: [
        {
          provide: StrategyRequestService,
          useClass: serviceFactory,
        },
        {
          provide: TradeStrategyDataService,
          useClass: stratDataServiceFactory,
        },
        {
          provide: TradeOrdersDataService,
          useClass: ordersDataServiceFactory,
        },
        {
          provide: SettingsService,
          useClass: settingsServiceFactory,
        },
        {
          provide: TradeFormatValidity,
          useClass: tradeFormatValidityServiceFactory,
        },
        {
          provide: DirectOrderService,
          useClass: simpleOrderServiceFactory,
        },
      ],
    }).compile();
    controller = module.get<StrategyOrderTradeController>(StrategyOrderTradeController);
  });
  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
  // it("does nothing", () => {
  // });
});
