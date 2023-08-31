import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import CacheConfigModule from "./cache-config/cache-config.module";
import RouteListingService from "./cache-config/route-listing.service";

const setupRouteListing = (app: NestExpressApplication) => {
  const listing = app.select(CacheConfigModule).get(RouteListingService);
  // console.log("resolved listing service", listing);
  listing.initializeAppRouteListing(app);
};
export default setupRouteListing;
