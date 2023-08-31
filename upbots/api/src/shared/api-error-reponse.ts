import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";

export default class ApiErrorResponse {
  @ApiProperty()
  path: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  code: HttpStatus;
}
