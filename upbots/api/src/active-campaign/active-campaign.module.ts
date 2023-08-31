import { Module, HttpModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import ActiveCampaignService from "./active-campaign.service";
import ActiveCampaignController from "./active-campaign.controller";
import AutomationACSchema from "./active-campaign.schema";

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: "AutomationAC", schema: AutomationACSchema }])],
  providers: [ActiveCampaignService],
  controllers: [ActiveCampaignController],
  exports: [ActiveCampaignService],
})
export default class ActiveCampaignModule {}
