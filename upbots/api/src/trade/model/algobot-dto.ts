/* eslint-disable max-classes-per-file */
/* eslint-disable import/prefer-default-export */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class FollowBotRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  botId: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  apiKeyRef: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  accountType: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  stratType: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  accountPercentage: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  accountLeverage: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  contractSize: number;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  baseAmount: number;

  @IsOptional()
  @ApiProperty()
  @IsString()
  quote: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  positionType: string;

  @IsOptional()
  @ApiProperty()
  @IsNumber()
  positionAmount: number;
}

export class FollowBotResponseDto {
  @ApiProperty()
  botId: string;

  @ApiProperty()
  subscriptionId: string;
}

export class CloseBotOrderRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  botId: string;

  @ApiProperty()
  @IsString()
  botSubId: string;

  @ApiProperty()
  @IsString()
  stratType: string;
}

export class RateAlgobotRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  botId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(5)
  vote: number;

  @ApiProperty()
  @IsString()
  comment?: string;
}

export class DeleteReviewRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsString()
  botId: string;
}

export class AlgobotReviewRecord {
  @ApiProperty()
  user: string;

  @ApiProperty()
  picture: {
    mimetype: string;
    data: string;
  };

  @ApiProperty()
  vote: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  reviewedAt: number; // = Date.getTime()
}
