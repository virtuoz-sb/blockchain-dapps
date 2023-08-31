/* eslint-disable max-classes-per-file */
import { ApiProperty } from "@nestjs/swagger";
import { DigitsCountingPrecisionMode } from "src/db_seeds/precision-mode";
import { Precision } from "../../settings/models/market-pair-settings.model";

interface SuggestedInputDto {
  quantity?: any;
  price?: any;
}

interface CheckListDto {
  costLimit?: boolean;
  quantityPrecision?: boolean;
  quantityLimit?: boolean;
  pricePrecision?: boolean;
  priceLimit?: boolean;
}

export interface ValidityCheckDto {
  exchange: string;
  market: string;
  symbol: string;
  validity: boolean;
  checkList: CheckListDto;
  suggestedInput: SuggestedInputDto;
  comments: string;
  precisionMode: DigitsCountingPrecisionMode;
  precisionRules: Precision;
}

class GetSuggestInputDto {
  @ApiProperty()
  quantity: number;

  @ApiProperty()
  price: number;
}

class GetCheckListDto {
  @ApiProperty()
  costLimit: boolean;

  @ApiProperty()
  quantityPrecision: boolean;

  @ApiProperty()
  quantityLimit: boolean;

  @ApiProperty()
  pricePrecision: boolean;

  @ApiProperty()
  priceLimit: boolean;
}

export class GetValidityCheckDto {
  @ApiProperty()
  exchange: string;

  @ApiProperty()
  market: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  validity: boolean;

  @ApiProperty({ type: GetCheckListDto })
  checkList: GetCheckListDto;

  @ApiProperty({ type: GetSuggestInputDto })
  suggestedInput: GetSuggestInputDto;

  @ApiProperty()
  comments: string;
}
