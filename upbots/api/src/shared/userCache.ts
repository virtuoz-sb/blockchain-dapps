import { CacheInterceptor, ExecutionContext } from "@nestjs/common";

class UserCache extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const key = `_${request.user.id}${request.url}`;
    return key;
  }
}

export default UserCache;
