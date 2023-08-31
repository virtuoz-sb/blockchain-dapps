import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import readEnv from "../../utilities/readenv.util";
import SignerService from "./signer.service";

const validatorConfig = () => ({
  skey: readEnv("VALIDATOR_SKEY"),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [validatorConfig],
    }),
  ],
  providers: [SignerService],
  exports: [SignerService],
})
export default class CustodialWalletsModule {}
