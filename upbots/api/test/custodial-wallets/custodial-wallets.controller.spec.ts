import { Test } from "@nestjs/testing";
import { User as UserDocument } from "../../src/types/user";
import CustodialWalletsController from "../../src/custodial-wallets/custodial-wallets.controller";
import UserService from "../../src/shared/user.service";
import ArkaneCapsuleService from "../../src/custodial-wallets/arkane/arkane-capsule.service";
import SignerService from "../../src/custodial-wallets/validator/signer.service";

jest.mock("../../src/shared/user.service");
jest.mock("../../src/custodial-wallets/arkane/arkane-capsule.service");
jest.mock("../../src/custodial-wallets/validator/signer.service");

// @TODO: enable back with generateAddress feature test when ENABLE_PERF_FEES_FEATURE is 1
describe("CustodialWalletController", () => {
  let sut: CustodialWalletsController;
  let generateAddressMock: jest.Mock<any, [string, string]>;
  let updateUserWalletsMock: jest.Mock<any, [any, string]>;

  beforeEach(async () => {
    generateAddressMock = jest.fn();
    updateUserWalletsMock = jest.fn();

    // use Partial<> magic to avoid having to mock all the service methods and properties

    const UserServiceMockFactory = jest.fn<Partial<UserService>, []>(() => ({
      updateUserWallets: updateUserWalletsMock,
    }));
    const ArkaneCapsuleServiceFactory = jest.fn<Partial<ArkaneCapsuleService>, []>(() => ({}));
    const SignerServiceFactory = jest.fn<Partial<SignerService>, []>(() => ({}));

    const module = await Test.createTestingModule({
      controllers: [CustodialWalletsController],
      providers: [
        { provide: UserService, useClass: UserServiceMockFactory },
        { provide: ArkaneCapsuleService, useClass: ArkaneCapsuleServiceFactory },
        { provide: SignerService, useClass: SignerServiceFactory },
      ],
    }).compile();
    sut = module.get<CustodialWalletsController>(CustodialWalletsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be created", () => {
    expect(sut).toBeDefined();
  });

  describe("Get deposit address", () => {
    it("should get deposit address", async () => {
      expect(generateAddressMock).toBeDefined();
      expect(generateAddressMock.mock).toBeDefined();
      expect(generateAddressMock.mock.calls.length).toBe(0);
      const expected = {
        status: "ok",
        data: {
          id: "9879addc-8fac-4556-8a2d-e5317cd4852f",
          symbol: "ETH",
          publicKey: "0xD50EFc45b5218FbAc58b67efBF2952c2Ba4544a7",
          userId: "603917ffe8f7f6084a2d8f2e",
          updatedAt: "2021-03-30T16:31:38.339Z",
          createdAt: "2021-03-30T16:31:38.339Z",
        },
      };
      generateAddressMock.mockReturnValue(expected);

      updateUserWalletsMock.mockReturnValue(true);

      const resp = {
        status: jest.fn(() => {
          return { json: jest.fn() };
        }),
      };

      const user: UserDocument = {
        custodialWallets: {},
      } as UserDocument;
      // expect(generateAddressMock).toHaveBeenCalledTimes(1);
    });
  });
});
