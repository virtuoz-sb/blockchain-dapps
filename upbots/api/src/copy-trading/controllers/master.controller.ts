import { Controller, UseGuards, Get, Post, Put, Delete, Body, Query, Res, HttpStatus, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import MailService from "../../shared/mail.service";

import ModelsService from "../services/models.service";

import * as Trader from "../models/trader.model";

@ApiTags("copy-trading")
@Controller("copy-trading")
export default class MasterController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get("/get-trader/:botId")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the user trader",
  })
  @ApiResponse({ status: 200, type: Trader.Dto, description: "Success" })
  async getTrader(@UserFromJWT() user: UserDocument, @Param("botId") botId: string): Promise<Trader.Dto> {
    const ret = await this.modelsService.getTraderByMaster(user.id, botId);
    return ret;
  }

  @Post("/upsert-trader")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Upsert a trader",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async upsertTrader(@UserFromJWT() user: UserDocument, @Body() data: any, @Res() res: Response) {
    try {
      const trader = await this.modelsService.upsertTraderByMaster(user.id, data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }

  @Delete("/delete-trader/:botId")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Delete a trader",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async deleteTrader(@UserFromJWT() user: UserDocument, @Param("botId") botId: string, @Res() res: Response) {
    try {
      await this.modelsService.deleteTraderByMaster(user.id, botId);
      res.status(HttpStatus.OK).json({ result: true });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }
}
