/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsIn, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateIf } from "class-validator";
import { OrderSideType, OrderType } from "./create-strategy-dto";

export class CreateDirectOrderDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["binance", "ftx", "kucoin", "huobi"]) // TODO: replace this check by getExchangesSettings()
  @ApiProperty({ description: "exchange name  for now" })
  exchange: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "crypto exchange api key internal upbots identifier" })
  apiKeyRef: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      "symbol pair indentifier for a particular exchange (BASE QUOTE concatenated), i.e., XBTUSD fo bitmex_test), BTCUSDT for binance",
  })
  symbol: string;

  @IsEnum(OrderSideType)
  @IsNotEmpty()
  @ApiProperty({ description: "BUY or SELL" })
  side: OrderSideType;

  @IsEnum(OrderType)
  @IsNotEmpty()
  @ApiProperty({ description: "MARKET or LIMIT" })
  type: OrderType;

  @ValidateIf((o) => o.type !== "MARKET") // allow price to be null when market order
  @IsPositive()
  @IsNumber()
  @ApiProperty()
  price: number;

  @IsPositive()
  @IsNumber()
  @ApiProperty()
  quantity: number;
}

export class OrderCreatedResponseDto {
  @ApiProperty()
  orderTrackId: string;
}
