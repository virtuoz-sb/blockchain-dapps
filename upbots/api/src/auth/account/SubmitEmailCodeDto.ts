/* eslint-disable import/prefer-default-export */
import { IsNotEmpty, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitEmailCodeDto {
  @ApiProperty() // swagger doc
  @IsNotEmpty()
  @MinLength(40)
  @MaxLength(64)
  code: string;
}

export interface EmailVerificationResponse {
  verify: boolean;
}
