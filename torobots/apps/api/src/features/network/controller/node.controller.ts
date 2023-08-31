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
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { NodeDto } from '../dto/node.dto';
import { NodeService } from '../service/node.service';

@ApiTags("network")
@Controller('network/node')
@UseGuards(JwtAuthGuard)
export class NodeController {
  constructor(private nodeService: NodeService) {}

  @Get('/all')
  getAll() {
    return this.nodeService.getAll();
  }

  @Get('id/:id')
  getById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.nodeService.getById(id);
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.nodeService.delete(
      await this.nodeService.validate(id),
    );
  }

  @Post()
  async create(@Body() node: NodeDto) {
    return this.nodeService.create(node);
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: NodeDto
  ) {
    return this.nodeService.update(
      await this.nodeService.validate(id),
      body as any,
    );
  }
}
