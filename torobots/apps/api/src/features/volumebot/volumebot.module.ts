import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { TokenModule } from '../token/token.module';
import { TransactionModule } from '../transaction/transaction.module';

import { VolumeBotService } from './service/volumebot.service';
import { VolumeBotEngineService } from './service/volumebot-engine.service';
import { VolumeBotController } from './controller/volumebot.controller';
import { CounterService } from 'src/features/counter/service/counter.service';

@Module({
  imports: [
    AuthModule,
    SharedModule,
    TokenModule,
    TransactionModule
  ],
  controllers: [VolumeBotController],
  providers: [VolumeBotService, VolumeBotEngineService, CounterService],
  exports: [VolumeBotService, VolumeBotEngineService],
})
export class VolumeBotModule {}
