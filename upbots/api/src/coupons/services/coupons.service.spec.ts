import { Test, TestingModule } from "@nestjs/testing";
import CouponsService from "./coupons.service";

describe("CouponsService", () => {
  let sut: CouponsService;

  beforeEach(async () => {
    const couponServiceMockFactory = jest.fn<Partial<CouponsService>, []>(() => ({}));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CouponsService,
          useClass: couponServiceMockFactory,
        },
      ],
    }).compile();

    sut = module.get<CouponsService>(CouponsService);
  });

  it("should be defined", () => {
    expect(sut).toBeDefined();
  });
});
