import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';
import { TransactionModule } from '../transaction/transaction.module';

import { LiquidatorBotService } from './service/liquidatorbot.service';
import { LiquidatorBotEngineService } from './service/liquidatorbot-engine.service';
import { LiquidatorBotController } from './controller/liquidatorbot.controller';
import { CounterService } from '../counter/service/counter.service';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule,
    TransactionModule
  ],
  controllers: [LiquidatorBotController],
  providers: [LiquidatorBotService, LiquidatorBotEngineService, CounterService],
  exports: [LiquidatorBotService, LiquidatorBotEngineService],
})

export class LiquidatorBotModule { }