import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, VerifiedCallback, StrategyOptions } from "passport-jwt";
import AuthService from "./auth.service";
import { JwtPayload } from "../types/payload";

@Injectable()
export default class TotpStrategy extends PassportStrategy(Strategy, "jwttotpreq") {
  private readonly logger = new Logger(TotpStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies.jwt]), // if you have the jwt in cookie
      secretOrKey: process.env.JWT_SECRET,
    } as StrategyOptions);
  }

  // Authorize access for a jwt payload
  async validate(payload: JwtPayload, done: VerifiedCallback) {
    this.logger.debug(`strategy validate payload ${JSON.stringify(payload)}`);
    if (!payload) {
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }
    const user = await this.authService.validateUser(payload.email);
    if (!user) {
      this.logger.debug(`strategy validate found not user for payload ${JSON.stringify(payload)}`);
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }
    if (!payload.totpRequired) {
      this.logger.debug(`strategy validate  totpRequired not found for payload ${JSON.stringify(payload)}`);
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }

    return done(null, user, payload.iat);
  }
}
