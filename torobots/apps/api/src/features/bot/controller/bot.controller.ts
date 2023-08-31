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
import { BotDto } from '../dto/bot.dto';
import { BotService } from '../service/bot.service';
import { IUserDocument, ETradingInitiator, BotTradingDto, BotFilter } from "@torobot/shared"
import { CounterService } from 'src/features/counter/service/counter.service';

@ApiTags("bot")
@Controller('bot')
@UseGuards(JwtAuthGuard)
export class BotController {
  constructor(
    private botService: BotService,
    private counterService: CounterService
  ) {}

  @Get('/all/:initiator')
  getAll(@Param('initiator') initiator: ETradingInitiator, @CurrentUser() user: IUserDocument) {
    return this.botService.getAll(initiator, user);
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.botService.getById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.botService.delete(
      await this.botService.validate(id),
    );
  }

  @Post()
  async create(@Body() payload: BotDto, @CurrentUser() user: IUserDocument) {
    const botDto = await this.botService.fillDtoByDetail(payload);
    const uniqueNum = await this.counterService.getNextSequenceValue("SniperBot");
    return this.botService.create({...botDto, uniqueNum} as any, user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: BotDto
  ) {
    let botDto: any = payload;
    if (payload.blockchain && payload.tokenAddress) {
      botDto = await this.botService.fillDtoByDetail(payload);
    } 
    return this.botService.update(
      await this.botService.validate(id),
      botDto
    );
  }

  @Post('/start')
  async start(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.botService.trigger(payload, user);
  }

  @Post('/stop')
  async stop(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.botService.trigger(payload, user);
  }

  @Get('/status/all/:initiator')
  getAllStatus(@Param('initiator') initiator: ETradingInitiator) {
    return this.botService.getAllStatus(initiator);
  }

  @Get('log/:id')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.botService.getLog(id);
  }

  @Get('history/:id')
  getHistory(@Param('id', ParseObjectIdPipe) id: string) {
    return this.botService.getHistory(id);
  }

  @Post('/search')
  async search(@Body() filter: BotFilter, @CurrentUser() user: IUserDocument) {
    return this.botService.search(filter, user);
  }
}
