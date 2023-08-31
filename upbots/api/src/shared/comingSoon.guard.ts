import { CanActivate, Injectable, HttpException, HttpStatus } from "@nestjs/common";

@Injectable()
export default class ComingSoonGuard implements CanActivate {
  canActivate(): boolean {
    throw new HttpException("Cannot access, this feature is coming soon", HttpStatus.NOT_ACCEPTABLE);
  }
}
