/* eslint-disable import/prefer-default-export */
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UbxtStakingDto {
  @ApiProperty() // swagger doc
  @IsNotEmpty()
  @IsNumber()
  ubxtStakingAmount: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  walletAddress?: string;
}
