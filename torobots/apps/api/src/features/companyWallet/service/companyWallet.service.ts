import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import { CompanyWalletDto } from '../dto/companyWallet.dto';
import { IStoredUser } from "@torobot/shared";
import { mongoDB, IUserDocument, ICompanyWalletDocument, companyWalletUnpopulatedFields } from "@torobot/shared";
import { CounterService } from 'src/features/counter/service/counter.service';
@Injectable()
export class CompanyWalletService {
  constructor(
    private counterService: CounterService
  ) {}
  async create(wallet: CompanyWalletDto, user: IUserDocument) {
    const uniqueNum = await this.counterService.getNextSequenceValue("CompanyWallet");
    const object = await mongoDB.CompanyWallets.create({ ...wallet, owner: user._id, uniqueNum: uniqueNum });
    return this.getById(object._id);
  }

  async update(wallet: ICompanyWalletDocument, body: UpdateQuery<ICompanyWalletDocument>, user: IUserDocument) {
    await mongoDB.CompanyWallets.findOneAndUpdate({ _id: wallet._id }, body);
    return this.getById(wallet._id);
  }

  delete(wallet: ICompanyWalletDocument, user: IUserDocument) {
    const owner = wallet.owner as IStoredUser;
    if (String(owner._id) === String(user._id)) {
      return mongoDB.CompanyWallets.findOneAndUpdate(
        { _id: wallet._id, owner: user._id },
        { deleted: true }
      );
    } else {
      return wallet.save();
    }
  }

  async getById(walletId: string) {
    const query = mongoDB.CompanyWallets.findById(walletId).select(companyWalletUnpopulatedFields);
    const doc = await mongoDB.CompanyWallets.populateModel(query);
    return doc as ICompanyWalletDocument;
  }

  async validate(walletId: string) {
    const wallet = await this.getById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getAll() {
    const query = mongoDB.CompanyWallets
      .find({deleted: false})
      .sort({updated: -1})
      .select(companyWalletUnpopulatedFields);
    return mongoDB.CompanyWallets.populateModel(query);
  }

  getOwnerWallets(user: IUserDocument) {
    const query = mongoDB.CompanyWallets.find({ owner: user._id, deleted: false }).select(companyWalletUnpopulatedFields);
    return mongoDB.CompanyWallets.populateModel(query);
  }

  async getUserWallets(user: IUserDocument) {
    const query = mongoDB.CompanyWallets.find({owner: user._id, deleted: false}).select(companyWalletUnpopulatedFields);
    return mongoDB.CompanyWallets.populateModel(query);
  }
}