import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import UserSettingsController from "./controllers/usersettings.controller";
import UserSettingsRepository from "./repositories/usersettings.repository";
import UserSettingsSchema from "./schemas/usersettings.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "UserSettings", schema: UserSettingsSchema }]), // model service implicitly
  ],
  controllers: [UserSettingsController],
  providers: [UserSettingsRepository],
  exports: [UserSettingsRepository],
})
export default class UserSettingsModule {}
