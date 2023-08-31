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
import { TransactionDto } from '../dto/transaction.dto';
import { TransactionService } from '../service/transaction.service';
import { IUserDocument } from "@torobot/shared"

@ApiTags("transaction")
@Controller('transaction')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('/all')
  getAll() {
    return this.transactionService.getAll();
  }

  @Get('id/:id')
  get(@Param('id', ParseObjectIdPipe) id: string) {
    return this.transactionService.getById(id);
  }
  
  @Get('/history')
  getHistory() {
    return this.transactionService.getHistory();
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() user: IUserDocument,
  ) {
    return this.transactionService.delete(
      await this.transactionService.validate(id),
    );
  }
}
