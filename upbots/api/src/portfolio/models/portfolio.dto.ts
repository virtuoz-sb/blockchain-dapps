/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { SubAccountBalance } from "src/exchangeProxy/models/exchange-balance.model";

export class BtcAmount {
  constructor({ btc = 0, eur = 0, usd = 0 }: { btc?: number; eur?: number; usd?: number } = {}) {
    this.btc = btc;
    this.eur = eur;
    this.usd = usd;
  }

  @ApiProperty()
  btc: number;

  @ApiProperty()
  eur: number;

  @ApiProperty()
  usd: number;

  static readonly Zero: BtcAmount = new BtcAmount();
}

// tslint:disable-next-line:max-classes-per-file
export class DistributionAmount extends BtcAmount {
  private static precision = 15;

  constructor({
    btc = 0,
    eur = 0,
    usd = 0,
    percentage = 0,
    currency = null,
    currencyAmount = null,
  }: {
    btc?: number;
    eur?: number;
    usd?: number;
    percentage?: number;
    currency?: string;
    currencyAmount?: number;
  } = {}) {
    super({ btc, eur, usd });
    this.percentage = percentage;
    this.currency = currency;
    this.currencyAmount = currencyAmount;
  }

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  currencyAmount: number;
}

export class AccountTotal {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  exchange: string;

  @ApiProperty()
  subAccounts: any[];

  @ApiProperty()
  total: BtcAmount;

  @ApiProperty()
  error?: boolean;
}

export interface AccountToUpdate {
  userId: string;
  exchange: string;
  keyId: string;
  keyName: string;
}

// tslint:disable-next-line:max-classes-per-file
export class DistributionOverview {
  @ApiProperty()
  other: DistributionAmount;

  [currency: string]: DistributionAmount;
}

export interface PortfolioFiltered {
  aggregated: BtcAmount;
  distribution: DistributionOverview; // for pie chart
}

export class PortfolioSummary implements PortfolioFiltered {
  constructor() {
    this.accounts = new Array<AccountTotal>();
  }

  @ApiProperty()
  aggregated: BtcAmount;

  @ApiProperty({ type: [AccountTotal] })
  accounts: AccountTotal[];

  @ApiProperty()
  distribution: DistributionOverview; // for pie chart

  @ApiProperty()
  ignoredCurrencies: Array<string>;
}

export class UbxtBalanceCache {
  timestamp: number;

  ubxtToBtcConversionRate: number;

  btcToUsdConversionRate: number;

  btcToEurConversionRate: number;
}

export class UbxtBalance {
  @ApiProperty()
  ubxt: number;

  @ApiProperty()
  btc: number;

  @ApiProperty()
  eur: number;

  @ApiProperty()
  usd: number;
}
