import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";
import { On } from "nest-event";
import RouteSegments from "../../utilities/route-segment-name";
import { AccountToUpdate } from "../../portfolio/models";
import RouteListingService from "../route-listing.service";
import { formatUserCacheKey } from "../user-cache-key";

@Injectable()
export default class PortfolioCacheInvalidation {
  private readonly logger = new Logger(PortfolioCacheInvalidation.name);

  constructor(@Inject(CACHE_MANAGER) private cache: Cache, private listingService: RouteListingService) {}

  @On("key-added")
  async invalidateCacheAfterKeyAdded({ userId, exchange, keyId, keyName }: AccountToUpdate) {
    this.logger.debug(`invalidateCacheAfterKeyAdded for user ${userId} , key ${keyId}`);
    await this.invalidatePortfolioCache(userId);
  }

  @On("key-deleted")
  async invalidateCacheAfterKeyDeleted({ userId, keyId }: { userId: string; keyId: string }) {
    this.logger.debug(`invalidateCacheAfterKeyDeleted for user ${userId} , key ${keyId}`);
    await this.invalidatePortfolioCache(userId);
  }

  @On("key-updated")
  async invalidateCacheAfterKeyUpdated({ userId, keyId }: { userId: string; keyId: string }) {
    this.logger.debug(`invalidateCacheAfterKeyUpdated for user ${userId} , key ${keyId}`);
    await this.invalidatePortfolioCache(userId);
  }

  private async invalidatePortfolioCache(userId: string): Promise<void> {
    const routesToClear = this.listingService.getRouteUrls(RouteSegments.Portfolio);
    routesToClear.forEach(async (url) => {
      const key = formatUserCacheKey(userId, url);
      this.logger.debug(`invalidatePortfolioCache for key ${key}`);
      await this.cache.del(key);
    });
  }
}
