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
import { VolumeBotDto } from '../dto/volumebot.dto';
import { VolumeBotService } from '../service/volumebot.service';
import { IUserDocument, BotTradingDto, VolumeBotFilter } from '@torobot/shared';
import { CounterService } from 'src/features/counter/service/counter.service';

@ApiTags("volumebot")
@Controller('volumebot')
@UseGuards(JwtAuthGuard)
export class VolumeBotController {
  constructor(
    private volumebotService: VolumeBotService,
    private counterService: CounterService
  ) { }

  @Get('/all')
  getAll() {
    return this.volumebotService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.volumebotService.getById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: VolumeBotDto
  ) {
    let botDto: any = payload;
    // if (payload.blockchain && payload.token) {
    //   botDto = await this.volumebotService.fillDtoByDetail(payload);
    // }
    return this.volumebotService.update(
      await this.volumebotService.validate(id),
      botDto
    )
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.volumebotService.delete(
      await this.volumebotService.validate(id)
    );
  }
  
  @Post()
  async create(@Body() payload: VolumeBotDto, @CurrentUser() user: IUserDocument) {
    const volumebotDto = await this.volumebotService.fillDtoByDetail(payload);
    const uniqueNum = await this.counterService.getNextSequenceValue("VolumeBot");
    return this.volumebotService.create({...volumebotDto, uniqueNum} as any, user);
  }

  @Get('log/:id')
  getLog(@Param('id', ParseObjectIdPipe) id: string) {
    return this.volumebotService.getLog(id);
  }

  @Post('/start')
  async start(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.volumebotService.trigger(payload, user);
  }

  @Post('/stop')
  async stop(@Body() payload: BotTradingDto, @CurrentUser() user: IUserDocument) {
    return this.volumebotService.trigger(payload, user);
  }

  @Get('/status/all')
  getAllStatus() {
    return this.volumebotService.getAllStatus();
  }

  @Post('/search')
  async search(@Body() filter: VolumeBotFilter) {
    return this.volumebotService.search(filter);
  }
}
