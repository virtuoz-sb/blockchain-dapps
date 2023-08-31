import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { NestEventModule } from "nest-event";
import { WinstonModule } from "nest-winston";
import { RateLimiterModule } from "nestjs-rate-limiter";

import AlgoBotModule from "./algobot/algobot.module";
import AppController from "./app.controller";
import AppService from "./app.service";
import AdminModule from "./admin/admin.module";
import AuthModule from "./auth/auth.module";
import CouponsModule from "./coupons/coupons.module";
import CryptoPriceModule from "./cryptoprice/cryptoPrice.module";
import CustodialWalletsModule from "./custodial-wallets/custodial-wallets.module";
import SeedModule from "./db_seeds/seed.module";
import DexMonitoringModule from "./dex-monitoring/dex-monitoring.module";
import ExchangeKeyModule from "./exchange-key/exchange-key.module";
import MarketModule from "./market/market.module";
import MarketingModule from "./marketing/marketing.module";
import AuthMiddleware from "./middlewares/AuthMiddleware";
import BodyParserMiddleware from "./middlewares/BodyParserMiddleware";
import CryptowatchProxyMiddleware from "./middlewares/CryptowatchProxyMiddleware";
import WebhookProxyMiddleware from "./middlewares/WebhookProxyMiddleware";
import NotificationModule from "./notif/notif.module";
import PerformanceModule from "./performance/performance.module";
import PerfeesModule from "./perfees/perfees.module";
import StakingModule from "./staking/staking.module";
import PortfolioModule from "./portfolio/portfolio.module";
import ProductModule from "./product/product.module";
import SettingsModule from "./settings/settings.module";
import SharedModule from "./shared/shared.module";
import SupportModule from "./support/support.module";
import TradeModule from "./trade/trade.module";
import TrainingModule from "./training/training.module";
import TransactionsModule from "./transactions/transactions.module";
import UbxtModule from "./ubxt/ubxt.module";
import UserSettingsModule from "./usersettings/usersettings.module";
import SignalsModule from "./signals/signals.module";
import WebRequestCorrelationMiddleware from "./middlewares/WebRequestCorrelationMiddleware";
import BotPairPriceMiddleware from "./middlewares/BotPairPriceMiddleware";
import CronJobsInterceptorService from "./shared/cron-jobs-interceptor.service";
import ActiveCampaignModule from "./active-campaign/active-campaign.module";
import LoginTrackingModule from "./login-tracking/login-tracking.module";
import IndacoinModule from "./indacoin/indacoin.module";
import MarketingAutomationModule from "./marketing-automation/marketing-automation.module";
import BannerModule from "./banners/banners.module";
import CopyTradingModule from "./copy-trading/copy-trading.module";
import BrokerTradingModule from "./broker-trading/broker-trading.module";

@Module({
  imports: [
    RateLimiterModule,
    ConfigModule.forRoot({
      envFilePath: [".env", ".env.dev"],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    WinstonModule.forRoot({
      transports: [
        // other transports...
      ],
      // other options
      level: process.env.LOG_LEVEL,
      // format: winston.format.json(),
      // defaultMeta: { service: 'user-service' },
    }),
    NestEventModule,
    ScheduleModule.forRoot(),
    SharedModule, // SharedModule exports UserService
    AdminModule,
    AuthModule,
    NotificationModule,
    ProductModule,
    CryptoPriceModule,
    PortfolioModule,
    DexMonitoringModule,
    MarketModule,
    TradeModule,
    TransactionsModule,
    TrainingModule,
    SettingsModule,
    SeedModule,
    MarketingModule,
    CouponsModule,
    AlgoBotModule,
    ExchangeKeyModule,
    SupportModule,
    PerformanceModule,
    PerfeesModule,
    StakingModule,
    CustodialWalletsModule,
    UbxtModule,
    UserSettingsModule,
    SignalsModule,
    ActiveCampaignModule,
    LoginTrackingModule,
    IndacoinModule,
    MarketingAutomationModule,
    BannerModule,
    CopyTradingModule,
    BrokerTradingModule,
  ],
  controllers: [AppController],
  providers: [AppService, CronJobsInterceptorService],
})
export default class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // TODO: add caching middelware so that tradehistory and orderbook are cached for all users
    // TODO: security: only allozw IP range
    // TODO: security: verify signed request (hmac)
    // TODO: global webhook disable flag
    Logger.debug("app module configures proxy middlewares..", AppModule.name);

    consumer
      .apply(AuthMiddleware, CryptowatchProxyMiddleware)
      .forRoutes({ path: "/orderbook/*", method: RequestMethod.GET }, { path: "/tradehistory/*", method: RequestMethod.GET });

    consumer.apply(BodyParserMiddleware, WebRequestCorrelationMiddleware, BotPairPriceMiddleware, WebhookProxyMiddleware).forRoutes(
      { path: "/hook", method: RequestMethod.GET },
      { path: "/hook/algobot", method: RequestMethod.POST }
      // { path: "/hook/algobot/fake", method: RequestMethod.POST }
    );

    /**
     * Workaround to make the proxy and api working correctly at the same time.
     * NestJS uses bodyParser by default.BodyParser should be disabled (see main.ts) otherwise webhook POST requests are not proxied correctly.
     * IMPORTANT: NOTE: bodyParser needs to be registered AFTER the proxy middlewares otherwise API login fails or webhook POST requests are not proxied correctly.
     * See https://github.com/upbots/upbots-webapp/issues/324
     */
    //
    consumer.apply(BodyParserMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });

    Logger.debug("app module configured proxy middlewares", AppModule.name);
  }
}
