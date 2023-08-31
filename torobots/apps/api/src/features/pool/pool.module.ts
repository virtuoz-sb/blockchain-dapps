import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { PoolService } from './service/pool.service';
import { PoolController } from './controller/pool.controller';
import { CounterService } from '../counter/service/counter.service';

@Module({
  imports: [
    AuthModule,
    SharedModule,
  ],
  controllers: [PoolController],
  providers: [PoolService, CounterService],
  exports: [PoolService],
})
export class PoolModule {}
