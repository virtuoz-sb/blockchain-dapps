import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { CexAccountDto } from '../dto/cexAccount.dto';
import { CexAccountService } from '../service/cexAccount.service';
import { IUserDocument } from "@torobot/shared"

@ApiTags("cexaccount")
@Controller('cexaccount')
@UseGuards(JwtAuthGuard)
export class CexAccountController {
  constructor(private cexAccountService: CexAccountService) { }

  @Get('/all')
  getAll() {
    return this.cexAccountService.getAll();
  }

  @Get()
  getUserWallets(@CurrentUser() user: IUserDocument) {
    return this.cexAccountService.getUserWallets(user);
  }

  @Get('id/:id')
  get(@Param('id', ParseObjectIdPipe) id: string) {
    return this.cexAccountService.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseObjectIdPipe) id: string, @CurrentUser() user: IUserDocument) {
    return this.cexAccountService.delete(await this.cexAccountService.validate(id), user);
  }

  @Post()
  async create(@Body() account: CexAccountDto, @CurrentUser() user: IUserDocument) {
    return this.cexAccountService.create(account, user);
  }

  @Put(':id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: CexAccountDto, @CurrentUser() user: IUserDocument) {
    return this.cexAccountService.update(await this.cexAccountService.validate(id), body as any, user);
  }

  @Get('accounts/:id')
  getAccounts(@Param('id', ParseObjectIdPipe) id: string) {
    return this.cexAccountService.getAccounts(id);
  }
}
