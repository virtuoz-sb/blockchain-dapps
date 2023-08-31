import { Controller, Get, HttpStatus, Logger, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { ManualTradeApiTag, ManualTradeRoutePrefix } from "./route_constant";
import StrategyRequestService from "./services/strategy-request.service";

@ApiTags(ManualTradeApiTag)
@Controller(ManualTradeRoutePrefix)
export default class TradeHealthController {
  private readonly logger = new Logger(TradeHealthController.name);

  constructor(private createStratService: StrategyRequestService) {}

  @Get("/h")
  @ApiOperation({
    summary: "trade engine health check",
  })
  async getEngineHealth(@Res() res: Response) {
    this.logger.log("GET api/eng (getEngineHealth)");

    let engineOK = false;
    try {
      engineOK = await this.createStratService.checkEngineHealth();
    } catch (err) {
      engineOK = false;
      this.logger.error(err, err.stack);
    }
    const now = new Date();
    if (engineOK) {
      res.status(HttpStatus.OK).json({ engine: { status: "OK", now } });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ engine: { status: "NOT_OK", now } });
    }
  }
}
