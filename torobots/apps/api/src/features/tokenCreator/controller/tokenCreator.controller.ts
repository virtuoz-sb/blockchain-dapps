import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { TokenCreatorService } from '../service/tokenCreator.service';
import { TokenCreatorDto } from '../dto/tokenCreator.dto';
import { IUserDocument, TokenCreatorFilter } from "@torobot/shared"

@ApiTags("token-creator")
@Controller('token-creator')
@UseGuards(JwtAuthGuard)
export class TokenCreatorController {
  constructor(private tokenService: TokenCreatorService) {}

  @Post()
  async create(@Body() payload: TokenCreatorDto, @CurrentUser() user: IUserDocument) {
    return this.tokenService.create(payload);
  }

  @Post('/mintToken')
  async mintToken(@Body() payload: {creatorId: string, amount: string}) {
    return this.tokenService.mintToken(payload);
  }

  @Post('/burnToken')
  async burnToken(@Body() payload: {creatorId: string, amount: string}) {
    return this.tokenService.burnToken(payload);
  }

  @Post('/addLP')
  async addLP(@Body() payload: {baseCoinAddress: string, baseCoinAmount: string, tokenAmount: string, dexId: string, creatorId: string}) {
    return this.tokenService.addLP(payload);
  }

  @Post('/removeLP')
  async removeLP(@Body() payload: {baseCoinAddress: string, lpAddress: string, lpAmount: string, dexId: string, creatorId: string}) {
    return this.tokenService.removeLP(payload);
  }

  @Get('/all')
  getAll() {
    return this.tokenService.getAll();
  }

  @Post('/search')
  async search(@Body() filter: TokenCreatorFilter) {
    return this.tokenService.search(filter);
  }

  @Delete(':id')  
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.tokenService.delete(
      await this.tokenService.validate(id)
    );
  }

  @Get('/mintBurnTransactions/:creatorId')
  getAllMintBrunTransactions(
    @Param('creatorId', ParseObjectIdPipe) creatorId: string
  ) {
    return this.tokenService.getAllMintBrunTransactions(creatorId);
  }

  @Get('/liquidityPoolTransactions/:creatorId')
  getAllLiquidityPoolTransactions(
    @Param('creatorId', ParseObjectIdPipe) creatorId: string
  ) {
    return this.tokenService.getAllLiquidityPoolTransactions(creatorId);
  }
}
