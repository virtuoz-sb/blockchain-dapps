import { Controller, UseGuards, Get, Put, Post, Body, Param, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { TransactionStatuses } from "../models/shared.types";
import AdminGuard from "../../shared/admin.guard";
import SuperAdminGuard from "../../shared/superadmin.guard";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import AdminsService from "../services/admins.service";
import * as BotWallet from "../models/bot-wallet.model";

@ApiTags("perfees")
@Controller("perfees/admin")
// @UseGuards(AdminGuard)
// @UseGuards(AuthGuard("jwt"))
export default class PerfeesAdminController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get("version")
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getVersion(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const version = "0.1.1";
    res.status(HttpStatus.OK).json({ version });
  }

  @Post("get-deposit-address")
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw credit amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async adminGetDepositAddress(@Body() data: any, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.getDepositAddress(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("get-wallets")
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw credit amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async adminGetWallets(@Body() data: any, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.getWallets(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("get-user")
  @ApiOperation({
    summary: "get user by id or email",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async adminGetUser(@Body() data: any, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.getUser(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("get-logs")
  @ApiOperation({
    summary: "For the user, get perfee related logs",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async adminGetLogs(@Body() data: any, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.getLogs(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("user-wallet-transfer")
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw credit amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async adminTransferUserWallet(@Body() data: BotWallet.AdminSetCreditDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.transferUserWallet(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("bot-wallet-set-credit")
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw credit amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async adminSetCreditToBotWallet(@Body() data: BotWallet.AdminSetCreditDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.setCreditToBot(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("bot-paid-subscription-get")
  @ApiOperation({
    summary: "For the bot, get the bot paid subscription",
  })
  @ApiResponse({ status: 200, type: Boolean, description: "Success" })
  async adminGetBotPaidSubscription(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.getBotPaidSubscription(data);
    res.status(HttpStatus.OK).json(result);
  }

  @Post("bot-paid-subscription-update")
  @ApiOperation({
    summary: "For the bot, get the bot paid subscription",
  })
  @ApiResponse({ status: 200, type: Boolean, description: "Success" })
  async adminUpdateBotPaidSubscription(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminsService.updateBotPaidSubscription(data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Get("user-wallet-withdraws/:status")
  @UseGuards(SuperAdminGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getUserWalletWithdraws(@UserFromJWT() user: UserDocument, @Param("status") status: TransactionStatuses) {
    return this.adminsService.getUserWalletWithdraws(status);
  }

  @Put("user-wallet-withdraws/:trackingId/confirm")
  @UseGuards(SuperAdminGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async confirmUserWalletWithdraw(@UserFromJWT() user: UserDocument, @Param("trackingId") trackingId: string, @Body() data: any) {
    return this.adminsService.confirmUserWalletWithdraw(trackingId, data);
  }

  @Put("user-wallet-withdraws/:trackingId/cancel")
  @UseGuards(SuperAdminGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async cancelUserWalletWithdraw(@UserFromJWT() user: UserDocument, @Param("trackingId") trackingId: string) {
    return this.adminsService.cancelUserWalletWithdraw(trackingId);
  }

  /// /////////////////////////////////////////
  @Get("user-wallet")
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getUserWallet(@Query("email") email: string) {
    return this.adminsService.getUserWallet(email);
  }

  @Put("user-wallet-credit")
  @UseGuards(SuperAdminGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async addUserWalletCredit(@Body() data: any) {
    return this.adminsService.addUserWalletCredit(data);
  }

  @Get("user-transactions")
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async getUserTransactions(@Query("email") email: string) {
    return this.adminsService.getUserTransactions(email);
  }
}
