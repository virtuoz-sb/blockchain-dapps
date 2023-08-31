import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import BannerController from "./banners.controller";
import BannerService from "./banners.service";
import { Banner, BannerSchema } from "./models/banner.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }])],
  providers: [BannerService],
  controllers: [BannerController],
})
export default class BannerModule {}
