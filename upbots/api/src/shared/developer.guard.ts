import { Injectable } from "@nestjs/common";
import { Roles } from "../types";
import AuthorizationGuard from "./authorization.guard";

@Injectable()
export default class DeveloperGuard extends AuthorizationGuard {
  constructor() {
    super(Roles.DEVELOPER);
  }
}
