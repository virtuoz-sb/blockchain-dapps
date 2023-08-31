import { Controller, Post, Body, Get, Put, UseGuards } from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { UserIdentity } from "../types/user";
import { ActiveCampaignUser } from "./active-campaign.types";
import UserFromJWT from "../utilities/user.decorator";
import ActiveCampaignService from "./active-campaign.service";

@Controller("active-campaign")
export default class ActiveCampaignController {
  constructor(private activeCampaignService: ActiveCampaignService) {}

  @Post("/add-user-list")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Add user to UpBots User List in UpBots Active Campaign",
  })
  async addToUserList(@UserFromJWT() user: UserIdentity): Promise<any> {
    return this.activeCampaignService.addToUserList(user);
  }

  @Post("/add-marketing-list")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Add user to UpBots Marketing List in UpBots Active Campaign",
  })
  async addToMarketingList(@UserFromJWT() user: UserIdentity): Promise<any> {
    return this.activeCampaignService.addToMarketingList(user);
  }

  @Get("/user-automation-tags")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Get available tags of a user in UpBots Active Campaign Automation List",
  })
  async getUserTags(@UserFromJWT() user: UserIdentity) {
    return this.activeCampaignService.getUserAutomationDatabase(user.id);
  }

  @Put("/update-user-automation")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Update/create a user's tags and info(name, telegram etc.) in UpBots Active Campaign Automation List",
  })
  async updateUserTagsAndInfo(@UserFromJWT() user: UserIdentity, @Body() payload: ActiveCampaignUser) {
    return this.activeCampaignService.updateAutomationInDBandAC(user, payload.tags);
  }
}
