import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import * as bcrypt from "bcrypt";

import { environments } from '../../../environments/environments';
import { UserService } from '../../user/service/user.service';
import { Token } from '../guard/jwt-auth.guard';
import { mongoDB, IUserDocument } from "@torobot/shared";
import { TotpTokenDto, ChangePwdDto } from '../dto/login.dto';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: Partial<IUserDocument>
}

export interface SocialUser {
  id: number | string;
  name: string;
  email: string;
}

export type GetSocialUserHandler = () => Promise<Partial<SocialUser>>;

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validate(username: string, password: string) {
    const user = await this.userService.getUser(username);
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    // if (!(await user.validatePassword(password))) {
      if (!(await mongoDB.Users.validatePassword(user, password))) {
      throw new UnauthorizedException('Incorrect password');
    }

    return user;
  }

  async login(user: IUserDocument): Promise<TokenResponse> {
    const payload: Token = {
      sub: user.id,
      username: user.username,
    };

    let refresh_token: string;

    if (environments.accessTokenExpiration) {
      refresh_token = await this.jwtService.signAsync(
        payload,
        this.getRefreshTokenOptions(user),
      );
    }

    return {
      access_token: await this.jwtService.signAsync(
        payload,
        this.getAccessTokenOptions(user),
      ),
      refresh_token,
      user: this.userService.filterUser(user, ['email']),
    };
  }

  async loginWithThirdParty(
    fieldId: keyof IUserDocument,
    getSocialUser: GetSocialUserHandler,
    customName?: string,
  ) {
    try {
      const { name, email, id } = await getSocialUser();

      const internalUser = await this.userService.getUserBy({ [fieldId]: id });

      if (internalUser) {
        if (
          internalUser.email != email &&
          !(await this.userService.getByEmail(email))
        ) {
          internalUser.email = email;

          await internalUser.save();
        }

        return this.login(internalUser);
      }

      if (await this.userService.getByEmail(email)) {
        throw new BadRequestException('Email already exists');
      }

      const username = await this.userService.generateUsername(
        customName || name,
      );

      const user = await this.userService.create({
        username,
        email,
        [fieldId]: id,
      });

      return this.login(user);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }

      throw new UnauthorizedException('Invalid access token');
    }
  }

  async loginWithRefreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.decode(refreshToken) as Token;

      if (!decoded) {
        throw new Error();
      }

      const user = await this.userService.validate(decoded.sub);

      await this.jwtService.verifyAsync<Token>(
        refreshToken,
        this.getRefreshTokenOptions(user),
      );

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  getRefreshTokenOptions(user: IUserDocument): JwtSignOptions {
    return this.getTokenOptions('refresh', user);
  }

  getAccessTokenOptions(user: IUserDocument): JwtSignOptions {
    return this.getTokenOptions('access', user);
  }

  async generateSecret(user: IUserDocument): Promise<speakeasy.GeneratedSecret> {
    const u = await this.userService.getUser(user.email);
    const isTotpActivatedAndVerified = (u.totpRequired && u.twoFactorSecret && u.twoFactorSecret.length > 42) ? true : false;
    if (!isTotpActivatedAndVerified) {
      const secret = speakeasy.generateSecret();
      await this.userService.setTotpSecret(secret.base32, u.email, true);
      return secret;
    }

    throw new HttpException("secret has been already issued and verified", HttpStatus.UNAUTHORIZED);
  }

  async verifyTotpToken(user: IUserDocument, payload: TotpTokenDto) {
    const u = await this.userService.getUser(user.email);
    const base32secret = u ? u.twoFactorSecret ? u.twoFactorSecret : u.twoFactorTmpSecret : null;
    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: "base32",
      token: payload.userToken
    });
    if (verified) {
      if (!u.totpRequired) {
        await this.userService.setTotpSecret(base32secret, u.email, false);
      }

      const modUser = user;
      modUser.totpRequired = true;
      return {
        user: this.userService.filterUser(modUser, ['email']),
      }
    }
    throw new HttpException("token not valid", HttpStatus.FORBIDDEN);
  }

  async deactivateTotpToken(user: IUserDocument, payload: TotpTokenDto) {
    const u = await this.userService.getUser(user.email);
    const isTotpVerified = (u.totpRequired && u.twoFactorSecret && u.twoFactorSecret.length > 42) ? true : false;
    if (isTotpVerified) {
      const base32secret = u ? u.twoFactorSecret ? u.twoFactorSecret : u.twoFactorTmpSecret : null;
      if (base32secret) {
        const verified = speakeasy.totp.verify({
          secret: base32secret,
          encoding: "base32",
          token: payload.userToken
        });
        if (!verified) {
          throw new HttpException("token not valid", HttpStatus.FORBIDDEN);
        } else {
          const disabled = await this.userService.disableTotp(u.email);
          if (disabled) {
            const modUser = u;
            modUser.totpRequired = false;
            return {
              user: this.userService.filterUser(modUser, ['email']),
            }
          }
          return {
            user: this.userService.filterUser(u, ['email']),
          }
        }
      } else {
        throw new HttpException("totp not activated for this user", HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException("totp not activated for this user", HttpStatus.FORBIDDEN);
    }
  }

  async changePassword(user: IUserDocument, payload: ChangePwdDto): Promise<boolean> {
    const u = await this.userService.getByEmail(payload.email);
    if (!u) {
      return false;
    }
    if (!(await bcrypt.compare(payload.currentPwd, u.password))) {
      throw new HttpException("New password verification is not the same", HttpStatus.BAD_REQUEST);
    }
    u.password = payload.newPwd;
    await u.save();
    return true;
  }

  private getTokenOptions(type: 'refresh' | 'access', user: IUserDocument) {
    const options: JwtSignOptions = {
      secret: environments[type + 'TokenSecret'] + user.sessionToken,
    };

    const expiration = environments[type + 'TokenExpiration'];

    if (expiration) {
      options.expiresIn = expiration;
    }

    return options;
  }
}
