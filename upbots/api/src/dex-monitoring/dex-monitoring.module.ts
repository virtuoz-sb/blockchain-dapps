import { HttpModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import CacheConfigModule from "src/cache-config/cache-config.module";
import CryptoPriceModule from "src/cryptoprice/cryptoPrice.module";
import DexEvolutionService from "./dex-evolution.service";
import DexMonitoringController from "./dex-monitoring.controller";
import DexMonitoringService from "./dex-monitoring.service";
import DexWalletsService from "./dex-wallets.service";
import { DexAssets, DexAssetsSchema } from "./models/dex-assets.schema";
import { DexWallet, DexWalletSchema } from "./models/dex-wallet.schema";

@Module({
  imports: [
    CacheConfigModule,
    MongooseModule.forFeature([{ name: DexAssets.name, schema: DexAssetsSchema }]),
    MongooseModule.forFeature([{ name: DexWallet.name, schema: DexWalletSchema }]),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const isProxyActive = !!config.get<string>("COVALENT_LOAD_BALANCER_URI");
        const baseURL = isProxyActive ? `${config.get<string>("COVALENT_LOAD_BALANCER_URI")}/v1` : "https://api.covalenthq.com/v1";
        return {
          baseURL,
          headers: {
            "x-target-upstream": isProxyActive && "api.covalenthq.com",
          },
          auth: {
            username: config.get<string>("COVALENT_API_KEY"),
            password: "",
          },
          timeout: 60 * 1000,
        };
      },
      inject: [ConfigService],
    }),
    CryptoPriceModule, // needed for currency conversion rates
  ],
  controllers: [DexMonitoringController],
  providers: [DexMonitoringService, DexEvolutionService, DexWalletsService],
})
export default class DexMonitoringModule {}
