import { CanActivate, Injectable } from "@nestjs/common";

@Injectable()
export default class SellerGuard implements CanActivate {
  // constructor() {}

  canActivate() {
    // const request = context.switchToHttp().getRequest();
    // const { user } = request;

    /*   if (true || user.active) {
      return true;
    } */
    return true;
    /*  throw new HttpException(
      "Unauthorized access for non seller",
      HttpStatus.UNAUTHORIZED
    ); */
  }
}
