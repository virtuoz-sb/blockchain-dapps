import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable, of } from "rxjs";
import { Request } from "express";
import { UserIdentity } from "../types";

@Injectable()
export default class FakeModeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FakeModeInterceptor.name);

  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const fakeMode = this.configService.get<string>("STUB_INTERCEPT_MODE");
    // this.logger.log(`Stubbed response  fakeMode ${fakeMode} ${typeof fakeMode}`);

    if (fakeMode && fakeMode === "true") {
      const req: Request = context.switchToHttp().getRequest();
      const user = req?.user as UserIdentity;
      this.logger.log(`Stubbed response ${req?.url} for ${user.id}`);

      return of({ stubbed: true });
    }

    return next.handle();
  }
}
