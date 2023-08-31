/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { DigitsCountingPrecisionMode } from "../../db_seeds/precision-mode";
import { Limits, MarketPairSetting, Precision } from "./market-pair-settings.model";

export class ExchangeSettingsReponse {
  @ApiProperty()
  compatibleExchanges: Array<AllowedExchangeDto>;

  @ApiProperty()
  tradingSettings: Array<AllowedExchangeWithPairsDto>;
}

export class MarketPairSettingDto implements MarketPairSetting {
  @ApiProperty()
  exchange: string;

  // @ApiProperty()
  // marketId: string;

  @ApiProperty()
  symbolLabel: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  baseCurrency: string;

  @ApiProperty()
  quoteCurrency: string;

  @ApiProperty()
  tradingAllowed: boolean;

  @ApiProperty()
  type?: string;

  @ApiProperty()
  spot?: boolean;

  @ApiProperty()
  margin?: boolean;

  @ApiProperty()
  swap?: boolean;

  @ApiProperty()
  future?: boolean;

  @ApiProperty()
  precisionMode: DigitsCountingPrecisionMode;

  @ApiProperty()
  limits: Limits;

  @ApiProperty()
  precision: Precision;

  @ApiProperty()
  symbolForData: string;

  @ApiProperty()
  market: string;

  @ApiProperty()
  contractSize?: number;
}

export class AllowedExchangeDto implements AllowedExchange {
  @ApiProperty()
  name: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  soon: boolean;
}

export interface AllowedExchange {
  /**
   * exchange identifier (i.e. binance, ftx)
   */
  name: string;
  label: string;
  key?: string;
  enabled: boolean;
  soon: boolean;
}

export interface AllowedExchangeWithPairs extends AllowedExchange {
  pairs: MarketPairSetting[];
}

export class AllowedExchangeWithPairsDto extends AllowedExchangeDto implements AllowedExchangeWithPairs {
  @ApiProperty({ type: [MarketPairSettingDto] })
  pairs: MarketPairSettingDto[];
}

export interface FormatRules {
  [x: string]: {
    symbol: string;
    // pairType: string; // no more returned
    limits: Limits;
    precisionMode: DigitsCountingPrecisionMode;
    precision: Precision;
  };
}

export interface TradeFormatsDto {
  exchange: string;

  formatRules: FormatRules;
}
