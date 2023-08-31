import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import * as speakeasy from 'speakeasy';

import { UserService } from '../../user/service/user.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthService } from '../service/auth.service';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto, TotpTokenDto, ChangePwdDto } from '../dto/login.dto';
import { FacebookAuthService } from 'facebook-auth-nestjs';
import { GoogleAuthService } from '../service/google-auth.service';
import { AppleAuthService } from '../service/apple-auth.service';
import { AppleLoginDto } from '../dto/apple-login.dto';
import { Dictionary } from 'code-config';
import { Response } from 'express';
import { authConfig } from '../config/auth.config';
import { stringify } from 'qs';
import { IUserDocument } from "@torobot/shared"

@ApiTags("auth")
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private facebookService: FacebookAuthService,
    private googleService: GoogleAuthService,
    private appleService: AppleAuthService,
    // private subscriptionService: SubscriptionService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(
      await this.authService.validate(body.username, body.password),
    );
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.loginWithRefreshToken(refreshToken);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    if (await this.userService.getByName(body.username)) {
      throw new BadRequestException('Username already exists');
    }

    if (await this.userService.getByEmail(body.email)) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.userService.create(body);

    return this.authService.login(user);
  }

  @Post('apple-callback')
  appleCallback(@Body() body: Dictionary, @Res() res: Response) {
    const uri = `intent://callback?${stringify(body)}#Intent;package=${
      authConfig.apple.android.packageId
    };scheme=signinwithapple;end`;

    return res.redirect(uri);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: IUserDocument) {
    return this.userService.filterUser(user, ['email']);
  }

  @Get('totp-secret')
  @UseGuards(JwtAuthGuard)
  totpSecret(@CurrentUser() user: IUserDocument): Promise<speakeasy.GeneratedSecret> {
    return this.authService.generateSecret(user);
  }

  @Post('totp-verify')
  @UseGuards(JwtAuthGuard)
  async totpVerify(@CurrentUser() user: IUserDocument, @Body() payload: TotpTokenDto) {
    return this.authService.verifyTotpToken(user, payload)
  }

  @Post('totp-deactivate')
  @UseGuards(JwtAuthGuard)
  async totpDeactivate(@CurrentUser() user: IUserDocument, @Body() payload: TotpTokenDto) {
    return this.authService.deactivateTotpToken(user, payload)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@CurrentUser() user: IUserDocument, @Body() payload: ChangePwdDto): Promise<boolean> {
    return this.authService.changePassword(user, payload)
  }
}
