import { Module } from '@nestjs/common';
import { MsglogService } from './service/msglog.service';
import { MsglogController } from './controller/msglog.controller';
@Module({
  controllers: [MsglogController],
  providers: [MsglogService],
  exports: [MsglogService],
})
export class MsglogModule {}
