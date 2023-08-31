import { CompanyWalletService } from './service/companyWallet.service';
import { CompanyWalletController } from './controller/companyWallet.controller';

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../../shared/shared.module';
import { CounterService } from '../counter/service/counter.service';

@Module({
  imports: [
    AuthModule,
    SharedModule,
  ],
  controllers: [CompanyWalletController],
  providers: [CompanyWalletService, CounterService],
  exports: [CompanyWalletService],
})
export class CompanyWalletModule {}
