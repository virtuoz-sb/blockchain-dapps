import { ApiProperty } from "@nestjs/swagger";

export type ErrorType = "subscription" | "order-tracking";

export default class ErrorAlgobotDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  errorType: ErrorType;

  // @ApiProperty()
  // error?: string;

  @ApiProperty()
  errorAt?: Date;

  @ApiProperty()
  errorReason?: string;
}
