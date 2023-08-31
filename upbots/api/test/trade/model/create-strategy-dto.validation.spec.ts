import { validate } from "class-validator";
import { CreateManualSignalStrategyDto, OrderSideType, Entry } from "../../../src/trade/model/create-strategy-dto";

describe("CreateManualSignalStrategyDto", () => {
  let sut: CreateManualSignalStrategyDto;
  const validatorOptions = {};
  //   describe(`'multiple entries' validation`, () => {});
  //   describe(`'entryRange' validation`, () => {});
  function setDefault(stratDto: CreateManualSignalStrategyDto): CreateManualSignalStrategyDto {
    const res = stratDto;
    res.apiKeyRef = "pubkey";
    res.quantity = 1;
    res.stopLoss = 100;
    res.entries = [
      {
        quantity: 1,
        price: 200,
        isLimit: false,
        isMarket: true,
      } as Entry,
    ];
    res.symbol = "BTCUSDT";
    res.exchange = "binance";
    res.side = OrderSideType.BUY;
    return res;
  }
  beforeAll(() => {
    sut = new CreateManualSignalStrategyDto();
  });

  it(`validation should fail if empty class'`, async () => {
    const actual = await validate(sut, validatorOptions);
    expect(actual).toBeDefined();
    expect(actual.length).toBeGreaterThan(0);
  });

  it(`validation should fail if entry is missing'`, async () => {
    // sut.orderType=
    // sut.entries//missing
    // sut.entryRange// missing
    const strat = setDefault(sut);

    const actual = await validate(strat, validatorOptions);
    expect(actual).toBeDefined();
    expect(actual.length).toBeGreaterThan(0);
  });

  it(`validation should fail if both entry range and multi entry are present'`, async () => {
    const strat = setDefault(sut);
    strat.entries = [
      {
        quantity: 0.5,
        price: 200,
        isLimit: false,
        isMarket: true,
      } as Entry,
      {
        isLimit: true,
        isMarket: false,
        quantity: 0.5,
        price: 150,
      } as Entry,
    ];
    strat.entryRange = {
      buyRangeMin: 150,
      buyRangeMax: 160,
    };

    const actual = await validate(strat, validatorOptions);
    expect(actual).toBeDefined();
    expect(actual.length).toBeGreaterThan(0);
    // console.log('validation error {}', actual[0].toString());
  });
});
