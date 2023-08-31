import { Test, TestingModule } from "@nestjs/testing";
import { StrategeServiceClient } from "../../../src/proto/stratege/strat_grpc_pb";
import StrategyRequestService from "../../../src/trade/services/strategy-request.service";
import { GRPC_STRATEGE_CLIENT } from "../../../src/trade/grpc-client/grpc-startege-client-factory";

describe("StrategyRequestService", () => {
  let sut: StrategyRequestService;
  // let newStrategieMock: jest.Mock<grpc.ClientUnaryCall, [NewStratRequest, GrpcCallback]>;
  let newStrategieMock: jest.Mock<any, [any, any]>;

  beforeEach(async () => {
    // jest.fn((file, fileName, callback) => callback('someData'))
    newStrategieMock = jest.fn((reqMessage, callback) => {
      callback(null, "someData");
    });
    const serviceFactory = jest.fn<Partial<StrategeServiceClient>, []>(() => ({
      createStrategie: newStrategieMock,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StrategyRequestService,
        {
          provide: GRPC_STRATEGE_CLIENT,
          useClass: serviceFactory,
        },
      ],
    }).compile();

    // module.useLogger(new NoOpLogger()); // disable logger
    sut = module.get<StrategyRequestService>(StrategyRequestService);
  });

  it("should be defined", () => {
    expect(sut).toBeDefined();
  });

  it("new strategy request entries should be mapped to grpc service request", async () => {
    // TODO: fix this
    // const data = new CreateManualSignalStrategyDto();
    // console.log('before await');
    // const response = await sut.requestNewStrategy('userID', data);
    // expect(newStrategieMock).toHaveBeenCalledTimes(1);
    // console.log('after await');
    // expect(sut).toBeDefined();
    // helloMock.mockReturnValue(expected);
    // expect(helloMock.mock.calls.length).toBe(0);
    // expect(await controller.sayHello()).toBe(expected);
    // expect(helloMock).toHaveBeenCalledTimes(1);
  });

  // it('should reject if input data is null', async () => {

  //   try{
  //   const actual= await sut.requestNewStrategy("1",null);
  // }
  // });
});
