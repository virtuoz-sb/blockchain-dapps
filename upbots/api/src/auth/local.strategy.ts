// eslint-disable-next-line import/no-extraneous-dependencies
import { Strategy, IStrategyOptionsWithRequest } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException, Logger, BadRequestException } from "@nestjs/common";
import { validate as classValidator } from "class-validator";
import { UserIdentity } from "../types/user";
import AuthService from "./auth.service";
import { CredentialsDTO } from "./auth.dto";

@Injectable()
export default class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: "email",
      passwordField: "password",
    } as IStrategyOptionsWithRequest);

    this.logger.debug(`LocalStrategy ctor`);
  }

  async validate(username: string, password: string): Promise<UserIdentity> {
    this.logger.debug(`LocalStrategy validate..`);

    const userCred = new CredentialsDTO();
    userCred.email = username;
    userCred.password = password;

    const valid = await classValidator(userCred);
    if (valid.length > 0) {
      this.logger.debug(`LocalStrategy incorrect user credentials`);
      throw new BadRequestException();
    }
    const user = await this.authService.validateUserByCredentials({
      email: username,
      password,
    });
    if (!user) {
      this.logger.debug(`LocalStrategy invalid user credentials`);
      throw new UnauthorizedException();
    }
    this.logger.debug(`LocalStrategy valid user credentials for ${username}`);

    return user;
  }
}
