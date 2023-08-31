import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import SharedModule from "../shared/shared.module";
import MarketingController from "./controllers/marketing.controller";

import ComingSoonSchema from "./schemas/comingsoon.schema";
import ComingSoonRepository from "./repositories/comingsoon.repository";

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([{ name: "ComingSoon", schema: ComingSoonSchema }]), // model service implicitly
  ],
  controllers: [MarketingController],
  providers: [ComingSoonRepository],
})
export default class MarketingModule {}
