import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import MarketingAutomationService from "./marketing-automation.service";
import MarketingAutomationController from "./marketing-automation.controller";
import MarketingAutomationSchema from "./marketing-automation.schema";
import SharedModule from "../shared/shared.module";
import UserSchema from "../models/user.schema";

@Module({
  imports: [
    SharedModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: "MarketingAutomation", schema: MarketingAutomationSchema },
      { name: "User", schema: UserSchema },
    ]),
  ],
  providers: [MarketingAutomationService],
  controllers: [MarketingAutomationController],
  exports: [MarketingAutomationService],
})
export default class MarketingAutomationModule {}
