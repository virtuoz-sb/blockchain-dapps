/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-param-reassign */

import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { AuthProvider } from "../../types";
import AuthService from "../auth.service";
import imageUrlToBase64 from "../../utilities/image-url-to-base64";

@Injectable()
export default class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private authService: AuthService) {
    super({
      clientID: process.env.OAUTH2_GOOGLE_CLIENT_ID,
      clientSecret: process.env.OAUTH2_GOOGLE_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/google/callback`,
      scope: ["email", "profile"],
      passReqToCallback: true,
    });
  }

  authenticate(req, options) {
    const {
      query: { target, ref },
    } = req;
    options.state = `${target},${ref}`;
    super.authenticate(req, options);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const {
      query: { state },
    } = req;
    const target = state.split(",")[0];
    const refCode = state.split(",")[1] || "";
    const { email, given_name, family_name, picture } = profile._json;
    if (!email) {
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }
    const user = await this.authService.validateUser(email);
    if (user) {
      return done(null, { newAccount: false, state, ...user });
    }
    const base64Picture = await imageUrlToBase64(picture);
    return done(null, {
      newAccount: true,
      target,
      refCode,
      email,
      authProvider: AuthProvider.GOOGLE,
      firstname: given_name,
      lastname: family_name,
      picture: base64Picture,
    });
  }
}
