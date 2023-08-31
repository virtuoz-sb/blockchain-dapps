import {
  Body,
  Controller,
  Delete,
  Get,
  Query,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { PoolDto } from '../dto/pool.dto';
import { PoolService } from '../service/pool.service';
import { IUserDocument, PoolFilter } from "@torobot/shared"

@ApiTags("pool")
@Controller('pool')
@UseGuards(JwtAuthGuard)
export class PoolController {
  constructor(private poolService: PoolService) {}

  @Get('/all')
  async getAll() {
    return this.poolService.getAll();
  }

  @Post('/search')
  async search(@Body() filter: PoolFilter, @CurrentUser() user: IUserDocument) {
    return this.poolService.search(filter, user);
  }

  @Post('/search-running')
  async searchRunning(@Body() filter: PoolFilter, @CurrentUser() user: IUserDocument) {
    return this.poolService.searchRunning(filter, user);
  }

  @Post()
  async create(@Body() payload: PoolDto, @CurrentUser() user: IUserDocument) {
    return this.poolService.create(payload as any);
  }
}
