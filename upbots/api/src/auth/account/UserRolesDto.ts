/* eslint-disable import/prefer-default-export */
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { Roles } from "../../types/user";

export class UserRolesDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  @IsEnum(Roles, { each: true })
  roles: Roles[];
}
