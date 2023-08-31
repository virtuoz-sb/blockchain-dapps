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
import { CoinDto } from '../dto/coin.dto';
import { CoinService } from '../service/coin.service';

@ApiTags("network")
@Controller('network/coin')
@UseGuards(JwtAuthGuard)
export class CoinController {
  constructor(private coinService: CoinService) {}

  @Get('/all')
  getAll() {
    return this.coinService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.coinService.getById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.coinService.delete(
      await this.coinService.validate(id),
    );
  }

  @Post()
  async create(@Body() payload: CoinDto) {
    const coinDto = await this.coinService.fillDtoByDetail(payload);
    return this.coinService.create(coinDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() payload: CoinDto
  ) {
    const coinDto = await this.coinService.fillDtoByDetail(payload);
    return this.coinService.update(
      await this.coinService.validate(id),
      coinDto as any,
    );
  }
}
