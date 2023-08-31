/* eslint-disable */
import { Controller, Post, UseGuards, Logger, Get, Req, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Request } from "express";
import ComingSoon from "../dbmodels/comingsoon";
import ComingSoonRepository from "../repositories/comingsoon.repository";
import { User as UserDocument } from "../../types/user";
import UserFromJWT from "../../utilities/user.decorator";
import MailService from "../../shared/mail.service";

@ApiTags("marketing")
@Controller("marketing") // /api(from main ts global prefix)/marketing
export default class MarketingController {
  constructor(private comingsoonDB: ComingSoonRepository, private mailService: MailService) {}

  @ApiOperation({
    summary: "health checker",
    description: `get the health of the marketing endpoint`,
  })
  @Get()
  async healthcheck(@Req() req: Request): Promise<any> {
    Logger.debug("healthcheck", "MarketinController");

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    return { healthcheck: "ok", date: new Date(), ip };
  }

  @ApiOperation({
    summary: "send a transaction email related to coming soon",
    description: `send an email through transactional template in mailjet to manage customers email subscription`,
  })
  @Post()
  @UseGuards(AuthGuard("jwt"))
  async sendMail(@Body() trackComingSoon: Partial<ComingSoon>, @UserFromJWT() user: UserDocument): Promise<ComingSoon> {
    Logger.debug("sendMail", "MarketingController");

    if (process.env.EMAIL_SEND_COMINGSOON === "true") {
      Logger.debug("logging email", "MarketingController");
      await this.mailService.sendComingSoonEmail(trackComingSoon);
    } else {
      Logger.debug("send coming soon email deactivated", "MarketingController");
    }

    Logger.debug("logging data", "MarketingController");
    return this.comingsoonDB.addComingSoon(trackComingSoon);
  }
}
