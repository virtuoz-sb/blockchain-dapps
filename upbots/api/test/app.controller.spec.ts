import { Test, TestingModule } from "@nestjs/testing";
import AppController from "../src/app.controller";
import AppService from "../src/app.service";
import UserService from "../src/shared/user.service";
import { UserIdentity } from "../src/types";

jest.mock("../src/app.service"); // replaces AppService by a jest.Mock, must be here in global scope

describe("App Controller", () => {
  let controller: AppController;
  let helloMock: jest.Mock<string>;
  let findUserMock: jest.Mock<Promise<UserIdentity>>;
  // const mockService = { getHello: () => 'mocked' };

  beforeEach(async () => {
    // example: https://stackoverflow.com/questions/51215750/typescript-errors-when-using-jest-mocks/51251369
    helloMock = jest.fn();
    findUserMock = jest.fn();
    const AppServiceMockFactory = jest.fn<Partial<AppService>, []>(() => ({
      getHello: helloMock,
    }));
    const UserServiceMockFactory = jest.fn<Partial<UserService>, []>(() => ({
      findUser: findUserMock,
    }));

    // other construct: you need to define all the properties and methods.. annoying..
    // (AppService as jest.Mock<AppService>).mockImplementation(([]) => ({
    //   getHello: helloMock,
    // }));
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useClass: AppServiceMockFactory,
        },
        {
          provide: UserService,
          useClass: UserServiceMockFactory,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
  it("get /hello returns hello", async () => {
    const expected = "mocked hello 2";
    helloMock.mockReturnValue(expected);
    expect(helloMock.mock.calls.length).toBe(0);
    expect(await controller.sayHello()).toBe(expected);
    expect(helloMock).toHaveBeenCalledTimes(1);
    // expect(helloMock.mock.calls.length).toBe(1);
  });
});
