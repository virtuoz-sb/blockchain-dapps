import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { Indacoin } from "./indacoin";
import { User } from "../types/user";
import { CreateIndacoinDTO, IndacoinTransactionDTO, UpdateIndacoinDTO } from "./indacoin.dto";

@Injectable()
export default class IndacoinService {
  private readonly logger = new Logger(IndacoinService.name);

  constructor(@InjectModel("Indacoin") private indacoinModel: Model<Indacoin>, @InjectModel("User") private userModel: Model<User>) {}

  async findAll(): Promise<Indacoin[]> {
    return this.indacoinModel.find().populate("userId");
  }

  async findByOwner(userId: string): Promise<Indacoin[]> {
    return this.indacoinModel.find({ userId }).populate("userId");
  }

  async findById(id: string): Promise<Indacoin> {
    const indacoin = await this.indacoinModel.findById(id).populate("userId");
    if (!indacoin) {
      throw new HttpException("Indacoin not found", HttpStatus.NO_CONTENT);
    }
    return indacoin;
  }

  async create(indacoinDTO: CreateIndacoinDTO, user: User): Promise<Indacoin> {
    const indacoin = await this.indacoinModel.create({ ...indacoinDTO, user });
    await indacoin.save();
    return indacoin.populate("userId");
  }

  async createFromCallback(transactionInfo: IndacoinTransactionDTO): Promise<Indacoin> {
    this.logger.log(`INDACOIN transactions info ${transactionInfo}`);
    const { userId } = transactionInfo;
    const user = await this.userModel.findOne({ email: userId });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    const indacoin = await this.indacoinModel.findOneAndUpdate(
      { transactionId: transactionInfo.transactionId },
      { ...transactionInfo, user },
      { upsert: true }
    );
    await indacoin.save();
    return indacoin.populate("userId");
  }

  async update(id: string, indacoinDTO: UpdateIndacoinDTO, userId: string): Promise<Indacoin> {
    const indacoin = await this.indacoinModel.findById(id);
    if (userId !== indacoin.user.id) {
      throw new HttpException("You do not own this indacoin", HttpStatus.UNAUTHORIZED);
    }
    await indacoin.updateOne(indacoinDTO);
    return this.indacoinModel.findById(id).populate("userId");
  }
}
