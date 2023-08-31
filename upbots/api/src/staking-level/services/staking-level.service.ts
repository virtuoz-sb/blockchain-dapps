/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable, Logger } from "@nestjs/common";
import { User } from "../../types/user";
import * as StakingLevelModelSchema from "../models/staking-level.model";

@Injectable()
export default class StakingLevelService {
  private readonly logger = new Logger(StakingLevelService.name);

  private readonly awardTable = {
    0: {
      // default, no advantage
      minAmount: 0,
      accessCommunityBots: false,
      accessCreateBot: false,
      bonusFee: 0,
      prizeNFT: "",
    },
    1: {
      minAmount: 2500,
      accessCommunityBots: true,
      accessCreateBot: false,
      bonusFee: 0,
      prizeNFT: "",
    },
    2: {
      minAmount: 30000,
      accessCommunityBots: true,
      accessCreateBot: true,
      bonusFee: 5,
      prizeNFT: "",
    },
    3: {
      minAmount: 100000,
      accessCommunityBots: true,
      accessCreateBot: true,
      bonusFee: 10,
      prizeNFT: "Supporter of UpBots",
    },
    4: {
      minAmount: 250000,
      accessCommunityBots: true,
      accessCreateBot: true,
      bonusFee: 20,
      prizeNFT: "Close circle of UpBots",
    },
    5: {
      minAmount: 1000000,
      accessCommunityBots: true,
      accessCreateBot: true,
      bonusFee: 35,
      prizeNFT: "Prince of UpBots",
    },
    6: {
      minAmount: 2000000,
      accessCommunityBots: true,
      accessCreateBot: true,
      bonusFee: 50,
      prizeNFT: "King of UpBots",
    },
    7: {
      minAmount: 5000000,
      accessCommunityBots: true,
      accessCreateBot: true,
      bonusFee: 65,
      prizeNFT: "God of UpBots",
    },
  };

  private readonly maxLevel = 7;

  constructor(
    @InjectModel("User") private userModel: Model<User>,
    @InjectModel(StakingLevelModelSchema.ModelName) private StakingLevelModel: Model<StakingLevelModelSchema.Model>
  ) {}

  onModuleInit() {}

  /**
   * this funtion canbe called when displaying user info or calculating the fee
   * @param userId
   * @returns
   */
  async getCurrentStakingLevelAndFee(userId: string): Promise<StakingLevelModelSchema.UserStakingLevelInfo> {
    const levelInfo = await this.StakingLevelModel.findOne({ userId });
    if (levelInfo) {
      return {
        currentFeeOff: levelInfo.currentFeeOff,
        latestLevel: levelInfo.latestLevel,
        accessCommunityBots: this.awardTable[levelInfo.latestLevel].accessCommunityBots,
        accessCreateBot: this.awardTable[levelInfo.latestLevel].accessCreateBot,
        prizeNFT: this.awardTable[levelInfo.latestLevel].prizeNFT,
      };
    }
    return null;
  }

  getLevelByAmount(amount: number): number {
    let currentLevel = this.maxLevel;
    while (currentLevel > 0) {
      if (amount >= this.awardTable[currentLevel].minAmount) {
        return currentLevel;
      }
      currentLevel -= 1;
    }
    return 0;
  }

  getFeeOff(level: number): number {
    // return fee - fee * this.awardTable[level < 0 ? 0 : (level > 7 ? 7 : level)].bonusFee;
    let _level = level;
    if (level < 0) {
      _level = 0;
    } else if (level > 7) {
      _level = 7;
    }
    return this.awardTable[_level].bonusFee;
  }

  async getMaxLevelOfUser(userId: string): Promise<number> {
    const levelData = await this.StakingLevelModel.findOne({ userId });
    if (levelData) {
      let lvl = this.maxLevel;
      while (lvl > 0) {
        if (levelData[`level${lvl}`]) {
          return lvl;
        }
        lvl -= 1;
      }
      return 0;
    }
    return 0;
  }

  /**
   * this function should be called whenever the staking amount updated
   *  // get fee rate from staking level model
      const stakingLevelData = await this.stakingLevelService.getCurrentStakingLevelAndFee(userId);
      const feeRate = stakingLevelData ? 0.2 * (1 - stakingLevelData.currentFeeOff) : 0.2;
   * @param userId 
   * @param amount 
   */
  async checkAndAwardPrizeByUser(userId: string, amount: number, wallet: string) {
    const currentLevel = this.getLevelByAmount(amount);
    const maxLevel = await this.getMaxLevelOfUser(userId);
    let stakingInfo = await this.StakingLevelModel.findOne({ userId });
    if (!stakingInfo) {
      stakingInfo = new this.StakingLevelModel({
        userId,
      });
      stakingInfo = await stakingInfo.save();
    }

    if (currentLevel > maxLevel) {
      const prizeName = this.awardTable[currentLevel].prizeNFT;
      if (prizeName && prizeName.length > 0) {
        // TODO: send NFT to user
        // for all level under currentLevel, excepting not null
        // ex) assumed that the current level 6, 1 and 2 awarded before. then 4, 5, and 6 should be awarded.
        // and would add a field showing the NFTs awarded. awarded: [1, 1, 0, 0, 0, 0, 0, 0]
      }

      // update user level to new level
      stakingInfo.amount = amount;
      stakingInfo.amountPeak = amount;
      stakingInfo.currentFeeOff = this.getFeeOff(currentLevel);
      stakingInfo.latestLevel = currentLevel;
      stakingInfo.wallet = wallet;
      stakingInfo[`level${currentLevel}`] = new Date();
    } else if (wallet) {
      if (currentLevel > stakingInfo.latestLevel || (stakingInfo.wallet && stakingInfo.wallet === wallet) || !stakingInfo.wallet) {
        stakingInfo.amount = amount;
        stakingInfo.currentFeeOff = this.getFeeOff(currentLevel);
        stakingInfo.latestLevel = currentLevel;
        stakingInfo.wallet = wallet;
      }
    } else {
      stakingInfo.amount = amount;
      stakingInfo.currentFeeOff = this.getFeeOff(currentLevel);
      stakingInfo.latestLevel = currentLevel;
    }
    await stakingInfo.save();
  }
}
