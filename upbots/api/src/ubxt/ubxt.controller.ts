import { Controller, Get, Post, CacheTTL, UseInterceptors, CacheInterceptor } from "@nestjs/common";
import { fromWei, toWei } from "web3-utils";
import * as BN from "bn.js";

import { ApiOperation, ApiTags, ApiResponse } from "@nestjs/swagger";
import UbxtContractService from "./ubxt-contract.service";
import TokenCirculation, { UbxtStakingData, TotalSupplyData } from "./ubxt-contract.model";

import * as UbxtCirculation from "./circulation/service";
import * as StakingService from "./ubxt-staking/service";
import SettingsDataService from "../settings/services/settings.data.service";

@ApiTags("ubxt")
@Controller("ubxt")
export default class UbxtController {
  constructor(private ubxt: UbxtContractService, private settingsDataService: SettingsDataService) {}

  @Get("circulation")
  @ApiOperation({
    summary: "Get current amount of UBXT tokens in circulation",
  })
  @ApiResponse({
    status: 200,
    type: TokenCirculation,
    description: "raw and rounded (from 18 decimals) serialized BigNumbers of circulating tokens (last 30 minutes)",
  })
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  async circulation(): Promise<any> {
    const balances = await UbxtCirculation.getCirculation();
    return {
      contractAddress: this.ubxt.getContractAddress(),
      ...balances,
      totalSupply: balances.supply,
    };
  }

  // async circulation(): Promise<any> {
  //   // const supply = this.format(await this.ubxt.totalSupply());
  //   const available = this.format(await this.ubxt.inCirculation());
  //   // const burnedAmount = Number(fromWei(await this.ubxt.burnedAmount()));

  //   await StakingService.calcStakingData();
  //   const stakingData = StakingService.getStakingData();
  //   const ethStaked = stakingData.eth.ubxtStaked + stakingData.eth.lpStakedTotal;
  //   const bscStaked = stakingData.bsc.ubxtStaked + stakingData.bsc.lpStakedTotal;
  //   const stakedAmount = Math.floor(ethStaked + bscStaked);
  //   const marketCap = Number(available.value) * stakingData.eth.finalPriceUbxt;

  //   const supply = stakingData.eth.totalSupply + stakingData.bsc.totalSupply;
  //   const burnedAmount = stakingData.eth.burntAmount + stakingData.bsc.burntAmount;

  //   return {
  //     contractAddress: this.ubxt.getContractAddress(),
  //     supply,
  //     available,
  //     ubxtPrice: stakingData.eth.finalPriceUbxt,
  //     marketCap,
  //     totalSupply: supply,
  //     burnedAmount,
  //     stakedAmount,
  //   };
  // }

  private format(bignum: BN) {
    return {
      raw: bignum.toString(),
      value: fromWei(bignum),
    };
  }

  @Get("staking")
  @ApiOperation({
    summary: "Get staking data",
  })
  @ApiResponse({
    status: 200,
    type: UbxtStakingData,
    description: "get staking data",
  })
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  async staking(): Promise<any> {
    await StakingService.calcStakingData();
    const stakingData = StakingService.getStakingData();

    return {
      eth: { ...stakingData.eth },
      bsc: { ...stakingData.bsc },
    };
  }

  @Get("total-supply")
  @ApiOperation({
    summary: "Get ubxt total supply",
  })
  @ApiResponse({
    status: 200,
    type: TotalSupplyData,
    description: "Get ubxt total supply",
  })
  @CacheTTL(1800)
  @UseInterceptors(CacheInterceptor)
  async totalSupply(): Promise<any> {
    const supply = await this.ubxt.totalSupply();
    const burnedAmount = await this.ubxt.burnedAmount();
    const totalSupplyAmount = supply.sub(burnedAmount);
    return {
      value: totalSupplyAmount.toString(),
      rounded: fromWei(totalSupplyAmount),
    };
  }

  @Get("staking-distribute-last-time")
  @ApiOperation({
    summary: "Get last time of staking distribution",
  })
  @ApiResponse({
    status: 200,
    type: String,
    description: "get last time of staking distribution",
  })
  @UseInterceptors(CacheInterceptor)
  async getLastTimeOfStakingDistribution(): Promise<any> {
    const lastTimeModel = await this.settingsDataService.getVariable("staking-distribution-last-time");
    const nowTime = new Date().toUTCString();
    const lastTime = lastTimeModel && lastTimeModel.value;
    return { lastTime, nowTime };
  }
}
