import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';

import { BlockchainService } from './service/blockchain.service';
import { BlockchainController } from './controller/blockchain.controller';

import { NodeService } from './service/node.service';
import { NodeController } from './controller/node.controller';

import { DexService } from './service/dex.service';
import { DexController } from './controller/dex.controller';

import { CoinService } from './service/coin.service';
import { CoinController } from './controller/coin.controller';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule
  ],
  controllers: [BlockchainController, NodeController, DexController, CoinController],
  providers: [BlockchainService, NodeService, DexService, CoinService],
  exports: [BlockchainService, NodeService, DexService, CoinService],
})
export class NetworkModule {}
