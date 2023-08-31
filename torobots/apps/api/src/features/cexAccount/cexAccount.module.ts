import { CexAccountService } from './service/cexAccount.service';
import { CexAccountController } from './controller/cexAccount.controller';

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    AuthModule,
    SharedModule,
  ],
  controllers: [CexAccountController],
  providers: [CexAccountService],
  exports: [CexAccountService],
})
export class CexAccountModule {}
