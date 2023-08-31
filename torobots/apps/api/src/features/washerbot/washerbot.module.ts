import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';
import { TransactionModule } from '../transaction/transaction.module';

import { WasherBotService } from './service/washerbot.service';
import { WasherBotEngineService } from './service/washerbot-engine.service';
import { WasherBotController } from './controller/washerbot.controller';
import { CounterService } from '../counter/service/counter.service';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule,
    TransactionModule
  ],
  controllers: [WasherBotController],
  providers: [WasherBotService, WasherBotEngineService, CounterService],
  exports: [WasherBotService, WasherBotEngineService],
})

export class WasherBotModule { }