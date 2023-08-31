import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CompanyWalletDto } from '../dto/companyWallet.dto';
import { CompanyWalletService } from '../service/companyWallet.service';
import { IUserDocument } from "@torobot/shared"

@ApiTags("companywallet")
@Controller('companywallet')
@UseGuards(JwtAuthGuard)
export class CompanyWalletController {
  constructor(private companyWalletService: CompanyWalletService) {}

  @Get('/all')
  getAll() {
    return this.companyWalletService.getAll();
  }

  @Get()
  getUserWallets(@CurrentUser() user: IUserDocument) {
    return this.companyWalletService.getUserWallets(user);
  }

  @Get('id/:id')
  get(@Param('id', ParseObjectIdPipe) id: string) {
    return this.companyWalletService.getById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: IUserDocument,
  ) {
    return this.companyWalletService.delete(
      await this.companyWalletService.validate(id),
      user,
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: CompanyWalletDto,
    @CurrentUser() user: IUserDocument,
  ) {
    return this.companyWalletService.update(
      await this.companyWalletService.validate(id),
      body as any,
      user,
    );
  }

  @Post()
  async create(@Body() wallet: CompanyWalletDto, @CurrentUser() user: IUserDocument) {
    return this.companyWalletService.create(wallet, user);
  }
}
