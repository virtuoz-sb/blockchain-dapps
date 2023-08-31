import { HttpException, HttpStatus, UnprocessableEntityException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AxiosError } from "axios";
import { ValidationError } from "class-validator";
import HttpExceptionFilter from "../../src/shared/http-exception.filter";

describe("HttpExceptionFilter", () => {
  let sut: HttpExceptionFilter;

  const mockJsonResponse = jest.fn();
  const mockStatus = jest.fn().mockImplementation(() => ({
    json: mockJsonResponse,
  }));
  const mockGetResponse = jest.fn().mockImplementation(() => ({
    status: mockStatus,
  })); // mock response.status(x.statusCode).json(errorResponse);

  const mockGetRequest = jest.fn().mockImplementation(() => ({
    url: "unit-test-request-url",
    method: "unit-test-request-method",
  }));

  const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
    getResponse: mockGetResponse,
    // getRequest: jest.fn(),
    getRequest: mockGetRequest,
  }));

  const mockArgumentsHost = {
    switchToHttp: mockHttpArgumentsHost,
    getArgByIndex: jest.fn(),
    getArgs: jest.fn(),
    getType: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    sut = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  it("should be defined", () => {
    expect(sut).toBeDefined();
  });

  it("Http exception", () => {
    sut.catch(new HttpException("fake unit test exception message (HttpException)", HttpStatus.BAD_REQUEST), mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();

    expect(mockGetRequest).toBeCalledTimes(1);
    expect(mockGetRequest).toBeCalledWith();

    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_REQUEST);

    expect(mockJsonResponse).toBeCalledTimes(1);
    expect(mockJsonResponse).toBeCalledWith({
      message: "fake unit test exception message (HttpException)",
      method: "unit-test-request-method",
      path: "unit-test-request-url",
      code: HttpStatus.BAD_REQUEST,
    });
  });

  it("simmple error returns 500 INTERNAL_SERVER_ERROR", () => {
    sut.catch(new Error("fake simple error"), mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();

    expect(mockGetRequest).toBeCalledTimes(1);
    expect(mockGetRequest).toBeCalledWith();

    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);

    expect(mockJsonResponse).toBeCalledTimes(1);
    expect(mockJsonResponse).toBeCalledWith({
      message: "Error - fake simple error",
      method: "unit-test-request-method",
      path: "unit-test-request-url",
      code: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });

  it("axios error should return 502 BAD_GATEWAY", () => {
    // const axiosErr = {
    // } as AxiosError<string>;
    const axiosErr = (new HttpException("fake axios error", 512) as unknown) as AxiosError<string>;
    axiosErr.isAxiosError = true;
    axiosErr.toJSON = () => {
      return { toJSON: "mocked" };
    };
    axiosErr.message = "axios error message";
    axiosErr.name = "Error";
    axiosErr.stack = "Error: Request failed with status code 404";
    sut.catch(axiosErr, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();

    expect(mockGetRequest).toBeCalledTimes(1);
    expect(mockGetRequest).toBeCalledWith();

    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.BAD_GATEWAY);

    expect(mockJsonResponse).toBeCalledTimes(1);
    expect(mockJsonResponse).toBeCalledWith({
      message: "external service failed",
      method: "unit-test-request-method",
      path: "unit-test-request-url",
      code: HttpStatus.BAD_GATEWAY,
    });
  });

  it("axios error should return 422 BAD_GATEWAY", () => {
    const errors = [
      ({
        constraints: {
          fieldA: "invalid",
        },
      } as unknown) as ValidationError,
    ];
    const vErr = new UnprocessableEntityException(errors, "the f word is not allowed, please behave");

    sut.catch(vErr, mockArgumentsHost);

    expect(mockHttpArgumentsHost).toBeCalledTimes(1);
    expect(mockHttpArgumentsHost).toBeCalledWith();
    expect(mockGetResponse).toBeCalledTimes(1);
    expect(mockGetResponse).toBeCalledWith();

    expect(mockGetRequest).toBeCalledTimes(1);
    expect(mockGetRequest).toBeCalledWith();

    expect(mockStatus).toBeCalledTimes(1);
    expect(mockStatus).toBeCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(mockJsonResponse).toBeCalledTimes(1);
    expect(mockJsonResponse).toBeCalledWith({
      message: "the f word is not allowed, please behave",
      method: "unit-test-request-method",
      path: "unit-test-request-url",
      code: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  });
});
