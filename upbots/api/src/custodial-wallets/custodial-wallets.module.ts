import { Module, HttpModule } from "@nestjs/common";
import CacheConfigModule from "../cache-config/cache-config.module";
import SharedModule from "../shared/shared.module";
import ArkaneCapsuleModule from "./arkane/arkane-capsule.module";
import ValidatorModule from "./validator/validator.module";
import CustodialWalletsController from "./custodial-wallets.controller";

@Module({
  imports: [ArkaneCapsuleModule, SharedModule, HttpModule, CacheConfigModule, ValidatorModule],
  controllers: [CustodialWalletsController],
})
export default class CustodialWalletsModule {}
