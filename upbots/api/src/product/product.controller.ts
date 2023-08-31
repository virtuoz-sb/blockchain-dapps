import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { ApiTags } from "@nestjs/swagger";
import SellerGuard from "../shared/seller.guard";
import { Product } from "../types/product";
import { User as UserDocument } from "../types/user";
import UserFromJWT from "../utilities/user.decorator";
import { CreateProductDTO, UpdateProductDTO } from "./product.dto";
import ProductService from "./product.service";

@ApiTags("product")
@Controller("product")
export default class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  async listAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get("/mine")
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async listMine(@UserFromJWT() user: UserDocument): Promise<Product[]> {
    const { id } = user;
    return this.productService.findByOwner(id);
  }

  @Get("/seller/:id")
  async listBySeller(@Param("id") id: string): Promise<Product[]> {
    return this.productService.findByOwner(id);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async create(@Body() product: CreateProductDTO, @UserFromJWT() user: UserDocument): Promise<Product> {
    return this.productService.create(product, user);
  }

  @Get(":id")
  async read(@Param("id") id: string): Promise<Product> {
    return this.productService.findById(id);
  }

  @Put(":id")
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async update(@Param("id") id: string, @Body() product: UpdateProductDTO, @UserFromJWT() user: UserDocument): Promise<Product> {
    const { id: userId } = user;
    return this.productService.update(id, product, userId);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), SellerGuard)
  async delete(@Param("id") id: string, @UserFromJWT() user: UserDocument): Promise<Product> {
    const { id: userId } = user;
    return this.productService.delete(id, userId);
  }
}
