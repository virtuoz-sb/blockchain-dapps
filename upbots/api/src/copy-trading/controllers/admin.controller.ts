import { Controller, UseGuards, Get, Post, Put, Body, Query, Res, HttpStatus, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import MailService from "../../shared/mail.service";

import ModelsService from "../services/models.service";

import * as Trader from "../models/trader.model";

@ApiTags("copy-trading")
@Controller("copy-trading/admin")
export default class AdminController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post("/get-traders")
  // @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Get  traders",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async getTraders(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    try {
      const trader = await this.modelsService.getTradersByAdmin(data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }

  @Post("/upsert-trader")
  // @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Upsert a trader",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async upsertTraders(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    try {
      const trader = await this.modelsService.upsertTraderByAdmin(data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }

  @Post("/delete-trader")
  // @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Delete a trader",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async deleteTrader(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    try {
      const trader = await this.modelsService.deleteTraderByAdmin(data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }
}
