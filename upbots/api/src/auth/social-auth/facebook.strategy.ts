/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable no-param-reassign */

import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from "passport-facebook";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { AuthProvider } from "../../types";
import AuthService from "../auth.service";
import imageUrlToBase64 from "../../utilities/image-url-to-base64";

@Injectable()
export default class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  private readonly logger = new Logger(FacebookStrategy.name);

  constructor(private authService: AuthService) {
    super({
      clientID: process.env.OAUTH2_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.OAUTH2_FACEBOOK_SECRET,
      callbackURL: `${process.env.API_URL}/api/auth/facebook/callback`,
      scope: "email",
      profileFields: ["email", "name", "picture"],
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

  async validate(req: any, accessToken: string, refreshToken: string, profile: Profile, done: any): Promise<any> {
    const {
      query: { state },
    } = req;
    const target = state.split(",")[0];
    const refCode = state.split(",")[1] || "";

    const { email, last_name, first_name, picture } = profile._json;
    this.logger.log(`FACEBOOK OAUTH: ${JSON.stringify(profile)}`);

    if (!email) {
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }
    const user = await this.authService.validateUser(email);
    if (user) {
      return done(null, { newAccount: false, state, ...user });
    }
    const base64Picture = await imageUrlToBase64(picture?.data?.url);
    return done(null, {
      newAccount: true,
      target,
      refCode,
      email,
      authProvider: AuthProvider.FACEBOOK,
      firstname: first_name,
      lastname: last_name,
      picture: base64Picture,
    });
  }
}
