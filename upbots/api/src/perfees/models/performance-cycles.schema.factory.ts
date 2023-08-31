/* eslint-disable import/no-cycle */
/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-empty-function */

import CyclesShema from "../../performance/models/performance-cycles.schema";
import PerfeesSharedModule from "../perfees-shared.module";
import TradingService from "../services/trading.service";
import ModelsService from "../services/models.service";

export const PerformanceCycleSchemaFactory = {
  name: "PerformanceCyclesModel",
  imports: [PerfeesSharedModule],
  useFactory: (tradingService: TradingService, modelsService: ModelsService) => {
    const schema = CyclesShema;
    schema.post("findOneAndUpdate", async function () {});

    return schema;
  },
  inject: [TradingService, ModelsService],
};
