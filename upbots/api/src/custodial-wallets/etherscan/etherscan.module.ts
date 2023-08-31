import { Module, HttpModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import CacheConfigModule from "src/cache-config/cache-config.module";
import readEnv from "src/utilities/readenv.util";
import EtherscanService from "./etherscan.service";

const etherScanConfig = () => ({
  apiKey: readEnv("ETHERSCAN_API_KEY"),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [etherScanConfig],
    }),
    CacheConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        baseURL: `https://api.etherscan.io/api?apikey=${config.get("apiKey")}`,
        headers: {
          post: { "Content-Type": "application/json" },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EtherscanService],
  exports: [EtherscanService],
})
export default class EtherscanModule {}
