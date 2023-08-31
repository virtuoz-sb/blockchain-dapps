import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards
} from '@nestjs/common';
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';

import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from 'src/features/auth/guard/jwt-auth.guard';
// import { ReportDto } from '../dto/report.dto';
import { ReportService } from '../service/report.service';

@ApiTags("report")
@Controller("report")
@UseGuards(JwtAuthGuard)
export class ReportController {
    constructor(private reportService: ReportService) {}

    @Get('/liquidator/all')
    getAll() {
        return this.reportService.getAll();
    }

    @Get('/liquidator/:liquidatorId')
    getByLiquidator(@Param('liquidatorId', ParseObjectIdPipe) liquidatorId: string) {
        return this.reportService.getByLiquidator(liquidatorId);
    }

    @Get('/washer/:washerId')
    getByWasher(@Param('washerId', ParseObjectIdPipe) washerId: string) {
        return this.reportService.getByWasher(washerId);
    }

    @Get('/token-creator/:tokenCreatorId/mint-burn-details')
    getTokenMintBurnTransactions(@Param('tokenCreatorId', ParseObjectIdPipe) tokenCreatorId: string) {
        return this.reportService.getTokenMintBurnTransactions(tokenCreatorId);
    }

    @Get('/token-creator/:tokenCreatorId/liquidity-pool-details')
    getLiquidityPoolTransactions(@Param('tokenCreatorId', ParseObjectIdPipe) tokenCreatorId: string) {
        return this.reportService.getLiquidityPoolTransactions(tokenCreatorId);
    }
}