/* eslint-disable */
import { Controller, Get, UseGuards, Put, Param, Query, DefaultValuePipe, ParseIntPipe, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { User as UserDocument } from "../../types/user";
import UserFromJWT from "../../utilities/user.decorator";
import NotificationRepository from "../repositories/notification.repository";
import NotificationModel, { NotificationDto } from "../models/notification.model";

@ApiTags("notifications")
@Controller("notifications")
export default class NotificationController {
  constructor(private repo: NotificationRepository) {}

  @ApiOperation({
    summary: "get all unread and read user notifications",
    description: `get the notifications based on userid where isDelete flag is false`,
  })
  @ApiResponse({
    type: NotificationDto,
    isArray: true,
  })
  @Get()
  @UseGuards(AuthGuard("jwt"))
  async findUnreadAndReadUserNotifications(
    @UserFromJWT() user: UserDocument,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(50), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number
  ): Promise<NotificationDto[]> {
    const { id } = user;
    return this.repo.findAllUserNotifications(id, page, pageSize);
  }

  @ApiOperation({
    summary: "get unread user notifications",
    description: `get the notifications based on userid where isRead flag is false and isDeleted flag is false`,
  })
  @ApiResponse({
    type: NotificationDto,
    isArray: true,
  })
  @Get("unread")
  @UseGuards(AuthGuard("jwt"))
  async findUnreadUserNotifications(
    @UserFromJWT() user: UserDocument,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(50), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number
  ): Promise<NotificationDto[]> {
    const { id } = user;
    return this.repo.findUnreadUserNotifications(id, page, pageSize);
  }

  @ApiOperation({
    summary: "get read user notifications",
    description: `get the notifications based on userid where isRead flag is true and isDeleted flag is false`,
  })
  @ApiResponse({
    type: NotificationDto,
    isArray: true,
  })
  @Get("read")
  @UseGuards(AuthGuard("jwt"))
  async findReadUserNotifications(
    @UserFromJWT() user: UserDocument,
    @Query("p", new DefaultValuePipe(0), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) page: number,
    @Query("s", new DefaultValuePipe(50), new ParseIntPipe({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })) pageSize: number
  ): Promise<NotificationDto[]> {
    const { id } = user;
    return this.repo.findReadUserNotifications(id, page, pageSize);
  }

  @ApiOperation({
    summary: "set a notification as read",
    description: `set the isRead flag to true for a notification based on userid and notification id`,
  })
  @Put("read/:notificationId")
  @ApiParam({
    name: "notificationId",
    type: String,
    required: true,
  })
  @UseGuards(AuthGuard("jwt"))
  async readUserNotification(@UserFromJWT() user: UserDocument, @Param("notificationId") notificationId: string): Promise<Boolean> {
    const { id } = user;
    return this.repo.readUserNotification(id, notificationId);
  }

  @ApiOperation({
    summary: "set all the user notifications from unread to read status",
    description: `set the isRead flag to true for all the user notifications based on userid`,
  })
  @Put("readall")
  @UseGuards(AuthGuard("jwt"))
  async readAllUserNotification(@UserFromJWT() user: UserDocument): Promise<Boolean> {
    const { id } = user;
    return this.repo.readAllUserNotification(id);
  }

  @ApiOperation({
    summary: "set all the user notifications from read to unread status",
    description: `set the isRead flag to false for all the user notifications based on userid`,
  })
  @Put("unreadall")
  @UseGuards(AuthGuard("jwt"))
  async unreadAllUserNotification(@UserFromJWT() user: UserDocument): Promise<Boolean> {
    const { id } = user;
    return this.repo.unreadAllUserNotification(id);
  }

  @ApiOperation({
    summary: "set a user notification to deleted status",
    description: `set the isDeleted flag to true for a notification based on userid and notification id`,
  })
  @Put("delete/:notificationId")
  @ApiParam({
    name: "notificationId",
    type: String,
    required: true,
  })
  @UseGuards(AuthGuard("jwt"))
  deleteUserNotification(@UserFromJWT() user: UserDocument, @Param("notificationId") notificationId: string): Promise<Boolean> {
    const { id } = user;
    return this.repo.deleteUserNotification(id, notificationId);
  }
}
