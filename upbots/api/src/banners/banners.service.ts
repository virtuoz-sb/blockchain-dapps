import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Banner } from "./models/banner.schema";
import { BannerDto } from "./types/banner.d";

@Injectable()
export default class BannerService {
  constructor(@InjectModel(Banner.name) private bannerModel: Model<Banner>) {}

  public async getBanners() {
    const res = await this.bannerModel.find({}).exec();
    return res.map((elem) => ({
      ...elem.toJSON(),
      image: Buffer.from(elem.image).toString(),
    }));
  }

  public async createBanner(banner: BannerDto) {
    await this.bannerModel.create(banner);
    return banner;
  }

  public removeBanner(id: string) {
    return this.bannerModel.deleteOne({ _id: id }).exec();
  }
}
