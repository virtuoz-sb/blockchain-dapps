import { Injectable, CanActivate, ExecutionContext, BadRequestException } from "@nestjs/common";

@Injectable()
export default class WalletsGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (user.custodialWallets?.identifier) return true;

    throw new BadRequestException("No user wallets found");
  }
}
