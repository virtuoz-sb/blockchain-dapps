import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiTags } from "@nestjs/swagger";
import { Indacoin } from "./indacoin";
import { User as UserDocument } from "../types/user";
import UserFromJWT from "../utilities/user.decorator";
import { CreateIndacoinDTO, UpdateIndacoinDTO } from "./indacoin.dto";
import IndacoinService from "./indacoin.service";

@ApiTags("indacoin")
@Controller("indacoin")
export default class IndacoinController {
  constructor(private indacoinService: IndacoinService) {}

  @Get()
  async listAll(): Promise<Indacoin[]> {
    return this.indacoinService.findAll();
  }

  @Get("/mine")
  @UseGuards(AuthGuard("jwt"))
  async listMine(@UserFromJWT() user: UserDocument): Promise<Indacoin[]> {
    const { id } = user;
    return this.indacoinService.findByOwner(id);
  }

  @Post("callback")
  async callback(@Body() transactionInfo): Promise<Indacoin> {
    return this.indacoinService.createFromCallback(transactionInfo);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async create(@Body() indacoin: CreateIndacoinDTO, @UserFromJWT() user: UserDocument): Promise<Indacoin> {
    return this.indacoinService.create(indacoin, user);
  }

  @Get(":id")
  async read(@Param("id") id: string): Promise<Indacoin> {
    return this.indacoinService.findById(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard("jwt"))
  async update(@Param("id") id: string, @Body() indacoin: UpdateIndacoinDTO, @UserFromJWT() user: UserDocument): Promise<Indacoin> {
    const { id: userId } = user;
    return this.indacoinService.update(id, indacoin, userId);
  }
}
