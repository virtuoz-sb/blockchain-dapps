import { Module } from "@nestjs/common";
import ExchangeKeyModule from "../exchange-key/exchange-key.module";
import ExchangeProxyModule from "../exchangeProxy/exchange-proxy.module";
import SupportController from "./controller/support.controller";
import SupportService from "./services/support.service";
import SharedModule from "../shared/shared.module";
import UbxtStakingService from "./services/ubxt-stacking.service";

@Module({
  imports: [ExchangeKeyModule, ExchangeProxyModule, SharedModule],
  controllers: [SupportController],
  providers: [SupportService, UbxtStakingService],
})
export default class SupportModule {}
