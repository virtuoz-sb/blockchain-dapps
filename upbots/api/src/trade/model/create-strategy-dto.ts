/* eslint-disable max-classes-per-file */
import { IsString, IsNotEmpty, IsNumber, IsEnum, ValidateNested, IsArray, IsIn, ValidateIf, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotSiblingOf, incompatibleSiblingsNotPresent } from "./exclusive-property.validator";

// @ValidateNested({ each: true })
// @IsNonPrimitiveArray()
// @Type(() => PositionDto)
// positions: PositionDto[];

// class MyClass {
//   @IsEnum(MyEnum)
// someProperty: MyEnum;
// }

//  // @IsNonPrimitiveArray()
// @Type(() => PositionDto)

export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
}

export enum OrderSideType {
  BUY = "BUY",
  SELL = "SELL",
}

// should mirror front types
export class EntryRange {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  buyRangeMin: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  buyRangeMax: number;
}

// should mirror front types
export class Entry {
  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  isLimit: boolean;

  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  isMarket: boolean;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  triggerPrice: number; // the entry condition price

  @ApiProperty()
  @IsNumber()
  price?: number; // the price for limit order (ignored when isMarket is true)

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  quantity: number;
}

// upbots front request object data. This should mirror front's SignalRequestPayload.
export class CreateManualSignalStrategyDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["bitmex_test"]) // TODO add more exchanges
  @ApiProperty({ description: "exchange name (bitmex_test) for now" })
  exchange: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "crypto exchange api key internal upbots identifier" })
  apiKeyRef: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["XBTUSD"]) // TODO: add more acceptable pairs
  @ApiProperty({
    description:
      "symbol pair indentifier for a particular exchange (BASE QUOTE concatenated), i.e., XBTUSD fo bitmex_test), BTCUSDT for binance",
  })
  symbol: string;

  @IsEnum(OrderSideType)
  @IsNotEmpty()
  @ApiProperty({ description: "BUY or SELL" })
  side: OrderSideType;

  // validate exclusive precense of entries or entryRange
  // @IsNotSiblingOf(['deleted'])
  // @ValidateIf(incompatibleSiblingsNotPresent(['deleted']))

  @IsNotSiblingOf(["entries"])
  @ValidateIf(incompatibleSiblingsNotPresent(["entries"]))
  @ValidateNested()
  entryRange: EntryRange;

  @IsNotSiblingOf(["entryRange"])
  @ValidateIf(incompatibleSiblingsNotPresent(["entryRange"]))
  @IsArray()
  @ValidateNested({ each: true })
  entries: Entry[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: "total quantity in BASE units (if multi-entry mode, this quantity must equal to the sum of entries volume" })
  quantity: number;

  @IsArray()
  @ValidateNested({ each: true })
  takeProfits: TakeProfit[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  stopLoss: number; // SL price
}

export class TakeProfit {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  triggerPrice: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  quantity: number;
}

export class StratCreatedResponseDto {
  @ApiProperty()
  id: string;
}
