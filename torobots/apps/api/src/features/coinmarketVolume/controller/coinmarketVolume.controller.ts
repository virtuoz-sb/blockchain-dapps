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
import { CoinMarketVolumeDto } from '../dto/coinmarketVolume.dto';
import { CoinMarketVolumeService } from '../service/coinmarketVolume.service';

@ApiTags("coinmarketvolume")
@Controller('coinmarketvolume')
@UseGuards(JwtAuthGuard)
export class CoinMarketVolumeController {
  constructor(private coinMarketVolumeService: CoinMarketVolumeService) {}

  @Get('/all/:tokenId')
  getAll(
    @Param('tokenId', ParseObjectIdPipe) tokenId: string
  ) {
    return this.coinMarketVolumeService.getAll(tokenId);
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.coinMarketVolumeService.getById(id);
  }

  @Delete(':id')
  async delete(
      @Param('id', ParseObjectIdPipe) id: string
  ) {
      return this.coinMarketVolumeService.delete(
      await this.coinMarketVolumeService.validate(id),
      );
  }

  @Post()
  async create(@Body() payload: CoinMarketVolumeDto) {
      return this.coinMarketVolumeService.create(payload);
  }

  @Put(':id')
  async update(
      @Param('id', ParseObjectIdPipe) id: string,
      @Body() payload: CoinMarketVolumeDto
  ) {
      return this.coinMarketVolumeService.update(
        await this.coinMarketVolumeService.validate(id),
        payload as any,
      );
  }

  @Get('getCoinmarketcapId/:symbol/:network/:tokenAddress')
  async getCoinmarketcapId(
    @Param('symbol') symbol: string, 
    @Param('network') network: string, 
    @Param('tokenAddress') tokenAddress: string, 
  ) {
    return this.coinMarketVolumeService.getCoinmarketcapId(symbol, network, tokenAddress);
  }
  

  @Get('latest/:coinmarketcapId')
  async getLatestVolume(
    @Param('coinmarketcapId') coinmarketcapId: string
  ) {
    return this.coinMarketVolumeService.ohlcvLatest(coinmarketcapId);
  }

  @Get('coinprice/:coinmarketcapId')
  async getCoinPrice(
    @Param('coinmarketcapId') coinmarketcapId: string
  ) {
    return this.coinMarketVolumeService.coinPrice(coinmarketcapId);
  }
}
