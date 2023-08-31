import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import BannerService from "./banners.service";
import { BannerDto } from "./types/banner.d";

@Controller("banners")
@UseGuards(AuthGuard("jwt"))
export default class BannerController {
  constructor(private bannerService: BannerService) {}

  @Get("")
  getBanners() {
    return this.bannerService.getBanners();
  }

  @Post("")
  async createBanner(@Body() banner: BannerDto) {
    return this.bannerService.createBanner(banner);
  }

  @Delete(":id")
  async removeBanner(@Param("id") bannerId: string) {
    return this.bannerService.removeBanner(bannerId);
  }
}
