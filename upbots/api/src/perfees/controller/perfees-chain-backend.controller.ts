import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger, Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus } from "@nestjs/common";

import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import AdminGuard from "../../shared/admin.guard";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import AdminsService from "../services/admins.service";
import * as BotWallet from "../models/bot-wallet.model";

import DepositService from "../services/deposit.service";

@ApiTags("perfees")
@Controller("perfees/chain-backend")
export default class PerfeesChainBackendController {
  constructor(private readonly depositService: DepositService) {}

  @Post("new-deposit")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async newDeposit(@Body() data: any, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    // if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
    //   res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    // }

    try {
      const result = await this.depositService.depositConfirm(data);
      res.status(HttpStatus.OK).json(result);
    } catch (e) {
      res.status(HttpStatus.OK).json({
        result: "FAILED",
        message: e.message,
      });
    }
  }
}
