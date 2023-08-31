import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { RateLimiterModule } from "nestjs-rate-limiter";
import MarketingAutomationModule from "../marketing-automation/marketing-automation.module";
import PerfeesReferralsModule from "../perfees/perfees-referrals.module";
import LoginTrackingModule from "../login-tracking/login-tracking.module";
import SharedModule from "../shared/shared.module";
import AuthController from "./auth.controller";
import AuthService from "./auth.service";
import JwtStrategy from "./jwt.strategy";
import TotpStrategy from "./jwttotpreq.strategy";
import LocalStrategy from "./local.strategy";
import AccountController from "./account.controller";
import JwtNoTotpCheckStrategy from "./jwtnototpcheck.strategy";
import GoogleStrategy from "./social-auth/google.strategy";
import FacebookStrategy from "./social-auth/facebook.strategy";

@Module({
  imports: [
    SharedModule,
    RateLimiterModule,
    LoginTrackingModule,
    PerfeesReferralsModule,
    MarketingAutomationModule,
    ConfigModule.forRoot({
      // required here even if we have global in app.module otherwise
      //  secret: process.env.JWT_SECRET will get undefined
      envFilePath: [".env", ".env.dev"],
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "3h" },
    }),
  ],
  controllers: [AuthController, AccountController],
  providers: [AuthService, JwtStrategy, TotpStrategy, JwtNoTotpCheckStrategy, LocalStrategy, FacebookStrategy, GoogleStrategy],
  exports: [JwtModule, AuthService],
})
export default class AuthModule {}
