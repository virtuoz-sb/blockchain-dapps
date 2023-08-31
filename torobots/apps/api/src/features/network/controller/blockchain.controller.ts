import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from "@nestjs/swagger";
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { BlockchainDto } from '../dto/blockchain.dto';
import { BlockchainService } from '../service/blockchain.service';

@ApiTags("network")
@Controller('network/blockchain')
@UseGuards(JwtAuthGuard)
export class BlockchainController {
  constructor(private blockchainService: BlockchainService) { }

  @Get('/all')
  getAll() {
    return this.blockchainService.getAll();
  }

  @Get('id/:id')
  get(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blockchainService.getById(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blockchainService.delete(await this.blockchainService.validate(id));
  }

  @Post()
  async create(@Body() blockchain: BlockchainDto) {
    return this.blockchainService.create(blockchain);
  }

  @Put(':id')
  async update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: BlockchainDto) {
    return this.blockchainService.update(await this.blockchainService.validate(id), body);
  }
}
