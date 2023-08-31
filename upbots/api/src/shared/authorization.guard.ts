import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from "@nestjs/common";
import { Request } from "express";
import { Roles, UserIdentity } from "../types/user";

/**
 * Controls user access for identified users
 */
@Injectable()
export default class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  private allowedRoles: Roles[];

  constructor(...allowedRoles: Roles[]) {
    this.allowedRoles = allowedRoles ?? [];
  }

  // middleware has already been called -> jwt verify process already done
  canActivate(context: ExecutionContext): boolean {
    const host = context.switchToHttp();
    const request: Request = host.getRequest();
    const user = request.user as UserIdentity;
    const { url } = request;

    if (!user) {
      this.logger.warn(`Authorization check for undefined user for url ${url}; (did you place the AuthGuard first ?) `);
      return false;
    }
    const allowed = this.isAllowed(user.roles);

    if (!allowed) {
      this.logger.log(
        `Access denied (not authorized) for user ${user.id} to url ${url} user.roles ${user.roles} whereas allowed roles: ${this.allowedRoles}`
      );
      throw new ForbiddenException();
    }
    this.logger.debug(`User ${user?.id} is allowed to url ${request.url}`);

    this.logger.debug(`User ${user.id} is authorized, allowing access to url ${url}`);
    return true;
  }

  isAllowed(userRoles: Roles[]) {
    // this.logger.debug(`Comparing roles: ${this.allowedRoles} - ${userRoles}`);

    let allowed = false;

    userRoles.forEach((userRole) => {
      // this.logger.debug(`Checking if role is allowed: ${userRole}`);
      if (!allowed && this.allowedRoles.includes(userRole)) {
        allowed = true;
      }
    });

    return allowed;
  }
}
