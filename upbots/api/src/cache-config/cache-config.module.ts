import { Module, CacheModule } from "@nestjs/common";
import CacheConfigService from "./cache-config.service";
import PortfolioCacheInvalidation from "./invalidation/portfolio-cache.invalidation";
import RouteListingService from "./route-listing.service";
import UserCacheInterceptor from "./user-cache.interceptor";

/**
 * App cache module: use this module (instead of CacheModule) when cache is used so that cache TTL and settings are uniform accross the app.
 */
@Module({
  imports: [
    CacheModule.registerAsync({
      useClass: CacheConfigService,
    }),
  ],
  providers: [UserCacheInterceptor, PortfolioCacheInvalidation, RouteListingService],
  exports: [UserCacheInterceptor, CacheModule], // re export the CacheModule so that all modules using CacheConfigModule will have the cache provider registered in 1 import
})
export default class CacheConfigModule {}
