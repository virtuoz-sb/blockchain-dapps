import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';

import { CoinMarketVolumeService } from './service/coinmarketVolume.service';
import { CoinMarketVolumeController } from './controller/coinmarketVolume.controller';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule
  ],
  controllers: [CoinMarketVolumeController],
  providers: [CoinMarketVolumeService],
  exports: [CoinMarketVolumeService],
})
export class CoinMarketVolumeModule {}
