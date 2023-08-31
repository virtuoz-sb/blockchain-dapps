/* eslint prefer-const: ["error", {"destructuring": "all"}] */
import { Injectable, HttpStatus, HttpException, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as speakeasy from "speakeasy";
import { v4 as uuidv4 } from "uuid";
import UserService from "../shared/user.service";
import { CredentialsDTO, RegisterDTO, TotpTokenDTO, AuthRespDTO, RecoverPasswordDTO } from "./auth.dto";
import { User, UserDto, UserIdentity } from "../types/user";
import { JwtPayload } from "../types";
import MailService from "../shared/mail.service";
import ReferralService from "../perfees/services/referral.service";

@Injectable()
export default class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
    private referralService: ReferralService,
    private mailService: MailService
  ) {}

  // async createJwt(payload: JwtPayload) {
  //   return sign({ email: payload.email }, process.env.JWT_SECRET, {
  //     expiresIn: '1h',
  //   });
  // }
  async generateSecret(user: UserDto): Promise<speakeasy.GeneratedSecret> {
    const isTotpActivatedAndVerified = await this.userService.isTotpActivatedAndVerified(user.email);
    // we should not generate a new secret if it is already set as final
    if (!isTotpActivatedAndVerified) {
      const secret = speakeasy.generateSecret();
      this.logger.debug(`generateSecret: set up temporary 2FA secret for ${JSON.stringify(user)}`);

      // Returns an object with secret.ascii, secret.hex, and secret.base32.
      // Also returns secret.otpauth_url, which we'll use later.
      // Example for storing the secret key somewhere (varies by implementation):
      await this.userService.setTotpSecret(secret.base32, user.email, true);
      return secret;
    }
    this.logger.debug(`generateSecret returns UNAUTHORIZED as isTotpActivatedAndVerified=true for user ${JSON.stringify(user)}`);
    throw new HttpException("secret has been already issued and verified", HttpStatus.UNAUTHORIZED);
  }
  /* async activateTotp(user: UserIdentity): Promise<AuthRespDTO> {
    const activated = await this.userService.enableTotp(user.email);
    if (activated) {
      user.totpRequired = true;
      return this.createAuthenticationResponse(user, false);
    } else {
      return null;
    }
  } */

  async send2faNotificationEmail(user: UserIdentity, userInfo: any, activate2fa: boolean) {
    await this.mailService.send2faDeactivatedNotif(user.email, user.firstname, userInfo, activate2fa);
  }

  async deactivateTotp(user: UserIdentity, payload: TotpTokenDTO, userInfo: any): Promise<AuthRespDTO> {
    const isTotpVerified = await this.userService.isTotpActivatedAndVerified(user.email);
    if (isTotpVerified) {
      const base32secret = await this.userService.getTotpSecret(user.email);
      // check if totp secret (not temporary) is present for this user
      if (base32secret) {
        // check token then deactivate then issue new token without required
        const verified = speakeasy.totp.verify({
          secret: base32secret,
          encoding: "base32",
          token: payload.userToken,
        });
        if (!verified) {
          throw new HttpException("token not valid", HttpStatus.FORBIDDEN);
        } else {
          const disabled = await this.userService.disableTotp(user.email);
          if (disabled) {
            const modUser = user;
            modUser.totpRequired = false;
            await this.send2faNotificationEmail(user, userInfo, false);
            return this.createAuthenticationResponse(modUser, true);
          }
          return this.createAuthenticationResponse(user, false);
        }
      } else {
        throw new HttpException("totp not activated for this user", HttpStatus.FORBIDDEN);
      }
    } else {
      throw new HttpException("totp not activated for this user", HttpStatus.FORBIDDEN);
    }
  }

  /**
   * verify totop token against secret. Secret can be temporary. If token is valid and user.
   * totprequired is not set it means that it is the first time it is verified
   * then secret is set as final and user is atgged as totprequired
   * @param user user info
   * @param payload totp token
   */
  async verifyTotpToken(user: UserIdentity, payload: TotpTokenDTO): Promise<AuthRespDTO> {
    const base32secret = await this.userService.getTotpSecret(user.email);
    // Use verify() to check the token against the secret
    const verified = speakeasy.totp.verify({
      secret: base32secret,
      encoding: "base32",
      token: payload.userToken,
    });
    if (verified) {
      // if token is verifed and totpserver secret is temporary we can promote the secret to non temporary
      if (!user.totpRequired) {
        await this.userService.setTotpSecret(base32secret, user.email, false);
        // here we expect the totpRequired to be true also on DB
      }
      const modUser = user;
      modUser.totpRequired = true;

      return this.createAuthenticationResponse(modUser, true);
    }
    throw new HttpException("token not valid", HttpStatus.FORBIDDEN);
  }

  async validateUser(email: string): Promise<UserIdentity> {
    return this.userService.findUser(email);
  }

  async validateUserByCredentials(credentials: CredentialsDTO): Promise<UserIdentity> {
    const email = await this.userService.validateCredentials(credentials);
    if (email) {
      return this.validateUser(email);
    }
    return null;
  }

  /**
   * Create an authentication response including the access jwt token and user info
   * @param user the user info
   * @param bypass2FA Allow to bypass the totprequired in the payload even if the user has activated totp.
   * Used for deactivation and first time activation
   */
  createAuthenticationResponse(user: UserDto, bypass2FA: boolean): AuthRespDTO {
    const payload: JwtPayload = { email: user.email, roles: user.roles };
    if (user.totpRequired) {
      // if user has activated totp we add the info to the payload except if it was verified
      if (!bypass2FA) {
        payload.totpRequired = true;
      }
    }
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async registerNewUser(cred: RegisterDTO): Promise<UserDto> {
    return this.userService.create(cred);
  }

  async sendVerifyEmailLink(email: string): Promise<boolean> {
    return this.userService.sendVerifyEmailLink(email);
  }

  async sendRecoverLink(email: string): Promise<boolean> {
    return this.userService.sendRecoverLink(email);
  }

  async recoverPassword(payload: RecoverPasswordDTO): Promise<boolean> {
    if (payload.newPassword !== payload.repeatNewPassword) {
      throw new HttpException("password not valid", HttpStatus.BAD_REQUEST);
    } else {
      return this.userService.recoverPassword(payload.code, payload.newPassword);
    }
  }

  async resendEmailVerification(email: string, emailUsedToRegister: string, password: string): Promise<UserDto> {
    return this.userService.resendEmail(email, emailUsedToRegister, password);
  }

  async getOauthRedirectLink(req: any): Promise<string> {
    let clientCallback = process.env.OAUTH2_CLIENT_CALLBACK;

    switch (req.user?.target) {
      case "beta":
        clientCallback = process.env.OAUTH2_BETA_CLIENT_CALLBACK;
        break;
      case "next":
        clientCallback = process.env.OAUTH2_NEXT_CLIENT_CALLBACK;
        break;
      default:
        clientCallback = process.env.OAUTH2_CLIENT_CALLBACK;
    }

    if (req.user) {
      // check new account
      let { newAccount, ...user } = req.user;
      if (newAccount) {
        user = await this.registerNewUser(user);

        if (req.user.refCode) {
          // await this.referralService.handleUserReferralInvite(user.id, {
          //   invitorCode: req.user.refCode,
          // });
          await this.referralService.reqUserReferral(user.id, req.user.refCode);
        }
      }
      const token: AuthRespDTO = this.createAuthenticationResponse(user, false);
      return `${clientCallback}/oauth?token=${token.access_token}&totpRequired=${token?.user?.totpRequired || false}`;
    }
    return `${clientCallback}/oauth?token=${false}`;
  }

  async requestReset2fa(userEmail: string, userInfo: any) {
    const isTotpVerified = await this.userService.isTotpActivatedAndVerified(userEmail);
    if (isTotpVerified) {
      const autoGeneratedCode = uuidv4();
      // send reset code via email
      const isSent = await this.userService.reset2faEmail(userEmail, autoGeneratedCode, userInfo);
      return isSent;
    }
    throw new HttpException("totp not activated for this user", HttpStatus.FORBIDDEN);
  }

  async reset2fa(userEmail: string, code: string) {
    const verifyResetCode = await this.userService.verifyReset2faCode(userEmail, code);
    if (verifyResetCode) {
      const disabled = await this.userService.disableTotp(userEmail);
      this.userService.clearReset2faCode(userEmail);
      return disabled;
    }
    return false;
  }

  async sendMailWithAuthConfirmCode(user: User, code: string): Promise<string> {
    const res = await this.mailService.sendNewIpDetectedEmail(user, code);
    return res;
  }
}
