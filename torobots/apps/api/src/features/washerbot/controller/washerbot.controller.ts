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
import { WasherBotDto } from '../dto/washerbot.dto';
import { WasherBotService } from '../service/washerbot.service';
import { IUserDocument, BotTradingDto, WasherFilter } from '@torobot/shared';

@ApiTags('washerbot')
@Controller('washerbot')
@UseGuards(JwtAuthGuard)
export class WasherBotController {
  constructor(
    private washerbotService: WasherBotService
  ) { }

  @Get('/all')
  getAll() {
    return this.washerbotService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.washerbotService.getById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: WasherBotDto
  ) {
    let botDto: any = payload;
    return this.washerbotService.update(
      await this.washerbotService.validate(id),
      botDto
    )
  }

  @Delete(':id')  
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.washerbotService.delete(
      await this.washerbotService.validate(id)
    );
  }

  @Post()
  async create(@Body() payload: WasherBotDto, @CurrentUser() user: IUserDocument) {
    const washerbotDto = await this.washerbotService.fillDtoByDetail(payload);
    return this.washerbotService.create(washerbotDto as any, user);
  }

  @Get('log/:id')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.washerbotService.getLog(id);
  }

  @Get(':id/transactions')
  getTransactions(@Param('id', ParseObjectIdPipe) id: string) {
    // return this.liquidatorbotService.getTransactions(id);
  }

  @Post('/start')
  async start(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.washerbotService.trigger(payload, user);
  }

  @Post('/stop')
  async stop(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.washerbotService.trigger(payload, user);
  }

  @Get('/status/all')
  getAllStatus() {
    return this.washerbotService.getAllStatus();
  }

  @Post('/search')
  async search(@Body() filter: WasherFilter) {
    return this.washerbotService.search(filter);
  }

  @Get('withdraw-wallet/:id')
  withdrawWallet(@Param('id', ParseObjectIdPipe) id: string) {
    return this.washerbotService.withdrawWallet(id);
  }
}