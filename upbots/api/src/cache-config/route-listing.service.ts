import { Injectable, Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as listEndpoints from "express-list-endpoints";

@Injectable()
export default class RouteListingService {
  private readonly logger = new Logger(RouteListingService.name);

  private routes: Array<RouteItem>;

  initializeAppRouteListing(app: NestExpressApplication) {
    this.logger.debug("initializeAppRouteListing");
    this.routes = listEndpoints(app.getHttpAdapter().getInstance());
    this.logger.debug(`found ${this.routes.length} api routes`);
  }

  getRouteUrls(including: string): string[] {
    if (!this.routes) {
      return [];
    }
    return this.routes.filter((r) => r.path.includes(including)).map((r) => r.path);
  }
}

type RouteItem = {
  path: string;
  methods: string[];
  middleware: string[];
};
