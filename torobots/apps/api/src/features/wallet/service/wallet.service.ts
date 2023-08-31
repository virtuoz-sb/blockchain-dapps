import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { remove } from '../../../shared/utils/remove';
import { WalletDto, GetBalanceByCoinDto } from '../dto/wallet.dto';
import { IStoredUser } from "@torobot/shared";
import { mongoDB, IUserDocument, IWalletDocument, walletUnpopulatedFields } from "@torobot/shared";
@Injectable()
export class WalletService {
  constructor() {}
  async create(wallet: WalletDto, user: IUserDocument) {
    const object = await mongoDB.Wallets.create({ ...wallet, owner: user._id });
    return this.getById(object._id);    
  }

  async update(wallet: IWalletDocument, body: UpdateQuery<IWalletDocument>, user: IUserDocument) {
    await mongoDB.Wallets.findOneAndUpdate({ _id: wallet._id, owner: user._id }, body);
    return this.getById(wallet._id);
  }

  delete(wallet: IWalletDocument, user: IUserDocument) {
    const owner = wallet.owner as IStoredUser;
    if (String(owner._id) === String(user._id)) {
      return mongoDB.Wallets.findByIdAndDelete({ _id: wallet._id, owner: user._id });
    } else {
      remove(wallet.users, (wuser: any) => wuser._id === user._id);
      return wallet.save();
    }
  }

  async getById(walletId: string) {
    const query = mongoDB.Wallets.findById(walletId).select(walletUnpopulatedFields);
    const doc = await mongoDB.Wallets.populateModel(query);
    return doc as IWalletDocument;
  }

  async validate(walletId: string) {
    const wallet = await this.getById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getAll() {
    const query = mongoDB.Wallets.find().select(walletUnpopulatedFields);
    return mongoDB.Wallets.populateModel(query);
  }

  getOwnerWallets(user: IUserDocument) {
    const query = mongoDB.Wallets.find({ owner: user._id }).select(walletUnpopulatedFields);
    return mongoDB.Wallets.populateModel(query);
  }

  async getUserWallets(user: IUserDocument) {
    const query = mongoDB.Wallets.find({ $or: [ {owner: user._id}, {users: { $in: user._id }} ] }).select(walletUnpopulatedFields);
    return mongoDB.Wallets.populateModel(query);
  }

  async getBalanceByCoin(payload: GetBalanceByCoinDto) {
    return 0;
  }
}