import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, VerifiedCallback, StrategyOptions } from "passport-jwt";
import AuthService from "./auth.service";
import { JwtPayload } from "../types/payload";

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies.jwt]), // if you have the jwt in cookie
      secretOrKey: process.env.JWT_SECRET,
    } as StrategyOptions);
  }

  // Authorize access for a jwt payload
  async validate(payload: JwtPayload, done: VerifiedCallback) {
    // this.logger.debug(`validating jwt payload ${JSON.stringify(payload)} ..`);
    if (!payload) {
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }
    const user = await this.authService.validateUser(payload.email);
    if (!user) {
      this.logger.warn(`strategy validate found not user for payload ${JSON.stringify(payload)}`);
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }

    if (payload.totpRequired) {
      this.logger.debug(`totpRequired detected ( user needs to submit his 2FA challenge first) for payload ${JSON.stringify(payload)}`);
      return done(new HttpException("Unauthorized access", HttpStatus.UNAUTHORIZED), false);
    }

    // this.logger.debug(` user ${JSON.stringify(user)} valid jwt payload ${JSON.stringify(payload)}`);
    return done(null, user, payload.iat);
  }
}
