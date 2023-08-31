import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import SharedModule from "../shared/shared.module";
import LoginTrackingController from "./login-tracking.controller";
import LoginTrackingService from "./login-tracking.service";
import LoginTrackingSchema from "./login-tracking.schema";

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: "LoginTracking", schema: LoginTrackingSchema }]), // model service implicitly
  ],
  providers: [LoginTrackingService],
  controllers: [LoginTrackingController],
  exports: [LoginTrackingService],
})
export default class LoginTrackingModule {}
