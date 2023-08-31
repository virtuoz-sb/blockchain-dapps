import { Test } from "@nestjs/testing";
import { RateLimiterOptions } from "nestjs-rate-limiter";
import { UserDto } from "../../src/types";
import AuthController from "../../src/auth/auth.controller";
import AuthService from "../../src/auth/auth.service";
import LoginTrackingService from "../../src/login-tracking/login-tracking.service";
import MarketingAutomationService from "../../src/marketing-automation/marketing-automation.service";
import RecaptchaService from "../../src/shared/recaptcha.service";
import ReferralService from "../../src/perfees/services/referral.service";
import { AuthRespDTO } from "../../src/auth/auth.dto";

const defaultRateLimiterOptions: RateLimiterOptions = {
  for: "Express",
  type: "Memory",
  keyPrefix: "global",
  points: 4,
  pointsConsumed: 1,
  inmemoryBlockOnConsumed: 0,
  duration: 1,
  blockDuration: 0,
  inmemoryBlockDuration: 0,
  queueEnabled: false,
  whiteList: [],
  blackList: [],
  storeClient: undefined,
  insuranceLimiter: undefined,
  storeType: undefined,
  dbName: "rate-limiter",
  tableName: undefined,
  tableCreated: undefined,
  clearExpiredByTimeout: undefined,
  execEvenly: false,
  execEvenlyMinDelayMs: undefined,
  indexKeyPrefix: {},
  maxQueueSize: 100,
  omitResponseHeaders: false,
  errorMessage: "Rate limit exceeded",
  customResponseSchema: undefined,
  logger: true,
};

jest.mock("../../src/auth/auth.service"); //  AuthService is is now a mock constructor (new AuthService is a mock instance)
jest.mock("../../src/shared/recaptcha.service"); // RecaptchaService is now a mock constructor

describe("AuthController", () => {
  let sut: AuthController;
  let createAuthenticationResponseMock: jest.Mock<AuthRespDTO, [UserDto, boolean]>;

  beforeEach(async () => {
    // AuthService.prototype.createAuthenticationResponse = createAuthenticationResponseMock;

    // const expected = new AuthRespDTO();
    createAuthenticationResponseMock = jest.fn();

    // use Partial<> magic to avoid having to mock all the service methods and properties
    const AuthServiceMockFactory = jest.fn<Partial<AuthService>, []>(() => ({
      createAuthenticationResponse: createAuthenticationResponseMock,
    }));
    // other construct: you need to define all the properties and methods.. annoying..
    // (AuthService as jest.Mock<AuthService>).mockImplementation(() => ({
    //   createAuthenticationResponse: jest.fn(),
    // }));
    const RecaptchaServiceMockFactory = jest.fn<Partial<RecaptchaService>, []>(() => ({
      decodeCaptcha: jest.fn(),
    }));

    const LoginTrackingServiceMockFactory = jest.fn<Partial<LoginTrackingService>, []>(() => ({
      updateUserLoginTimeStamp: jest.fn(),
    }));

    const ReferralServiceMockFactory = jest.fn<Partial<ReferralService>, []>(() => ({}));

    const MarketingAutomationServiceMockFactory = jest.fn<Partial<MarketingAutomationService>, []>(() => ({
      subscribeToAutomationList: jest.fn(),
      handleUserVerifyEmail: jest.fn(),
    }));

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useClass: AuthServiceMockFactory },
        { provide: LoginTrackingService, useClass: LoginTrackingServiceMockFactory },
        { provide: RecaptchaService, useClass: RecaptchaServiceMockFactory },
        { provide: ReferralService, useClass: ReferralServiceMockFactory },
        { provide: MarketingAutomationService, useClass: MarketingAutomationServiceMockFactory },
        {
          provide: "RATE_LIMITER_OPTIONS",
          useValue: defaultRateLimiterOptions,
        },
      ],
    }).compile();
    // AuthService requires UserService JWTService
    sut = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be created", () => {
    expect(sut).toBeDefined();
  });

  describe("login() without 2FA set up", () => {
    /*    let ExpressResponseMockFactory;
    let statusMock;
    let sendMock;
    beforeEach(() => {
      statusMock = jest.fn<Response, [number]>().mockReturnThis();
      sendMock = jest.fn<Response, [any]>().mockReturnThis();
      ExpressResponseMockFactory = jest.fn<Partial<Response>, []>(() => ({
        status: statusMock,
        send: sendMock
      }));
    }); */

    it("should set response as returned by authService response", async () => {
      expect(createAuthenticationResponseMock).toBeDefined();
      expect(createAuthenticationResponseMock.mock).toBeDefined();
      expect(createAuthenticationResponseMock.mock.calls.length).toBe(0);
      const expected = new AuthRespDTO();
      expected.user = { totpRequired: false } as UserDto;
      createAuthenticationResponseMock.mockReturnValue(expected);

      expected.access_token = "fake-jwt-unit-test";
      /*  const loginPayload: CredentialsDTO = {
        email: "fake@unit-test.fake",
        password: "fake-password"
      }; */
      const resp = {
        status: jest.fn(() => {
          return { send: jest.fn() };
        }),
        write: jest.fn(),
        end: jest.fn(),
        redirect: jest.fn(),
      };

      // const responseMock = new ExpressResponseMockFactory();
      // const request: any = { user: { username: "fakeuser@fake.unit" } };
      // expect(await sut.login(request, resp as any, {})).not.toBeDefined();
      // expect(createAuthenticationResponseMock).toHaveBeenCalledTimes(1);
    });
  });

  /*  it('Should create cat for admin', async done => {
    console.log('55555555555:', server);
    return await request(server)
      .get('/auth/totp-secret')
      .end((error, response) => {
        expect(response.status).toBe(404);
        done();
      });
     .set('Authorization', catAdminToken)
      .set('Accept', 'application/json')
      .send(catDto)
      .expect(201);
  }); */
  /*  describe('findAll', () => {
    it('should return an array of cats', async () => {
      let result: speakeasy.GeneratedSecret = {
        ascii: 'ijljjkl',
        google_auth_qr: 'jkkj',
        hex: 'kjkjk',
        base32: 'jkjkjjkkjl',
      };
      jest.spyOn(authService, 'totpSecret').mockImplementation(() => result);
      expect(await authController.totpSecret(user)).toContain(result);
    });
  }); */
});
