import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';
import { TransactionModule } from '../transaction/transaction.module';

import { AutoBotService } from './service/autobot.service';
import { AutoBotEngineService } from './service/autobot-engine.service';
import { PoolService } from '../pool/service/pool.service';
import { AutoBotController } from './controller/autobot.controller';
import { CounterService } from '../counter/service/counter.service';


@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule,
    TransactionModule
  ],
  controllers: [AutoBotController],
  providers: [AutoBotService, AutoBotEngineService, PoolService, CounterService],
  exports: [AutoBotService, AutoBotEngineService],
})
export class AutoBotModule {}
