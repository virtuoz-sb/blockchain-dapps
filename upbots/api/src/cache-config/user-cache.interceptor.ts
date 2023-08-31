import { CacheInterceptor, ExecutionContext, Logger } from "@nestjs/common";
import { formatUserCacheKey } from "./user-cache-key";

class UserCacheInterceptor extends CacheInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  trackBy(context: ExecutionContext): string | undefined {
    const key = this.userKeyFromHttpContext(context);
    // this.logger.debug(`http cache key ${key}`);

    return key;
  }

  private userKeyFromHttpContext(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return formatUserCacheKey(request.user.id, request.url);
  }
}

export default UserCacheInterceptor;
