import { EUserRole, EUserStatus } from '@torobot/shared';
import { IsOptional, IsString, IsEnum } from "class-validator";
export class UpdateDto {
  @IsOptional()
  @IsString()
  username!: string;

  @IsOptional()
  role!: EUserRole;

  @IsOptional()
  status!: EUserStatus;
}
