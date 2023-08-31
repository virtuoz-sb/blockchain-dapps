/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import * as moment from "moment";

import { User, UserDto, UserIdentity } from "../../types/user";
import ModelsService from "./models.service";

import * as ModelTypes from "../models/types";
import * as UserWallet from "../models/user-wallet.model";
import * as UserTransaction from "../models/user-transaction.model";

@Injectable()
export default class AdminsService {
  private readonly logger = new Logger(AdminsService.name);

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(UserWallet.ModelName) private UserWalletModel: Model<UserWallet.Model>,
    @InjectModel(UserTransaction.ModelName) private UserTransactionModel: Model<UserTransaction.Model>,
    private modelsService: ModelsService
  ) {}

  onModuleInit() {}
}
