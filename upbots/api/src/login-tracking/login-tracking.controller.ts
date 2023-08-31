import { Controller, Post, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from "@nestjs/swagger";
import { UserIdentity } from "../types/user";
import UserFromJWT from "../utilities/user.decorator";
import LoginTrackingService from "./login-tracking.service";

@ApiTags("login-tracking")
@Controller("login-tracking")
@UseGuards(AuthGuard("jwt"))
export default class LoginTrackingController {
  constructor(private loginTrackingService: LoginTrackingService) {}

  @Get()
  @ApiOperation({
    summary: "Get a list of daily active users within the specify period",
  })
  @ApiQuery({
    name: "start",
    type: Date,
    required: true,
  })
  @ApiQuery({
    name: "end",
    type: Date,
    required: true,
  })
  @ApiResponse({ status: 200, type: Boolean })
  async getActiveUserList(@Query("start") start, @Query("end") end) {
    return this.loginTrackingService.getActiveUserList(start, end);
  }

  @Get("log")
  @ApiOperation({
    summary: "Get auth log by user email address",
  })
  @ApiQuery({
    name: "email",
    type: String,
    required: true,
  })
  @ApiResponse({ status: 200, type: Boolean })
  async getLogByEmail(@Query("email") email) {
    return this.loginTrackingService.getLogByEmail(email);
  }

  @Post("/update")
  @ApiOperation({
    summary: "Update login timestamp of a user",
  })
  @ApiResponse({ status: 200, type: Boolean })
  async updateUserLoginTimeStamp(@UserFromJWT() user: UserIdentity): Promise<boolean> {
    return this.loginTrackingService.updateUserLoginTimeStamp(user);
  }
}
