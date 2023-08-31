import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import IndacoinSchema from "./indacoin.schema";
import SharedModule from "../shared/shared.module";
import IndacoinController from "./indacoin.controller";
import IndacoinService from "./indacoin.service";
import UserSchema from "../models/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Indacoin", schema: IndacoinSchema },
      { name: "User", schema: UserSchema },
    ]),
    SharedModule,
  ],
  providers: [IndacoinService],
  controllers: [IndacoinController],
})
export default class IndacoinModule {}
