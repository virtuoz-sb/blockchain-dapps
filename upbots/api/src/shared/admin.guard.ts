import { Injectable } from "@nestjs/common";
import { Roles } from "../types";
import AuthorizationGuard from "./authorization.guard";

@Injectable()
export default class AdminGuard extends AuthorizationGuard {
  constructor() {
    super(Roles.ADMIN);
  }
}
