import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { MsglogDto } from '../dto/msglog.dto';
import { MsglogService } from '../service/msglog.service';

@ApiTags("msglog")
@Controller('msglog')
export class MsglogController {
  constructor(private msglogService: MsglogService) {}

  @Get('/all')
  getAll() { 
    return this.msglogService.getAll(); 
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.msglogService.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.msglogService.delete(await this.msglogService.validate(id));
  }

  @Post()
  async create(@Body() payload: MsglogDto) {
    return this.msglogService.create(payload as any);
  }
}
