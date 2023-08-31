import { Module } from "@nestjs/common";
import Web3Service from "./web3.service";
import UbxtController from "./ubxt.controller";
import UbxtContractService from "./ubxt-contract.service";
import UbxtDistributionContractService from "./ubxt-distribution-contract.service";
import UbxtStakingContractService from "./ubxt-staking-contract.service";
import CacheConfigModule from "../cache-config/cache-config.module";
import SettingsModule from "../settings/settings.module";
import CipherService from "../shared/encryption.service";

@Module({
  imports: [
    CacheConfigModule, // exports the CacheModule
    SettingsModule,
  ],
  providers: [UbxtContractService, UbxtDistributionContractService, UbxtStakingContractService, Web3Service, CipherService],
  controllers: [UbxtController],
  exports: [UbxtContractService, UbxtDistributionContractService, UbxtStakingContractService, CipherService],
})
export default class UbxtModule {}
