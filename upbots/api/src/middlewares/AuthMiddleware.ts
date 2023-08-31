import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { ExtractJwt } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export default class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: () => void) {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    this.jwtService.verify<JwtPayload>(jwt);
    next();
  }
}
