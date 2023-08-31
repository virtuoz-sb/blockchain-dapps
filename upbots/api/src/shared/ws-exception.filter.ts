import { Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";

@Catch()
export default class WsAllExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsAllExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
    this.logger.debug(`ws exception: ${exception}`);
  }
}
