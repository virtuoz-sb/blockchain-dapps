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
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { DexDto } from '../dto/dex.dto';
import { DexService } from '../service/dex.service';

@ApiTags("network")
@Controller('network/dex')
@UseGuards(JwtAuthGuard)
export class DexController {
  constructor(private dexService: DexService) {}

  @Get('/all')
  getAll() {
    return this.dexService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.dexService.getById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.dexService.delete(
      await this.dexService.validate(id),
    );
  }

  @Post()
  async create(@Body() dex: DexDto) {
    return this.dexService.create(dex);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: DexDto
  ) {
    return this.dexService.update(
      await this.dexService.validate(id),
      body as any,
    );
  }
}
