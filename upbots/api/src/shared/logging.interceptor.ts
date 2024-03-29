import { ExecutionContext, Injectable, Logger, NestInterceptor, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export default class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest();

    const { method } = req;
    const { url } = req;

    return next.handle().pipe(tap(() => Logger.log(`${method} ${url} ${Date.now() - now}ms`, context.getClass().name)));
  }
}
