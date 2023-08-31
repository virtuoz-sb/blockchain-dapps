import { Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import MailService from "../../shared/mail.service";

import ModelsService from "../services/models.service";
import NotificationService from "../services/notification.service";
import PerformanceService from "../services/performance.service";

import * as UserWallet from "../models/user-wallet.model";
import * as BotWallet from "../models/bot-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";
import * as SharedModels from "../models/shared.models";
import * as SharedTypes from "../models/shared.types";
import AlgobotsTotalTradedPerBotDto from "../models/algobot-total_traded.dto";

@ApiTags("perfees")
@Controller("perfees")
export default class PerfeesController {
  constructor(
    private readonly modelsService: ModelsService,
    private readonly notificationService: NotificationService,
    private readonly performanceService: PerformanceService,
    private readonly mailService: MailService
  ) {
    this.modelsService.checkUBXTBalance();
  }

  @Get("/user-wallet")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the user wallet",
  })
  @ApiResponse({ status: 200, type: UserWallet.Dto, description: "Success" })
  async getUserWallet(@UserFromJWT() user: UserDocument): Promise<UserWallet.Dto> {
    const userWalletModel = await this.modelsService.getUserWallet(user.id);
    const userwalletDto = UserWallet.mapModelToDto(userWalletModel);
    return userwalletDto;
  }

  @Get("/user-transactions")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the user transactions",
  })
  @ApiResponse({ status: 200, type: UserWallet.Dto, description: "Success" })
  async getUserTransactins(@UserFromJWT() user: UserDocument): Promise<UserTransaction.Dto[]> {
    const userTransactionModels = await this.modelsService.getUserTransactions(user.id);
    const userTransactionDtos = [];
    userTransactionModels.map((model) => {
      const dto = UserTransaction.mapModelToDto(model);
      userTransactionDtos.push(dto);
      return dto;
    });
    return userTransactionDtos;
  }

  @Get("/bot-wallets")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the bot wallets",
  })
  @ApiResponse({ status: 200, type: UserWallet.Dto, description: "Success" })
  async getBotWallets(@UserFromJWT() user: UserDocument): Promise<BotWallet.Dto[]> {
    const botWalletModels = await this.modelsService.getBotWallets(user.id);
    const botWalletDtos = [];
    botWalletModels.map((model) => {
      const dto = BotWallet.mapModelToDto(model);
      botWalletDtos.push(dto);
      return dto;
    });
    return botWalletDtos;
  }

  @Get("/bot-wallets/:botId")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get specific bot wallets",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async getBotWalletsById(@UserFromJWT() user: UserDocument, @Param("botId") botId: string): Promise<BotWallet.Dto> {
    const result = await this.modelsService.getBotWalletById(user.id, botId);
    return BotWallet.mapModelToDto(result);
  }

  @Post("/user-wallet-transfer")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the user wallet, deposit or withdraw amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.TransferDto, description: "Success" })
  async transferUserWallet(@Body() data: UserWallet.TransferDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const processedAmount = await this.modelsService.transferUserWallet(user.id, data);
    if (processedAmount > 0) {
      if (data.transferType === SharedTypes.TransferType.WITHDRAW) {
        // // send email to company
        // await this.mailService.sendUbxtWithdrawRequestEmail(user, data);
        // // send email to user
        // await this.mailService.sendUbxtWithdrawConfirmEmail(user, data);
        // notify user via email
        this.mailService.sendWithdrawalRequestNotification(user, data);
        // notificate to user
        await this.notificationService.notifyForUserTransactionUpdated(user.id);
      }
    }
    res.status(HttpStatus.OK).json({ result: processedAmount > 0, amount: processedAmount });
  }

  @Post("/bot-wallet-transfer")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async transferBotWallet(@Body() data: BotWallet.TransferDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const botWalletModel = await this.modelsService.transferBotWallet(user.id, data);
    const botWalletDto = BotWallet.mapModelToDto(botWalletModel);
    res.status(HttpStatus.OK).json(botWalletDto);
  }

  @Post("/bot-wallet-auto-refill")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw amount",
  })
  @ApiResponse({ status: 200, type: BotWallet.Dto, description: "Success" })
  async autoRefillBotWallet(@Body() data: BotWallet.AutoRefillDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const botWalletModel = await this.modelsService.autoRefillBotWallet(user.id, data);
    const botWalletDto = BotWallet.mapModelToDto(botWalletModel);
    res.status(HttpStatus.OK).json(botWalletDto);
  }

  @Post("/calc-current-perfee")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot wallet, calc current perfee",
  })
  @ApiResponse({ status: 200, type: Number, description: "Success" })
  async calcCurrentPerfee(@Body() data: SharedModels.BotSubscriptionCycleDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const result = await this.performanceService.calcCurrentPerfee(user.id, data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("/performance-cycle-close")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot wallet, deposit or withdraw amount",
  })
  @ApiResponse({ status: 200, type: Boolean, description: "Success" })
  async closePerformanceCycle(@Body() data: SharedModels.BotSubscriptionCycleDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const result = await this.performanceService.closePerformanceCycle(user.id, data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Get("/estimated-annual-perfees")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Get the estimated performance fees annually",
  })
  @ApiResponse({ status: 200, type: Number, description: "Success" })
  async estimatedAnnualPerfees(@UserFromJWT() user: UserDocument): Promise<number> {
    const estimatedAnnualPerfFees = await this.modelsService.getEstimatedAnnualPerfees();
    return estimatedAnnualPerfFees || 0;
  }

  @Get("total-traded-per-bot")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Get the total traded information per bot for the logged in user",
    description: "Get the total traded information per bot for the logged in user",
  })
  @ApiResponse({
    status: 200,
    type: AlgobotsTotalTradedPerBotDto,
    isArray: true,
    description: "success",
  })
  totalTradedPerBot(): Promise<any[]> {
    return this.modelsService.getTotalTradedAmountPerBot();
  }

  @Get("/credits-amount/:botId")
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({
    name: "botId",
    type: String,
    required: false,
  })
  @ApiOperation({
    summary: "Get credits amount of user wallet and bot wallet for checking the availibility of bot activation.",
  })
  @ApiResponse({ status: 200, type: Number, description: "Success" })
  async checkAvailabilityOfBotActivation(@UserFromJWT() user: UserDocument, @Param("botId") botId: string): Promise<number> {
    return this.modelsService.getCreditAmountOfBothWallets(user.id, botId);
  }

  @Post("/bot-paid-subscription-status")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot, get the bot paid subscription status",
  })
  @ApiResponse({ status: 200, type: Boolean, description: "Success" })
  async getBotPaidSubscriptionStatus(@Body() data: BotWallet.PaidSubscriptionDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const result = await this.modelsService.getBotPaidSubscriptionStatus(user.id, data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("/bot-paid-subscription-start")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot, start the bot paid subscription",
  })
  @ApiResponse({ status: 200, type: Boolean, description: "Success" })
  async startBotPaidSubscription(@Body() data: BotWallet.PaidSubscriptionDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const result = await this.modelsService.startBotPaidSubscription(user.id, data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Post("/bot-paid-subscription-stop")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the bot, start the bot paid subscription",
  })
  @ApiResponse({ status: 200, type: Boolean, description: "Success" })
  async stopBotPaidSubscription(@Body() data: BotWallet.PaidSubscriptionDto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const result = await this.modelsService.stopBotPaidSubscription(user.id, data);
    res.status(HttpStatus.OK).json({ result });
  }
}
