import { CacheModule, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { PassportModule } from "@nestjs/passport";
import { TestingModule, Test } from "@nestjs/testing";
import JwtStrategy from "../src/auth/jwt.strategy";
import AuthService from "../src/auth/auth.service";
import { PortfolioSummary } from "../src/portfolio/models";
import PortfolioController from "../src/portfolio/portfolio.controller";
import PortfolioService from "../src/portfolio/services/portfolio.service";

// -----------------------------------------------------
// UNIT TEST CONTROLLER LOGIC without deploying the app
// -----------------------------------------------------
describe("Portfolio Controller App testing", () => {
  let app: INestApplication;

  const mockService = {
    getPortforlioSummary: () => new PortfolioSummary(),
  };
  const authServiceMock = { validateUser: () => null }; // user denied
  const OLD_ENV = process.env;

  beforeEach(async () => {
    jest.resetModules(); // this is important - it clears the cache
    process.env = { ...OLD_ENV }; // back up env
    process.env.JWT_SECRET = "unit-test-njhgftdresdtfyguhij"; // used by JwtStrategy

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" }), CacheModule.register()],
      // imports: [AuthModule], // AuthModule uses SharedModule which uses MoongooseModule
      controllers: [PortfolioController],
      providers: [PortfolioService, AuthService, JwtStrategy], // authservice used by jwt strategy
    })
      .overrideProvider(PortfolioService)
      .useValue(mockService)
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .compile();

    // const user = await this.authService.validateUser(payload.email);
    app = module.createNestApplication();
    // app.getHttpServer();
    await app.init();
  });

  it("should be denied when no JWT provided", (done) => {
    return request(app.getHttpServer()).get("/portfolio/summary").set("Accept", "application/json").expect(401).end(done); // fix TCPSERVERWRAP error using jest --detectOpenHandles
  });

  afterAll(async () => {
    await app.close();
    process.env = OLD_ENV; // restore env
  });
});
