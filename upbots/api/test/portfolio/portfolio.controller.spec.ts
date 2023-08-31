import { Test, TestingModule } from "@nestjs/testing";
import { CacheModule } from "@nestjs/common";
import { UserIdentity } from "../../src/types";
import PortfolioController from "../../src/portfolio/portfolio.controller";
import PortfolioService from "../../src/portfolio/services/portfolio.service";
import { PortfolioSummary } from "../../src/portfolio/models";

describe("Portfolio Controller", () => {
  let sut: PortfolioController; // Subject Under Test
  // const mockService = { getPortforlioSummary: (id: string) => new PortfolioSummary() };
  let methodMock: jest.Mock<Promise<PortfolioSummary>, [string]>;
  beforeEach(async () => {
    methodMock = jest.fn();
    const serviceMockFactory = jest.fn<Partial<PortfolioService>, []>(() => ({
      getPortforlioSummary: methodMock,
    }));
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [PortfolioController],
      providers: [{ provide: PortfolioService, useClass: serviceMockFactory }],
    })
      // .overrideProvider(PortfolioService)
      // .useValue(mockService)
      .compile();

    sut = module.get<PortfolioController>(PortfolioController);
  });

  it("should be defined", () => {
    expect(sut).toBeDefined();
  });
  describe("when user is identified", () => {
    it("get /portfolio/summary (blindly) returns service response", async () => {
      const expected = new PortfolioSummary();
      methodMock.mockResolvedValue(expected);

      const user = {} as UserIdentity;
      expect(await sut.getPortforlioSummary(user, null)).toStrictEqual(expected);
      expect(methodMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("when user is null", () => {
    const user = undefined as UserIdentity;

    it("get /portfolio/summary (blindly) should throw http 400", async () => {
      try {
        await sut.getPortforlioSummary(user, null);
      } catch (e) {
        expect(e).toBeDefined();
        expect(e.message).toBeDefined();
        expect(e.status).toStrictEqual(400);
      }
      // const expected = new BadRequestException();
      // (await expect(await sut.getPortforlioSummary(user))).toThrow();
      // expect(await sut.getPortforlioSummary(user)).toThrowError(BadRequestException);
      // await expect(sut.getPortforlioSummary(user)).toThrowError(BadRequestException);
      // await expect(sut.getPortforlioSummary(user)).rejects.toContain.;
      expect(methodMock).toHaveBeenCalledTimes(0);

      // await expect(userController.doSomething()).rejects.toContainException(
      //   new BadRequestException({ data: '', error: 'foo' }),
    });
  });
});
