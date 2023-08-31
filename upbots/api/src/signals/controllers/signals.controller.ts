import {
  Controller,
  UseGuards,
  Logger,
  Get,
  Req,
  BadRequestException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
import ErrorAlgobotDto from "../../algobot/models/error-algobot.dto";
import AlgobotDataService from "../../algobot/services/algobot.data-service";
import { UserIdentity } from "../../types/user";
import UserFromJWT from "../../utilities/user.decorator";

@ApiTags("signals")
@Controller("signals")
@UseGuards(AuthGuard("jwt"))
export default class SignalsController {
  private readonly logger = new Logger(SignalsController.name);

  constructor(private algobotService: AlgobotDataService) {}

  @Get("myalgoboterrors")
  @ApiOperation({
    summary: "get the subscription user bots errors",
    description: `The subscription user bots could encounter events generating errors. Call Response: id = subscription identifier, botId = bot identifier, errorType = either subscription either order-tracking, error = the error, errorAt = error timestamp, errorReason = the error reason`,
  })
  @ApiResponse({ status: 200, type: Boolean })
  getMyAlgoBotsErrors(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(10), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number
  ): Promise<ErrorAlgobotDto[]> {
    if (!user) {
      throw new BadRequestException();
    }
    // return this.algobotService.getAlgoBotsErrors(); // ALL
    return this.algobotService.getMyAlgoBotsErrors(user.id, page, pageSize);
  }
}
