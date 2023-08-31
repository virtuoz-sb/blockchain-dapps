import { CacheModuleOptions, CacheOptionsFactory, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export default class CacheConfigService implements CacheOptionsFactory {
  private readonly logger = new Logger(CacheConfigService.name);

  constructor(private conf: ConfigService) {
    this.logger.debug("CacheConfigService ctor");
  }

  createCacheOptions(): CacheModuleOptions {
    const ttl = this.conf.get<number>("CACHE_TTL");
    const maxItems = this.conf.get<number>("CACHE_MAX_ITEMS");
    if (!ttl) {
      this.logger.warn(`WARNING: CacheModule createCacheOptions ttl: ${ttl}, check env config (missing CACHE_TTL)`);
    }
    if (!maxItems) {
      this.logger.warn(`WARNING: CacheModule createCacheOptions maxItems: ${maxItems}, check env config (missing CACHE_MAX_ITEMS)`);
    }
    this.logger.debug(`CacheModule createCacheOptions ttl ${ttl} sec (env CACHE_TTL),  maxItems: ${maxItems} (env CACHE_MAX_ITEMS)`);
    return {
      ttl,
      max: maxItems,
    };
  }
}
