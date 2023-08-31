import { Response, Request } from "express";
import { AxiosError } from "axios";
import { ArgumentsHost, BadGatewayException, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ValidationError } from "class-validator";
import ApiErrorResponse from "./api-error-reponse";
// import { ServiceError } from "grpc";

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(caughtError: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorResponse = {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      // timestamp: Date.now().toString(),
      path: request.url,
      method: request.method,
      message: "error",
    } as ApiErrorResponse;

    const axiosError = (caughtError as unknown) as AxiosError<any>;
    // this.logger.debug(caughtError);

    if (axiosError && axiosError.isAxiosError) {
      this.logger.error(`is axios error :${JSON.stringify(axiosError.toJSON())}`);
      // TODO: returns external service code identifier
      const err = new BadGatewayException("external service failed");
      errorResponse.code = err.getStatus();
      errorResponse.message = err.message;
    } else if (caughtError instanceof HttpException) {
      this.logger.debug("is a HttpException (not axiosError)");

      const x = this.parseNonAxiosException(caughtError);

      errorResponse.code = x.statusCode;
      errorResponse.message = x.message;
    } else {
      // this.logger.warn("is a NOT an HttpException");
      this.logger.error(caughtError);
      if (caughtError && caughtError.stack && caughtError.stack.includes("node_modules/grpc/src")) {
        // returns 502 when grpc error detected
        errorResponse.code = HttpStatus.BAD_GATEWAY;
      }
      errorResponse.message = caughtError ? `${caughtError.name} - ${caughtError.message}` : "error.";
    }

    response.status(errorResponse.code).json(errorResponse);
  }

  parseNonAxiosException(ex: Error | HttpException): ExceptionInfo {
    let { message } = ex;
    this.logger.debug(`parseNonAxiosException`);
    this.logger.debug(ex);
    // this.logger.debug(ex);
    const httpEx = ex as HttpException;
    if (httpEx && httpEx.getStatus() === HttpStatus.UNPROCESSABLE_ENTITY) {
      this.logger.debug("is a UNPROCESSABLE_ENTITY error 422");

      const r = httpEx.getResponse() as ValidationResponse;
      this.logger.debug("ValidationResponse");
      this.logger.debug(r);
      message = r.error;
    }
    const statusCode = ex instanceof HttpException ? ex.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR; // Error does not have a getStatus
    return { message, statusCode };
  }
}

interface ExceptionInfo {
  message: string;
  statusCode: number;
  // isAxiosError: boolean;
}

interface ValidationResponse {
  error: string;
  message: Array<ValidationError>;
  statusCode: number;
}
