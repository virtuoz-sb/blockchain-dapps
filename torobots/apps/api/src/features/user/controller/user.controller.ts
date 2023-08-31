import { ApiTags } from "@nestjs/swagger";
import { Controller, BadRequestException, Get, Put, Body, Param, UseGuards, } from '@nestjs/common';
import { ParseObjectIdPipe } from '../../../shared/pipe/parse-object-id.pipe';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { UserService } from '../service/user.service';
import { UpdateDto } from '../dto/update.dto';
import { UpdateEmailDto } from '../dto/update-email.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { IUserDocument } from "@torobot/shared"

@ApiTags("user")
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/all')
  async getAll() {
    return this.userService.getAll();
  }

  @Get('/email/:email')
  async getByEmail(@Param('email') email: string) {
    return this.userService.filterUser(
      await this.userService.validateByEmail(email),
    );
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() body: UpdateDto
  ) {
    return this.userService.update(
      await this.userService.validate(id),
      body,
    );
  }

  @Put('me/email')
  async updateEmail(@CurrentUser() user: IUserDocument, @Body() body: UpdateEmailDto) {
    const emailUser = await this.userService.getByEmail(body.email);

    if (emailUser) {
      throw new BadRequestException('Email already exists');
    }

    user.email = body.email;

    return user.save();
  }

  // @Put('me/password')
  // async updatePassword(
  //   @CurrentUser() user: IUserDocument,
  //   @Body() body: UpdatePasswordDto,
  // ) {
  //   if (
  //     !user.isSocial &&
  //     !(await user.validatePassword(body.currentPassword))
  //   ) {
  //     throw new BadRequestException('Current password does not match');
  //   }

  //   if (body.password !== body.confirmPassword) {
  //     throw new BadRequestException('Passwords does not match');
  //   }

  //   if (await user.validatePassword(body.password)) {
  //     throw new BadRequestException('Do not use your current password');
  //   }

  //   user.password = body.password;

  //   return user.save();
  // }  
}
