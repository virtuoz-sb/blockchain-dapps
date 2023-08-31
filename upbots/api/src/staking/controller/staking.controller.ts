import { Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import ModelsService from "../services/models.service";

import * as UserWallet from "../models/user-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";

@ApiTags("staking")
@Controller("staking")
export default class StakingController {
  constructor(private readonly modelsService: ModelsService) {}

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

  @Post("/user-transaction")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For the current user, add user transaction",
  })
  @ApiResponse({ status: 200, type: Number, description: "Success" })
  async addUserTransaction(@Body() data: UserTransaction.Dto, @UserFromJWT() user: UserDocument, @Res() res: Response) {
    const result = await this.modelsService.addUserTransaction(user.id, data);
    res.status(HttpStatus.OK).json({ result });
  }

  @Get("/user-transactions")
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "For current user, get the user transactions",
  })
  @ApiResponse({ status: 200, type: UserTransaction.Dto, description: "Success" })
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
}
