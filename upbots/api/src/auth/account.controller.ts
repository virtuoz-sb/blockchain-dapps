import {
  Controller,
  Logger,
  Body,
  Request,
  Get,
  Put,
  Delete,
  Query,
  BadRequestException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Post,
  HttpCode,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import MarketingAutomationService from "../marketing-automation/marketing-automation.service";
import AdminGuard from "../shared/admin.guard";
import SuperAdminGuard from "../shared/superadmin.guard";
import UserService from "../shared/user.service";
import UserFromJWT from "../utilities/user.decorator";
import { UserIdentity, UserDto, UserForUpdateDto, User as UserDocument } from "../types/user";
import { NewPasswordDTO } from "./auth.dto";
import { SubmitEmailCodeDto, EmailVerificationResponse } from "./account/SubmitEmailCodeDto";
import validationPipe from "../shared/validation.pipe";
import { UbxtStakingDto } from "./account/UbxtStakingDto";
import { UserRolesDto } from "./account/UserRolesDto";
import IpAddress from "../utilities/ip-address.decorator";
import { createUserIpAddressInfo } from "./auth.helper";

@ApiTags("account")
@Controller("account")
export default class AccountController {
  private readonly logger = new Logger(AccountController.name);

  constructor(private userService: UserService, private automationService: MarketingAutomationService) {}

  @Post("verify")
  @HttpCode(200)
  @ApiOperation({
    summary: "Account confirmation",
    description: `Activate account: (activation code received by email)`,
  })
  @ApiResponse({ status: 200, description: "Ok" })
  @ApiResponse({ status: 422, description: "Validation error" })
  @ApiResponse({ status: 400, description: "Invalid code" })
  @ApiResponse({ status: 500, description: "Error" })
  async verifyEmail(@Body(validationPipe) payload: SubmitEmailCodeDto): Promise<EmailVerificationResponse> {
    this.logger.debug(`verifyEmail: ${payload.code}`);
    const activated = await this.userService.setEmailAsVerified(payload.code);
    if (!activated) {
      throw new BadRequestException();
    }

    // Initiate automation flow
    // * Disabled temporarily till the requirement is fulfilled.
    // this.automationService.handleUserVerifyEmail(req.user.email);

    return Promise.resolve<EmailVerificationResponse>({ verify: activated });
  }

  @Get("user")
  @ApiResponse({ status: 200, description: "Returns user information" })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @UseGuards(AuthGuard("jwt"))
  // getMe(@UserFromJWT() { id, email }: UserDto): any {
  getMe(@Request() req, @UserFromJWT() user: UserDto): UserDto {
    // const { id, ...publicUser } = user;
    this.logger.debug(`req.user: ${JSON.stringify(req.user)}`);
    this.logger.debug(`user (decorator): ${JSON.stringify(user)}`);

    return req.user;
  }

  @Put("update")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200, description: "Ok" })
  @ApiResponse({ status: 422, description: "Validation error" })
  async update(@Body(validationPipe) postedData: UserForUpdateDto, @Request() req) {
    if (req.user.email !== postedData.email) {
      throw new BadRequestException("email does not match");
    }
    return this.userService.updateUser(postedData, req.user.email);
  }

  @Post("picture")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file, @Request() req) {
    const fileBase64 = file.buffer.toString("base64");

    if (fileBase64.length > 2500000) {
      throw new BadRequestException("Profile picture is too large! Please Crop it.");
    }
    return this.userService.updateUserPicture(file, req.user.email);
  }

  @Put("password")
  @UseGuards(AuthGuard("jwt"))
  async updatePassword(
    @Req() req,
    @Body()
    cred: NewPasswordDTO,
    @IpAddress() ipAddress,
    @UserFromJWT() user: UserDocument
  ) {
    const userInfo = createUserIpAddressInfo(req, ipAddress);
    this.logger.log(`email password reset userInfo ip: ${userInfo.ip} address ${userInfo.address}, device: ${userInfo.device}`);

    return this.userService.updateUserPassword(cred, user, userInfo);
  }

  /**
   *
   * @param req user details
   * @returns user ubxt staking amount
   */
  @Get("staking-amount")
  @ApiResponse({ status: 200, description: "Returns user ubxt staking amount" })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @UseGuards(AuthGuard("jwt"))
  getUserUbxtStakingAmount(@Request() req) {
    return this.userService.getUbxtStakingAmount(req.user.email);
  }

  /**
   *
   * @param req user details
   * @param payload ubxt staking value
   * @returns boolean value
   */
  @Put("staking-amount")
  @ApiResponse({ status: 200, description: "Returns true" })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @UseGuards(AuthGuard("jwt"))
  updateUserUbxtStakingAmount(@Request() req, @Body(validationPipe) payload: UbxtStakingDto): Promise<boolean> {
    return this.userService.updateUbxtStakingAmount(req.user.email, payload.ubxtStakingAmount, payload.walletAddress ?? null);
  }

  /**
   *
   * @param req user details
   * @param userID user id
   * @returns boolean value
   */
  @Put("admin/user-roles")
  @ApiResponse({ status: 200, description: "Returns true" })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard("jwt"))
  updateUserRole(@Body(validationPipe) payload: UserRolesDto): Promise<boolean> {
    return this.userService.updateUserRole(payload);
  }

  @Get("admin/users")
  @ApiResponse({ status: 200, description: "Returns user information" })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @UseGuards(AdminGuard)
  @UseGuards(AuthGuard("jwt"))
  getUserByEmail(@Query("email") email: string): Promise<UserIdentity> {
    return this.userService.findUser(email);
  }

  @Delete("admin/users")
  @ApiResponse({ status: 200, description: "Returns user information" })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @UseGuards(SuperAdminGuard)
  @UseGuards(AuthGuard("jwt"))
  deleteUserByEmail(@Query("email") email: string): Promise<boolean> {
    return this.userService.deleteUser(email);
  }
}
