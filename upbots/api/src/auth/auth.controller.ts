/* eslint prefer-const: ["error", {"destructuring": "all"}] */
/* eslint-disable no-underscore-dangle */

import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
  Res,
  HttpStatus,
  Logger,
  Req,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiResponse } from "@nestjs/swagger";
import * as speakeasy from "speakeasy";
import { Response } from "express";
import * as bcrypt from "bcryptjs";
import MarketingAutomationService from "../marketing-automation/marketing-automation.service";
import LoginTrackingService from "../login-tracking/login-tracking.service";
import IpAddress from "../utilities/ip-address.decorator";

import { CredentialsDTO, RegisterDTO, TotpTokenDTO, AuthRespDTO, RecoverPasswordDTO } from "./auth.dto";
import { createUserIpAddressInfo } from "./auth.helper";
import { FacebookAuthGuard, GoogleAuthGuard } from "./social-auth/social-auth.guard";

import RecaptchaService from "../shared/recaptcha.service";
import AuthService from "./auth.service";
import ReferralService from "../perfees/services/referral.service";

@ApiTags("auth")
@Controller("auth")
export default class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private captchaService: RecaptchaService,
    private loginTrackingService: LoginTrackingService,
    private referralService: ReferralService,
    private automationService: MarketingAutomationService
  ) {}

  // @UsePipes(new ValidationPipe()) // @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(AuthGuard("local")) // see local.strategy.ts
  // @UseGuards(RateLimiterGuard)
  // @RateLimit({ keyPrefix: "login", points: 3, duration: 60 * 5, errorMessage: "Request has been blocked" })
  @Post("login")
  @HttpCode(200)
  @ApiResponse({ status: 200, description: "User authenticated. Returns JWT." })
  @ApiResponse({ status: 401, description: "Bad email/password." })
  async login(@Request() req, @Res() res: Response, @IpAddress() ipAddress): Promise<void> {
    // This route will only be invoked if the user has been validated (see AuthGuard)
    // the req parameter will contain a user property
    const userInfo = createUserIpAddressInfo(req, ipAddress);

    // check ip address
    const prevLogin = true; // await this.loginTrackingService.getPreviousLoginTrack(req.user._id, userInfo);
    if (userInfo.ip !== "127.0.0.1" && userInfo.ip !== "::1" && !prevLogin) {
      // it's a new ip location!
      // insert a record with pending status and send a mail with "request auth code"
      const confirmCode = Buffer.from(await bcrypt.hash(`${req.user.id}${new Date().getTime()}`, 10))
        .toString("base64")
        .substring(20);
      await this.loginTrackingService.updateUserLoginTimeStamp(req.user, userInfo, true, confirmCode);

      const sentEmail = await this.authService.sendMailWithAuthConfirmCode(req.user, confirmCode);

      res.status(HttpStatus.CONFLICT).send({
        code: "NEW_IP_ADDRESS",
        message: `You tried to login from new location${
          userInfo.address.length > 0 ? ` (${userInfo.address})` : ""
        }. Please check the auth code in email to continue.`,
      });
    } else {
      const token: AuthRespDTO = await this.authService.createAuthenticationResponse(req.user, false);

      // Track User Login TimeStamp
      // this.logger.debug(`---auth-login@user-ip: ${ipAddress}, ${JSON.stringify(ipAddress)}`);
      await this.loginTrackingService.updateUserLoginTimeStamp(req.user, userInfo);

      if (token.user.totpRequired) {
        res.status(HttpStatus.ACCEPTED).send(token);
      } else {
        res.status(HttpStatus.OK).send(token);
      }
    }
  }

  @UseGuards(AuthGuard("local")) // see local.strategy.ts
  @Post("confirm-new-ip")
  @HttpCode(200)
  @ApiResponse({ status: 200, description: "User authenticated. Returns JWT." })
  async confirmNewIp(@Request() req, @Res() res: Response, @IpAddress() ipAddress, @Body() data: any): Promise<void> {
    // This route will only be invoked if the user has been validated (see AuthGuard)
    // the req parameter will contain a user property
    const userInfo = createUserIpAddressInfo(req, ipAddress);

    // check ip address
    const pendingLogin = await this.loginTrackingService.getPendingLoginTrack(req.user._id, data.code);
    if (
      userInfo.ip !== "127.0.0.1" &&
      userInfo.ip !== "::1" &&
      (!pendingLogin ||
        (pendingLogin.address === "" && pendingLogin.ip !== userInfo.ip) ||
        (pendingLogin.address.length > 0 && pendingLogin.address !== userInfo.address))
    ) {
      // it's a new ip address!
      res.status(HttpStatus.BAD_REQUEST).send({
        message: "Authorization failed! (Invalid code, diffrent address from previous one, or expired.)",
      });
    } else {
      const token: AuthRespDTO = await this.authService.createAuthenticationResponse(req.user, false);

      // Track User Login TimeStamp
      // this.logger.debug(`---auth-login@user-ip: ${ipAddress}, ${JSON.stringify(ipAddress)}`);
      await this.loginTrackingService.updateUserLoginTimeStamp(req.user, userInfo);

      if (token.user.totpRequired) {
        res.status(HttpStatus.ACCEPTED).send(token);
      } else {
        res.status(HttpStatus.OK).send(token);
      }
    }
  }

  /**
   * cannot deactivate if token is invalid or if user has not already succesfully verified totp activation
   * @param user user from jwt
   * @param payload totp token and flag to check if it is temporary
   */
  @Post("totp-deactivate")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({
    status: 403,
    description: "token cannot be verified",
  })
  @ApiResponse({
    status: 304,
    description: "totp has not been disabled",
  })
  async totpDeActivate(@Request() req, @Body() payload: { userToken: string }, @IpAddress() ipAddress): Promise<AuthRespDTO> {
    // this.logger.debug( `totpDeActivate for  req.user${JSON.stringify(req.user)}`);
    const userInfo = createUserIpAddressInfo(req, ipAddress);
    this.logger.log(`email deactivate 2fa userInfo ip: ${userInfo.ip} address ${userInfo.address}, device: ${userInfo.device}`);

    return this.authService.deactivateTotp(req.user, payload, userInfo);
  }

  /*
    2FA set up (pre-activation). Once pre-activated
    return the totp secret first it will be stored as temporary until a successfull totp-verify
    if totp secret has been already verified you can't call this endpoint again you have to disable totp first
    if the secret is still temporary you can call this endpoint again it will set a new secret
  */
  @UseGuards(AuthGuard("jwt")) // see local.strategy.ts
  @Get("totp-secret")
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "totp secret generated Returns otpauth_url.",
  })
  @ApiResponse({
    status: 403,
    description: "secret has already been generated you must deactivate 2fa first",
  })
  @ApiResponse({ status: 401, description: "Bad authentication" })
  async totpSecret(@Request() req): Promise<speakeasy.GeneratedSecret> {
    // a TOTP secret will be returned and stored in the user profile (temp until totpVerify is called)
    return this.authService.generateSecret(req.user);
  }

  @UseGuards(AuthGuard("jwtnototpcheck")) // see jwtnototpcheck.strategy.ts :authentication strategy where 2FA check is by-passed
  @Post("totp-verify")
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: "confirms 2FA setup and/or performs 2FA login. totp token validate against secret.. Returns JWT.",
  })
  @ApiResponse({ status: 401, description: "Bad jwt" })
  @ApiResponse({
    status: 403,
    description: "user token incorrect",
  })
  async totpVerify(@Request() req, @Body() payload: TotpTokenDTO): Promise<AuthRespDTO> {
    // if valid, sets the 2FA set up as definitive (non temporary)
    return this.authService.verifyTotpToken(req.user, payload); // internally calls createAuthenticationResponse
  }

  // @UseGuards(RateLimiterGuard)
  // @RateLimit({ keyPrefix: "register", points: 1, duration: 60, errorMessage: "Accounts cannot be created more than once in per minute" })
  @Post("register")
  @ApiResponse({ status: 201, description: "User created and JWT returned." })
  @ApiResponse({ status: 400, description: "Validation error" })
  async register(@Body() cred: RegisterDTO) {
    // check captcha
    const score = await this.captchaService.decodeCaptcha(cred);
    if (!score.data.success) {
      throw new BadRequestException("recaptcha failed");
    } else {
      const user = await this.authService.registerNewUser(cred);
      // Add user to automation list
      this.automationService.subscribeToAutomationList(user._id, user.email, user.firstname);

      if (cred.refCode) {
        await this.referralService.reqUserReferral(user._id, cred.refCode);
      }
      return this.authService.createAuthenticationResponse(user, false);
    }
  }

  @Post("send-2fa-enabled-email-notif")
  @UseGuards(AuthGuard("jwt"))
  async send2faEnableNotificatoinEmail(@Request() req, @IpAddress() ipAddress) {
    const userInfo = createUserIpAddressInfo(req, ipAddress);
    this.logger.log(`email 2fa enabled notification userInfo ip: ${userInfo.ip} address ${userInfo.address}, device: ${userInfo.device}`);

    return this.authService.send2faNotificationEmail(req.user, userInfo, true);
  }

  @Post("send-verify-email-link")
  @UseGuards(AuthGuard("jwt"))
  async sendVerifyEmailLink(@Body() payload: { email: string }) {
    return this.authService.sendVerifyEmailLink(payload.email);
  }

  @Post("send-recover-link")
  async sendRecoverLink(@Body() payload: { email: string }) {
    return this.authService.sendRecoverLink(payload.email);
  }

  @Post("recover-password")
  async recoverPassword(@Body() payload: RecoverPasswordDTO) {
    return this.authService.recoverPassword(payload);
  }

  @Post("resendEmail")
  @UseGuards(AuthGuard("jwt"))
  async resendEmail(@Body() payload: CredentialsDTO, @Request() req) {
    return this.authService.resendEmailVerification(payload.email, req.user.email, payload.password);
  }

  /** GOOGLE AUTH */

  @Get("/google")
  @UseGuards(new GoogleAuthGuard("google"))
  async googleRegisterAuth(@Req() req) {
    // Add user to automation list
    await this.automationService.subscribeToAutomationList(req.user.id, req.user.email, req.firstname);
    // Initiate automation flow
    this.automationService.handleUserVerifyEmail(req.user.email);
  }

  @Get("/google/callback")
  @UseGuards(new GoogleAuthGuard("google"))
  async googleAuthRedirect(@Req() req, @Res() res: Response, @IpAddress() ipAddress) {
    // Track User Login TimeStamp
    if (req.user) {
      const userInfo = createUserIpAddressInfo(req, ipAddress);
      this.loginTrackingService.updateUserLoginTimeStamp(req.user, userInfo);
    }
    const oauthLink = await this.authService.getOauthRedirectLink(req);

    return res.redirect(oauthLink);
  }

  /** FACEBOOK AUTH */

  @Get("/facebook")
  @UseGuards(new FacebookAuthGuard("facebook"))
  async facebookRegisterAuth(@Req() req) {
    // Add user to automation list
    await this.automationService.subscribeToAutomationList(req.user.id, req.user.email, req.firstname);
    // Initiate automation flow
    this.automationService.handleUserVerifyEmail(req.user.email);
  }

  @Get("/facebook/callback")
  @UseGuards(new FacebookAuthGuard("facebook"))
  async facebookAuthRedirect(@Req() req, @Res() res: Response, @IpAddress() ipAddress) {
    // Track User Login TimeStamp
    if (req.user) {
      const userInfo = createUserIpAddressInfo(req, ipAddress);
      this.loginTrackingService.updateUserLoginTimeStamp(req.user, userInfo);
    }

    const oauthLink = await this.authService.getOauthRedirectLink(req);
    return res.redirect(oauthLink);
  }

  /**
   * request to reset the 2fa code
   */
  @Post("request-reset-2fa")
  async requestReset2fa(@Req() req, @Body() payload: { email: string }, @IpAddress() ipAddress) {
    const userInfo = createUserIpAddressInfo(req, ipAddress);
    this.logger.log(`email reset 2fa userInfo ip: ${userInfo.ip} address ${userInfo.address}, device: ${userInfo.device}`);

    return this.authService.requestReset2fa(payload.email, userInfo);
  }

  /**
   * reset the 2fa code
   */
  @Post("reset-2fa")
  async reset2fa(@Body() payload: { email: string; recoverCode: string }) {
    return this.authService.reset2fa(payload.email, payload.recoverCode);
  }
}
