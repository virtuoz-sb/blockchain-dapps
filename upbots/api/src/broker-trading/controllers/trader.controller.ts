import { Controller, UseGuards, Get, Post, Put, Body, Query, Res, HttpStatus, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import MailService from "../../shared/mail.service";

import ModelsService from "../services/models.service";

import * as Trader from "../models/trader.model";

@ApiTags("broker-trading")
@Controller("broker-trading")
export default class TraderController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get("/get-trader")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the user trader",
  })
  @ApiResponse({ status: 200, type: Trader.Dto, description: "Success" })
  async getTrader(@UserFromJWT() user: UserDocument): Promise<Trader.Dto> {
    const ret = await this.modelsService.createTrader(user.id);
    return ret;
  }

  @Get("/get-deposit-address/:network/:currency")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the deposit address",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async getDepositAddress(
    @UserFromJWT() user: UserDocument,
    @Param("network") network: string,
    @Param("currency") currency: string
  ): Promise<any> {
    const ret = await this.modelsService.getTraderDepositAddress(user.id, network, currency);
    return ret;
  }

  @Get("/get-balance/:type")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get balance",
  })
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getBalance(@UserFromJWT() user: UserDocument, @Param("type") type: string): Promise<any> {
    const ret = await this.modelsService.getBalance(user.id, type);
    return ret;
  }

  @Get("/get-transactions")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get balance",
  })
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getTransactions(@UserFromJWT() user: UserDocument): Promise<any> {
    const ret = await this.modelsService.getTransactions(user.id);
    return ret;
  }

  @Post("/withdraw")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, withdraw fund",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async withdraw(@UserFromJWT() user: UserDocument, @Body() data: Trader.WithdrawDto, @Res() res: Response) {
    try {
      const trader = await this.modelsService.withdraw(user.id, data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }
}
