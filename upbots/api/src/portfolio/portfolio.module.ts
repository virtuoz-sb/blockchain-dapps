import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import SettingsModule from "src/settings/settings.module";
import ExchangeKeyModule from "../exchange-key/exchange-key.module";
import ExchangeKeySchema from "../models/exchange-key.schema";
import SharedModule from "../shared/shared.module";
import PortfolioController from "./portfolio.controller";
import PortfolioAdminController from "./portfolio-admin.controller";
import PortfolioService from "./services/portfolio.service";
import CryptoPriceModule from "../cryptoprice/cryptoPrice.module";
import { EvolutionSchema, Evolution } from "./models/evolution.schema";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";
import CacheConfigModule from "../cache-config/cache-config.module";
import TradeBalanceController from "./trade-balance.controller";
import TradeBalanceService from "./services/trade-balance.service";
import UserSchema from "../models/user.schema";

@Module({
  imports: [
    CacheConfigModule, // exports CacheModule
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "ExchangeKey", schema: ExchangeKeySchema },
      { name: Evolution.name, schema: EvolutionSchema },
    ]),
    SharedModule,
    CryptoPriceModule, // needs currency c=rates from CryptoWatchPriceService
    ExchangeProxyModule, // ProxyFactoryService
    HttpModule,
    ExchangeKeyModule,
    SettingsModule, // required by SettingsService.getCompatibleExchanges
  ],
  controllers: [PortfolioController, PortfolioAdminController, TradeBalanceController],
  providers: [PortfolioService, TradeBalanceService],
  exports: [TradeBalanceService],
})
export default class PortfolioModule {}
