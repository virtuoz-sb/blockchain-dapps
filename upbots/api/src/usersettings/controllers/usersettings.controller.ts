import { Controller, UseGuards, Get, Body, Put } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import UserSettings from "../models/usersettings";
import { UserIdentity } from "../../types/user";
import UserFromJWT from "../../utilities/user.decorator";
import UserSettingsRepository from "../repositories/usersettings.repository";

@ApiTags("usersettings")
@Controller("usersettings")
@UseGuards(AuthGuard("jwt"))
export default class UserSettingsController {
  constructor(private userSettingsDB: UserSettingsRepository) {}

  @Get()
  @ApiOperation({
    summary: "Get user setttings",
    description: `get user setttings such as user favorite currency and select mode(dark/light)`,
  })
  @ApiResponse({ status: 200, type: Boolean })
  async getUserSettings(@UserFromJWT() user: UserIdentity) {
    return this.userSettingsDB.getMyUserSettings(user.id);
  }

  @Put("update")
  @ApiOperation({
    summary: "set the user settings (update or insert when non existing)",
    description: `The partial UserSettings interface is use as input parameter. Response will be a Boolean flag`,
  })
  @ApiResponse({ status: 200, type: Boolean })
  async updateUserSettings(@UserFromJWT() user: UserIdentity, @Body() changes: Partial<UserSettings>): Promise<boolean> {
    return this.userSettingsDB.updateUserSettings(changes, user.id);
  }

  @Get("read")
  @ApiOperation({
    summary: "get the user settings (could be empty if not yet set)",
    description: `The UserSettings interface is used as response`,
  })
  @ApiResponse({ status: 200, type: Boolean })
  getMyUserSettings(@UserFromJWT() user: UserIdentity): Promise<Partial<UserSettings>> {
    return this.userSettingsDB.getMyUserSettings(user.id);
  }
}
