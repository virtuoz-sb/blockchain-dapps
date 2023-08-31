import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import CouponsService from "./services/coupons.service";
import CouponsServiceData from "./services/coupons.service.data";
import CouponsController from "./controller/coupons.controller";
import CouponsSchema from "./models/coupons.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: "Coupons", schema: CouponsSchema }])],
  controllers: [CouponsController],
  providers: [CouponsService, CouponsServiceData],
})
class CouponsModule {}

export default CouponsModule;
