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
import { WalletDto, GetBalanceByCoinDto } from '../dto/wallet.dto';
import { WalletService } from '../service/wallet.service';
import { IUserDocument } from "@torobot/shared"

@ApiTags("wallet")
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('/all')
  getAll() {
    return this.walletService.getAll();
  }

  @Get()
  getUserWallets(@CurrentUser() user: IUserDocument) {
    return this.walletService.getUserWallets(user);
  }

  @Get('id/:id')
  get(@Param('id', ParseObjectIdPipe) id: string) {
    return this.walletService.getById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: IUserDocument,
  ) {
    return this.walletService.delete(
      await this.walletService.validate(id),
      user,
    );
  }

  @Post()
  async create(@Body() wallet: WalletDto, @CurrentUser() user: IUserDocument) {
    return this.walletService.create(wallet, user);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: WalletDto,
    @CurrentUser() user: IUserDocument,
  ) {
    return this.walletService.update(
      await this.walletService.validate(id),
      body as any,
      user,
    );
  }

  @Post('balance-by-coin')
  async getBalanceByCoin(@Body() payload: GetBalanceByCoinDto): Promise<number> {
    return this.walletService.getBalanceByCoin(payload);
  }
}
