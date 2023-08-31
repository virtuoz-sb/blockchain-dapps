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
@Controller("broker-trading/admin")
export default class AdminController {
  constructor(private readonly modelsService: ModelsService) {}

  @Post("/get-owners")
  // @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Get  owners",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async getOwners(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    try {
      const trader = await this.modelsService.getOwners(data, true);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }

  @Post("/upsert-owner")
  // @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Upsert a owner",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async upsertOwner(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    try {
      const trader = await this.modelsService.upsertOwner(data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }

  @Post("/delete-owner")
  // @UseGuards(AuthGuard("jwt"))
  @ApiOperation({
    summary: "Delete a trader",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async deleteOwner(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    try {
      const trader = await this.modelsService.deleteOwner(data);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }

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
      const trader = await this.modelsService.getTraders(data, true);
      res.status(HttpStatus.OK).json(trader);
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST);
    }
  }
}
