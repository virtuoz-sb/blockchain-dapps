/* eslint-disable no-empty */

import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import DexEvolutionService from "./dex-evolution.service";
import { DexWallet } from "./models/dex-wallet.schema";
import DexWalletDto from "./models/dexWallets.dto";

@Injectable()
export default class DexWalletsService {
  private readonly logger = new Logger(DexWalletsService.name);

  constructor(
    @InjectModel(DexWallet.name) private dexWalletModel: Model<DexWallet>, // TODO: inject this to implement cache invalidation @Inject(CACHE_MANAGER) private cacheManager: Cache
    private dexAssetsService: DexEvolutionService
  ) {}

  private formatDexWallets(wallets: any[]): DexWalletDto[] {
    return wallets.map((wallet) => ({
      label: wallet.label,
      address: wallet.address,
    }));
  }

  async createWallets(wallets: DexWalletDto[], userId: string) {
    const res = await this.dexWalletModel.create(
      wallets.map((wallet) => ({
        user: userId,
        ...wallet,
      }))
    );
    this.dexAssetsService.createEvolution(
      userId,
      wallets.map(({ address }) => address)
    );
    return this.formatDexWallets(res);
  }

  async getWallets(userId: string) {
    const res = await this.dexWalletModel.find({
      user: userId,
    });
    try {
      this.dexAssetsService.createEvolution(
        userId,
        res.map(({ address }) => address)
      );
    } catch {} // error would be thrown if address already exists for user, no need to pollute logs with it
    return this.formatDexWallets(res);
  }

  async deleteWallet(address: string, userId: string) {
    const res = await this.dexWalletModel.deleteOne({
      user: userId,
      address,
    });
    this.dexAssetsService.deleteEvolution(userId, address);
    return res.deletedCount ? address : null;
  }
}
