/* eslint-disable no-param-reassign */
import {
  Query,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Logger,
  ParseIntPipe,
  UseGuards,
  UnprocessableEntityException,
} from "@nestjs/common";

import { InjectModel } from "@nestjs/mongoose";
import { AuthGuard } from "@nestjs/passport";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Model, Types } from "mongoose";
import AdminGuard from "../shared/admin.guard";
import { UserIdentity } from "../types";
import UserFromJWT from "../utilities/user.decorator";
import { AlgobotOrderCorrelationDto } from "./models/algobot-order-correlation.dto";
import { AlgoBotModel } from "./models/algobot.model";
import { SignalTrackingAuditModel, SignalTrackingAuditsModelName } from "./models/signal-tracking-audit";
import AlgobotAuditDataService from "./services/algobot-audit.data-service";

@ApiTags("algobots")
@Controller("algobots")
@UseGuards(AdminGuard)
@UseGuards(AuthGuard("jwt"))
export default class AlgobotAuditController {
  private readonly logger = new Logger(AlgobotAuditController.name);

  constructor(
    @InjectModel("AlgobotModel") private botModel: Model<AlgoBotModel>,
    @InjectModel(SignalTrackingAuditsModelName) private signalAuditModel: Model<SignalTrackingAuditModel>,
    private auditDataSvc: AlgobotAuditDataService
  ) {}

  @Get("admin/signalaudits")
  @ApiOperation({
    summary:
      "Returns algobot signal tracking audits and its correlated order trackings (and bot subscription), helping the admin to query and investigate orders releated to a signal",
  })
  @ApiResponse({
    status: 200,
    type: AlgobotOrderCorrelationDto,
    isArray: true,
    description: "success",
  })
  getAlgobotsOrdersCorrelationAudit(
    @UserFromJWT() user: UserIdentity,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(50), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number,
    @Query("b") botId: string,
    @Query("signal") signal: string,
    @Query("c", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) botCycle: number
  ): Promise<AlgobotOrderCorrelationDto[]> {
    this.logger.log(`admin user ${user.id} getAlgobotsAudits botid '${botId}'`);
    if (botId) {
      if (!Types.ObjectId.isValid(botId)) {
        throw new UnprocessableEntityException("invalid b parameter");
      }
    }
    if (botId === "") {
      botId = null;
    }
    let signalCorrelation = signal;
    if (signal === "") {
      signalCorrelation = null;
    }
    const botCycleNonDefault = botCycle > 0 ? botCycle : undefined;
    return this.auditDataSvc.getAlgbobotsOrdersForAdmin({ page, pageSize, botId, botCycle: botCycleNonDefault, signalCorrelation });
  }
}
