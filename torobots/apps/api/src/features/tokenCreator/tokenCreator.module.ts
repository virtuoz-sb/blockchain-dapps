import { TokenCreatorService } from './service/tokenCreator.service';
import { TokenCreatorBotEngineService } from './service/tokenCreatorBot-engine.service';
import { TokenCreatorController } from './controller/tokenCreator.controller';;

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { CounterService } from '../counter/service/counter.service';

@Module({
  imports: [
    AuthModule,
    SharedModule,
  ],
  controllers: [TokenCreatorController],
  providers: [TokenCreatorService, TokenCreatorBotEngineService, CounterService],
  exports: [TokenCreatorService, TokenCreatorBotEngineService],
})
export class TokenCreatorModule {}
