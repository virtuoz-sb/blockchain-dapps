import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NetworkModule } from './network/network.module';
import { WalletModule } from './wallet/wallet.module';
import { TokenModule } from './token/token.module';
import { BotModule } from './bot/bot.module';
import { TransactionModule } from './transaction/transaction.module';
import { PoolModule } from './pool/pool.module';
import { AutoBotModule } from './autobot/autobot.module';
import { VolumeBotModule } from './volumebot/volumebot.module';
import { LiquidatorBotModule } from './liquidatorbot/liquidatorbot.module';
import { ReportModule } from './report/report.module';
import { CexAccountModule } from './cexAccount/cexAccount.module';
import { WasherBotModule } from './washerbot/washerbot.module';
import { MsglogModule } from './msglog/msglog.module';
import { CompanyWalletModule } from './companyWallet/companyWallet.module';
import { TokenCreatorModule } from './tokenCreator/tokenCreator.module';
import { CoinMarketVolumeModule } from './coinmarketVolume/coinmarketVolume.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    NetworkModule,
    WalletModule,
    TokenModule,
    BotModule,
    TransactionModule,
    PoolModule,
    AutoBotModule,
    VolumeBotModule,
    LiquidatorBotModule,
    ReportModule,
    CexAccountModule,
    WasherBotModule,
    MsglogModule,
    CompanyWalletModule,
    TokenCreatorModule,
    CoinMarketVolumeModule
  ],
  controllers: [],
  exports: [
    AuthModule,
    UserModule,
    NetworkModule,
    WalletModule,
    TokenModule,
    BotModule,
    TransactionModule,
    PoolModule,
    AutoBotModule,
    VolumeBotModule,
    LiquidatorBotModule,
    ReportModule,
    CexAccountModule,
    WasherBotModule,
    MsglogModule,
    CompanyWalletModule,
    TokenCreatorModule,
    CoinMarketVolumeModule
  ],
})
export class FeaturesModule {}
