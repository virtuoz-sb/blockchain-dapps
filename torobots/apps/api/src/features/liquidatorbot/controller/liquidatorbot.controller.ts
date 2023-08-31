import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards
} from '@nestjs/common';

import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from 'src/shared/pipe/parse-object-id.pipe';
import { CurrentUser } from 'src/features/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/features/auth/guard/jwt-auth.guard';
import { LiquidatorBotDto } from '../dto/liquidatorbot.dto';
import { LiquidatorBotService } from '../service/liquidatorbot.service';
import { IUserDocument, BotTradingDto, LiquidatorFilter } from '@torobot/shared';

@ApiTags('liquidatorbot')
@Controller('liquidatorbot')
@UseGuards(JwtAuthGuard)
export class LiquidatorBotController {
  constructor(
    private liquidatorbotService: LiquidatorBotService
  ) { }

  @Get('/all')
  getAll() {
    return this.liquidatorbotService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.liquidatorbotService.getById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: LiquidatorBotDto
  ) {
    let botDto: any = payload;
    return this.liquidatorbotService.update(
      await this.liquidatorbotService.validate(id),
      botDto
    )
  }

  @Delete(':id')  
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.liquidatorbotService.delete(
      await this.liquidatorbotService.validate(id)
    );
  }

  @Post()
  async create(@Body() payload: LiquidatorBotDto, @CurrentUser() user: IUserDocument) {
    const liquidatorbotDto = await this.liquidatorbotService.fillDtoByDetail(payload);
    return this.liquidatorbotService.create(liquidatorbotDto as any, user);
  }

  @Get('log/:id')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.liquidatorbotService.getLog(id);
  }

  @Get(':id/transactions')
  getTransactions(@Param('id', ParseObjectIdPipe) id: string) {
    // return this.liquidatorbotService.getTransactions(id);
  }

  @Post('/start')
  async start(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.liquidatorbotService.trigger(payload, user);
  }

  @Post('/stop')
  async stop(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.liquidatorbotService.trigger(payload, user);
  }

  @Get('/status/all')
  getAllStatus() {
    return this.liquidatorbotService.getAllStatus();
  }

  @Post('/search')
  async search(@Body() filter: LiquidatorFilter) {
    return this.liquidatorbotService.search(filter);
  }

  @Post(':id/orderbooks')
  getOrderbooks(@Param('id', ParseObjectIdPipe) id: string, @Body() filter: any) {
    return this.liquidatorbotService.getOrderbooks(id, filter);
  }
}