import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { AutoBotDto } from '../dto/autobot.dto';
import { AutoBotService } from '../service/autobot.service';
import { IUserDocument, BotTradingDto } from "@torobot/shared"

@ApiTags("autobot")
@Controller('autobot')
@UseGuards(JwtAuthGuard)
export class AutoBotController {
  constructor(
    private autobotService: AutoBotService
  ) {}

  @Get('/all')
  getAll() {
    return this.autobotService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.getById(id);
  }

  @Post()
  async create(@Body() payload: AutoBotDto, @CurrentUser() user: IUserDocument) {
    const autobotDto = await this.autobotService.fillDtoByDetail(payload);
    return this.autobotService.create(autobotDto as any, user);
  }

  @Post('/start')
  async start(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.autobotService.trigger(payload, user);
  }

  @Post('/stop')
  async stop(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.autobotService.trigger(payload, user);
  }

  @Get('log/:id')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.getLog(id);
  }

  @Get('history/:id')
  getHistory(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.getHistory(id);
  }

  @Get('withdraw-wallet/:id')
  withdrawWallet(@Param('id', ParseObjectIdPipe) id: string) {
    return this.autobotService.withdrawWallet(id);
  }
}
