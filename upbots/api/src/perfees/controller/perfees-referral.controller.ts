/* eslint-disable no-underscore-dangle */

import { Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import MailService from "../../shared/mail.service";

import ModelsService from "../services/models.service";
import ReferralService from "../services/referral.service";
import * as UserWallet from "../models/user-wallet.model";

@ApiTags("perfees")
@Controller("perfees")
@UseGuards(AuthGuard("jwt"))
export default class PerfeesReferralController {
  constructor(private readonly modelsService: ModelsService, private readonly referralService: ReferralService) {}

  @Get("user-referral")
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getUserReferral(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const referral = await this.referralService.getUserReferral(user.id);
    const invitorWallet = await this.modelsService.getUserWallet(user.id);
    const invitor = {
      _id: referral._id,
      referralCode: referral.referralCode,
      totalEarned: invitorWallet.totalEarned.referral,
    };

    const result = {
      invitor,
    };

    res.status(HttpStatus.OK).json(result);
  }

  @Get("user-referees")
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getUserReferees(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const referees = await this.referralService.getUserReferees(user.id);
    res.status(HttpStatus.OK).json(referees);
  }

  @Get("referral-transactions")
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getReferralTransactions(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const referees = await this.referralService.getReferralTransactions(user.id);
    res.status(HttpStatus.OK).json(referees);
  }
}
