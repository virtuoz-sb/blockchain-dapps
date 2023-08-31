/* eslint-disable max-classes-per-file */
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "../types";

export class CredentialsDTO {
  // username: string;
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}

// tslint:disable-next-line:max-classes-per-file
export class RecoverPasswordDTO {
  @IsNotEmpty()
  @ApiProperty()
  code: string;

  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  repeatNewPassword: string;
}

// tslint:disable-next-line:max-classes-per-file
export class AuthRespDTO {
  @IsNotEmpty()
  @ApiProperty()
  // tslint:disable-next-line:variable-name
  access_token: string;

  @IsNotEmpty()
  @ApiProperty()
  user: UserDto;
}

// tslint:disable-next-line:max-classes-per-file
export class TotpTokenDTO {
  @IsNotEmpty()
  @ApiProperty()
  userToken: string;
}
// tslint:disable-next-line:max-classes-per-file
export class NewPasswordDTO extends CredentialsDTO {
  @IsNotEmpty()
  @ApiProperty()
  newPassword: string;

  @IsNotEmpty()
  @ApiProperty()
  repeatNewPassword: string;
}

// tslint:disable-next-line:max-classes-per-file
export class RegisterDTO extends CredentialsDTO {
  @IsNotEmpty()
  @ApiProperty()
  firstname: string;

  @IsNotEmpty()
  captcha: string;

  @IsOptional()
  refCode?: string;
}
