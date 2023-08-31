import { Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import AdminGuard from "../../shared/admin.guard";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import AdminsService from "../services/admins.service";

@ApiTags("staking")
@Controller("staking/admin")
@UseGuards(AdminGuard)
@UseGuards(AuthGuard("jwt"))
export default class StakingAdminController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get("version")
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getVersion(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const version = "0.1.1";
    res.status(HttpStatus.OK).json({ version });
  }
}
