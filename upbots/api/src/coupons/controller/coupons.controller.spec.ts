import { Test, TestingModule } from "@nestjs/testing";
import CouponsService from "../services/coupons.service";
import CouponsServiceData from "../services/coupons.service.data";
import CouponsController from "./coupons.controller";

describe("Coupons Controller", () => {
  let sut: CouponsController;

  beforeEach(async () => {
    const couponServiceMockFactory = jest.fn<Partial<CouponsService>, []>(() => ({}));
    const couponServiceDataMockFactory = jest.fn<Partial<CouponsServiceData>, []>(() => ({}));
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponsController],
      providers: [
        {
          provide: CouponsService,
          useClass: couponServiceMockFactory,
        },
        {
          provide: CouponsServiceData,
          useClass: couponServiceDataMockFactory,
        },
      ],
    }).compile();

    sut = module.get<CouponsController>(CouponsController);
  });

  it("should be defined", () => {
    expect(sut).toBeDefined();
  });
});
