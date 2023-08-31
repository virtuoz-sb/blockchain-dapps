import { Controller, UseGuards, Get, Post, Body, Query, Res, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import AdminGuard from "../../shared/admin.guard";
import UserFromJWT from "../../utilities/user.decorator";
import { User as UserDocument } from "../../types/user";

import AdminService from "../services/admin.service";
import DbUpdatingService from "../services/db-updating.service";

@ApiTags("admins")
@Controller("admins")
// @UseGuards(AdminGuard)
// @UseGuards(AuthGuard("jwt"))
export default class AdminController {
  constructor(private readonly adminService: AdminService, private readonly dbUpdatingService: DbUpdatingService) {}

  @Get("version")
  @ApiResponse({ status: 200, type: String, description: "Success" })
  async getVersion(@Res() res: Response) {
    const version = "0.1.1";
    res.status(HttpStatus.OK).json({ version });
  }

  @Post("get-user")
  @ApiOperation({
    summary: "get user by id or email",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async adminGetUser(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.getUser(data);
    res.status(HttpStatus.OK).json(result);
  }

  @Post("discord-mass-message")
  @ApiOperation({
    summary: "send mass message via discord",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async sendMassMessageViaDiscord(@Body() data: any, @Res() res: Response) {
    this.adminService.sendDiscordMassMessages(data.message);
    res.status(HttpStatus.OK).json({ result: "success" });
  }

  @Post("get-bot-signals")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async getBotSignals(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.getBotSignals(data?.botIds);
    return result;
  }

  @Post("get-user-bot-subscriptions")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async getUserBotSubscriptions(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const { botIds, userIds, condSubs, userBalance, userEmails, others } = data;
    const result = await this.adminService.getUserBotSubscriptions(botIds, userIds, condSubs, userBalance, userEmails, others);
    return result;
  }

  @Post("update-user-bot-subscriptions")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async updateUserBotSubscriptions(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.updateUserBotSubscriptions(
      data?.botIds,
      data?.userIds,
      data?.condSubs,
      data?.userBalance,
      data?.updateMode
    );
    return result;
  }

  @Post("update-user-bot-subscription")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async updateUserBotSubscription(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.updateUserBotSubscription(data?.subId, data?.updates);
    return result;
  }

  @Post("fix-user-bot-subscriptions")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async fixUserBotSubscriptions(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.fixUserBotSubscriptions(data?.botIds, data?.userIds, data?.fixFlag);
    return result;
  }

  @Post("close-user-bot-subscriptions")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async closeUserBotSubscriptions(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.closeUserBotSubscriptions(data?.botIds, data?.userIds);
    return result;
  }

  @Post("get-user-bot-orders")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async getUserBotOrders(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.getUserBotOrders(data?.subId, data?.count);
    return result;
  }

  @Post("close-user-bot-order")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async closeUserBotOrder(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.closeUserBotOrder(data?.orderId);
    return result;
  }

  // transactions///////////////////////////////////
  @Post("get-transactions")
  @ApiOperation({
    summary: "get transactions",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async getTransactions(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.getTransactions(data);
    res.status(HttpStatus.OK).json(result);
  }

  // wallets////////////////////////////////////////
  @Post("get-wallets")
  @ApiOperation({
    summary: "get wallets",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async getWallets(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.getWallets(data);
    res.status(HttpStatus.OK).json(result);
  }

  @Post("set-user-wallet")
  @ApiOperation({
    summary: "set user wallet",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async setUserWallet(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.setUserWallet(data);
    res.status(HttpStatus.OK).json(result);
  }

  @Post("fix-user-wallets")
  @ApiOperation({
    summary: "fix user wallets",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async fixUserWallets(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.fixUserWallets(data);
    res.status(HttpStatus.OK).json(result);
  }

  // exchange ////////////////////////////////////////////////////
  @Post("get-exchanges")
  @ApiOperation({
    summary: "get exchanges",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async getExchanges(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.getExchanges(data);
    res.status(HttpStatus.OK).json(result);
  }

  // get users by subscription ////////////////////////////////////////////////////
  @Post("get-users-by-subscription")
  @ApiOperation({
    summary: "get users by subscription",
  })
  @ApiResponse({ status: 200, description: "Success" })
  async getUsersBySubscription(@Body() data: any, @Res() res: Response) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      res.status(HttpStatus.OK).json({ result: false, error: "secret key is invalid" });
    }

    const result = await this.adminService.getUsersBySubscription(data);
    res.status(HttpStatus.OK).json(result);
  }

  // get algobot
  @Post("get-algobot")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async getAlgoBot(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.getAlgoBot(data?.botId);
    return result;
  }

  // update algobot
  @Post("update-algobot")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async updateAlgoBot(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.updateAlgoBot(data?.botId, data?.updates);
    return result;
  }

  // get bot last trades
  @Post("get-bot-last-trades")
  @ApiOperation({
    summary: "",
  })
  @ApiResponse({ status: 200, type: Object, description: "Success" })
  async getAlgobotLastTrades(@Body() data: any) {
    if (data.secret !== process.env.PFS_ADMINS_SECRET_KEY) {
      return { result: false, error: "secret key is invalid" };
    }
    const result = await this.adminService.getAlgobotLastTrades(data?.botId, data?.config);
    return result;
  }
}
