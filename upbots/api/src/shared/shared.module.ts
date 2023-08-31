import { Module, HttpModule } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import StakingLevelService from "../staking-level/services/staking-level.service";
import UserSchema from "../models/user.schema";
import * as StakingLevelModel from "../staking-level/models/staking-level.model";
import HttpExceptionFilter from "./http-exception.filter";
import LoggingInterceptor from "./logging.interceptor";
import UserService from "./user.service";
import MailService from "./mail.service";
import CipherService from "./encryption.service";
import RecaptchaService from "./recaptcha.service";
import UserSettingsModule from "../usersettings/usersettings.module";
import StakingLevelModule from "../staking-level/staking-level.module";

@Module({
  // MongooseModule.forFeature() goes in pair with @InjectModel('User')
  imports: [
    HttpModule,
    UserSettingsModule,
    StakingLevelModule,
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: StakingLevelModel.ModelName, schema: StakingLevelModel.Schema },
    ]),
  ],
  providers: [
    UserService,
    MailService,
    CipherService,
    RecaptchaService,
    StakingLevelService,
    // global filters: @see: https://docs.nestjs.com/exception-filters
    // note that regardless of the module where this construction is employed, the filter is, in fact, global.
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [UserService, MailService, CipherService, RecaptchaService, StakingLevelService],
})
export default class SharedModule {}
