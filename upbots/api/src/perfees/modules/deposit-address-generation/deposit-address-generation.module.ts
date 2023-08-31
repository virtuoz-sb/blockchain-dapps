import { Module, HttpModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

import readEnv from "../../../utilities/readenv.util";
import CacheConfigModule from "../../../cache-config/cache-config.module";
import AddressGenerationService from "./deposit-address-generation.service";

const urlConfig = () => ({
  url: readEnv("CHAIN_BACKEND_URL"),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [urlConfig],
    }),
    CacheConfigModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        baseURL: `${config.get("url")}`,
        headers: {
          post: { "Content-Type": "application/json" },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AddressGenerationService],
  exports: [AddressGenerationService],
})
export default class DepositAddressGenerationModule {}
