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
import { TokenDetailReqDto } from '../dto/token.dto';
import { TokenService } from '../service/token.service';
import { IUserDocument } from "@torobot/shared"

@ApiTags("token")
@Controller('token')
@UseGuards(JwtAuthGuard)
export class TokenController {
  constructor(private tokenService: TokenService) {}

  @Post("/detail")
  async getDetail(@Body() reqDto: TokenDetailReqDto, @CurrentUser() user: IUserDocument) {
    return this.tokenService.getDetail(reqDto);
  }
}
