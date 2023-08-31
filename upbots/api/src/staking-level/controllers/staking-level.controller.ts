import { Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";
import { UserStakingLevelInfoDto } from "../models/staking-level.model";
import StakingLevelService from "../services/staking-level.service";

@ApiTags("staking-level")
@Controller("staking-level")
export default class StakingLevelController {
  constructor(private stakingLevelService: StakingLevelService) {}

  @Get("status")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the staking level info.",
  })
  @ApiResponse({ status: 200, type: UserStakingLevelInfoDto, description: "Success" })
  async getStakingInfo(@UserFromJWT() user: UserDocument): Promise<UserStakingLevelInfoDto> {
    return (
      (await this.stakingLevelService.getCurrentStakingLevelAndFee(user.id)) || {
        currentFeeOff: 0,
        latestLevel: 0,
        accessCommunityBots: false,
        accessCreateBot: false,
        prizeNFT: "",
      }
    );
  }
}
