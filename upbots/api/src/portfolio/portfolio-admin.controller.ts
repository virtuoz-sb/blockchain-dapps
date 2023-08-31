/* eslint-disable no-underscore-dangle */

import { UseInterceptors, Controller, UseGuards, Get, Post, Body, Logger, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { Model, Types } from "mongoose";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import * as moment from "moment";
import { InjectModel } from "@nestjs/mongoose";
import validationPipe from "../shared/validation.pipe";
import RouteSegments from "../utilities/route-segment-name";
import UserFromJWT from "../utilities/user.decorator";
import { PortfolioSummary, PortfolioFiltered, UbxtBalance } from "./models/portfolio.dto";
import { GetPortfolioEvolutionDto } from "./models/evolution.schema";
import PortfolioService from "./services/portfolio.service";
import UserCacheInterceptor from "../cache-config/user-cache.interceptor";
import OptionalNumberDto from "./models/optional.query-string.dto";
import AdminGuard from "../shared/admin.guard";
import { User, UserDto, UserIdentity } from "../types/user";

@ApiTags("portfolio")
@Controller("portfolio/admin")
@UseGuards(AdminGuard)
@UseGuards(AuthGuard("jwt"))
export default class PortfolioAdminController {
  private readonly logger = new Logger(PortfolioAdminController.name);

  constructor(@InjectModel("User") private userModel: Model<User>, private service: PortfolioService) {}

  @ApiOperation({
    summary: "get all portfolio and accounts details (non filtered)",
    description: `Gets all your connected exchange portfolios`,
  })
  @ApiResponse({
    status: 200,
    type: PortfolioSummary,
    description: `returns connected wallet exchange keys with their balances`,
  })
  @Post("summary")
  @UseInterceptors(UserCacheInterceptor)
  async getPortforlioSummary(@Body() data: any, @UserFromJWT() userAuth: UserIdentity, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    let { userId } = data;
    const { email, keyName } = data;
    if (email) {
      const user = await this.userModel.findOne({ email });
      userId = user._id;
    }

    const result = await this.service.getPortforlioSummary(userId, keyName ? [keyName] : null, null, null, true);
    res.status(HttpStatus.OK).json(result);
  }

  @Post("dex-evolution-task")
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: "Run PortfolioEvolutionTask function via admin",
  })
  async execDexEvolutionTask() {
    return this.service.runPortforlioEvolutionTask();
  }
}
