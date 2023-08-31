import { Module, HttpModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import CryptoCompareMultiPriceService from "src/cryptoprice/cryptocompare-multi-price.service";
import CacheConfigModule from "src/cache-config/cache-config.module";

import { MongooseModule } from "@nestjs/mongoose";
import ArkaneCapsuleService from "./arkane-capsule.service";
import ArkaneConfig from "./arkane-capsule.config";
import EtherscanModule from "../etherscan/etherscan.module";
import CryptoCompareSchema from "../../models/cryptocompare.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "CryptoCompare", schema: CryptoCompareSchema }]),

    EtherscanModule,
    ConfigModule.forRoot({
      load: [ArkaneConfig],
    }),
    CacheConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        baseURL: config.get("api").baseURL,
        headers: {
          post: { "Content-Type": "application/json" },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ArkaneCapsuleService, CryptoCompareMultiPriceService],
  exports: [ArkaneCapsuleService],
})
export default class ArkaneCapsuleModule {}
