import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Query,
  ForbiddenException,
  Res,
  HttpStatus,
  InternalServerErrorException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import * as BN from "bn.js";
import { toWei } from "web3-utils";

import { User as UserDocument, DepositAddressDto } from "../types/user";
import UserService from "../shared/user.service";
import UserFromJWT from "../utilities/user.decorator";

import ArkaneCapsuleService from "./arkane/arkane-capsule.service";
import SignerService from "./validator/signer.service";
import WalletsGuard from "./wallets.guard";

import { WithdrawDto, ClaimOrWithdrawResponse, NeedsRefillResponse, GasLimits } from "./custodial-wallets.types";

@ApiTags("wallets")
@Controller("custodial-wallets")
export default class CustodialWalletsController {
  private GAS: GasLimits = {
    rebalance: [0, 200000],
    withdraw: [76000, 200000],
  };

  private MINIMAL_WITHDRAWAL = 2000;

  constructor(private walletsService: ArkaneCapsuleService, private userService: UserService, private signer: SignerService) {}

  @Get("pair")
  @UseGuards(AuthGuard("jwt"), WalletsGuard)
  @ApiOperation({
    summary: "For current user, get the pair of Ethereum and Binance wallets",
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: "No wallets for given operation" })
  async pair(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const { identifier } = user.custodialWallets;
    const [eth, bsc] = await this.walletsService.findPair(identifier);
    if (!user.custodialWallets.ethAddress || !user.custodialWallets.bscAddress) {
      await this.userService.updateUserWallets({ custodialWallets: { ethAddress: eth.address, bscAddress: bsc.address } }, user.email);
    }

    res.status(HttpStatus.OK).json({ eth, bsc });
  }

  @Post("pair")
  @UseGuards(AuthGuard("jwt"))
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 403, description: "Wallet pair already exists" })
  async generate(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    if (user.custodialWallets.identifier) {
      throw new ForbiddenException("Wallet pair already exists");
    } else {
      const { identifier, pincode } = this.walletsService.generateCredentials();
      const [eth, bsc] = await this.walletsService.createPair(identifier, pincode);

      await this.userService.updateUserWallets(
        {
          custodialWallets: { identifier, pincode, ubxtDeposit: "0", ethAddress: eth.address, bscAddress: bsc.address },
        },
        user.email
      );

      res.status(HttpStatus.OK).json({ eth, bsc, identifier, pincode });
    }
  }

  @Get("ubxt")
  @UseGuards(AuthGuard("jwt"), WalletsGuard)
  @ApiOperation({
    summary: "Returns Ethereum and Binance Smart Chain UBXT balances with wallets for current user",
  })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: "No wallets for given operation" })
  async ubxt(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const { identifier } = user.custodialWallets;
    const [eth, bsc] = await this.walletsService.findUbxtPair(identifier);

    res.status(HttpStatus.OK).json({ eth, bsc });
  }

  // TODO: create Validator service
  // that takes wallets data, checks
  // validity of amounts and
  // signs valid transaction
  @Post("rebalance")
  @UseGuards(AuthGuard("jwt"), WalletsGuard)
  @ApiOperation({
    summary: "Claim amount of BUBXT",
    description: "Checks Ethereum wallet's UBXT balance and adds missing amount to BSC one if necessary",
  })
  @ApiResponse({ status: 200, type: ClaimOrWithdrawResponse })
  @ApiResponse({ status: 202, type: NeedsRefillResponse })
  @ApiResponse({ status: 400, description: "No wallets for given operation" })
  async rebalancePair(@UserFromJWT() user: UserDocument, @Res() res: Response) {
    const { identifier, ubxtDeposit, pincode } = user.custodialWallets;

    const [eth, bsc] = await this.walletsService.findUbxtPair(identifier);
    const nonce = this.walletsService.generateNonce();

    const { deposit, delta } = this.calcClaimAmounts(eth.token.rawBalance, ubxtDeposit);

    if (delta.gtn(0)) {
      const fees = await this.walletsService.getGasFees(eth.wallet, bsc.wallet, ...this.GAS.rebalance);
      if (fees.totalUbxt.gtn(0)) {
        const [txEth, txBsc] = await this.walletsService.refillWallets(eth.wallet, bsc.wallet, fees);
        const [, etaBsc] = await this.walletsService.fetchConfTimes(fees);

        await this.updateUserDebt(user, fees);

        return res.status(HttpStatus.ACCEPTED).json({
          message: "Needs gas refill",
          eth: { ...txEth },
          bsc: { ...txBsc, eta: etaBsc },
        });
      }

      try {
        const ubxtFee = (await this.userService.findUser(user.email)).custodialWallets.ubxtDebt;
        const claimed = delta.sub(new BN(ubxtFee)).toString();
        const signature = await this.signer.sign(bsc.wallet.address, claimed, nonce);
        const { transactionHash } = await this.walletsService.claim({ ubx: bsc, pincode, amount: claimed, nonce, signature });

        await this.userService.updateUserWallets({ custodialWallets: { ubxtDeposit: deposit, ubxtDebt: "0" } }, user.email);

        return res.status(HttpStatus.OK).json({
          bsc: {
            amount: delta.toString(),
            transactionHash,
            ubxtFee,
          },
        });
      } catch (e) {
        await this.updateUserDebt(user, fees, "sub");
        throw new InternalServerErrorException(`Deposit failed: ${e}`);
      }
    }
    return res.status(HttpStatus.OK).json({
      bsc: {
        amount: "0",
      },
    });
  }

  @Post("withdraw")
  @UseGuards(AuthGuard("jwt"), WalletsGuard)
  @ApiOperation({
    summary: "Withdraw amount of BUBXT",
    description: "Withdraws UBXT amount on Binance and transfers equivalent Ethereum UBXT to given address",
  })
  @ApiResponse({ status: 200, type: ClaimOrWithdrawResponse })
  @ApiResponse({ status: 400, description: "No wallets for given operation" })
  @ApiResponse({ status: 403, description: "Withdraw amount exceeds balance" })
  async withdraw(@UserFromJWT() user: UserDocument, @Body() data: WithdrawDto, @Res() res: Response) {
    const { to, amount } = data;
    const { identifier, pincode, ubxtDeposit, ubxtDebt, withdrawExpiry } = user.custodialWallets;

    if (withdrawExpiry?.getTime() > new Date().getTime())
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        message: "Only one withdrawal per 24 hours is allowed",
      });

    const [eth, bsc] = await this.walletsService.findUbxtPair(identifier);
    const nonce = this.walletsService.generateNonce();

    const bscBalanceBN = new BN(bsc.token.rawBalance);

    if (bscBalanceBN.gtn(0)) {
      const fees = await this.walletsService.getGasFees(eth.wallet, bsc.wallet, ...this.GAS.withdraw);

      if (fees.totalUbxt.gt(bscBalanceBN)) throw new ForbiddenException("Esitmated withdrawal fees exceed balance");

      const { withdrawal, total, deposit } = await this.calcWithdrawalAmounts(
        eth.token.rawBalance,
        bsc.token.rawBalance,
        ubxtDeposit,
        ubxtDebt,
        amount
      );

      if (fees.totalUbxt.gtn(0)) {
        const [txEth, txBsc] = await this.walletsService.refillWallets(eth.wallet, bsc.wallet, fees);
        const [etaEth, etaBsc] = await this.walletsService.fetchConfTimes(fees);

        await this.updateUserDebt(user, fees);

        return res.status(HttpStatus.ACCEPTED).json({
          message: "Needs gas refill",
          eth: { ...txEth, eta: etaEth },
          bsc: { ...txBsc, eta: etaBsc },
        });
      }

      try {
        const signature = await this.signer.sign(bsc.wallet.address, total, nonce);
        const txWaive = await this.walletsService.waive({ ubx: bsc, pincode, amount: total, nonce, signature });
        const txWithdraw = await this.walletsService.transfer({ ubx: eth, pincode, amount: withdrawal, to });

        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);

        await this.userService.updateUserWallets(
          { custodialWallets: { ubxtDebt: "0", ubxtDeposit: deposit, withdrawExpiry: expiry } },
          user.email
        );
        return res.status(HttpStatus.OK).json({
          bsc: {
            amount: total,
            transactionHash: txWaive.transactionHash,
          },
          eth: {
            amount: withdrawal,
            transactionHash: txWithdraw.transactionHash,
          },
          fee: ubxtDebt,
        });
      } catch (e) {
        await this.updateUserDebt(user, fees, "sub");
        throw new InternalServerErrorException(`Withdraw failed: ${e}`);
      }
    }

    return res.status(HttpStatus.OK).json({
      bsc: {
        amount: "0",
      },
      eth: {
        amount: "0",
      },
    });
  }

  @Get("status")
  @ApiOperation({
    summary: "Get transaction status for given hash and chain",
  })
  async status(@Query("hash") hash: string, @Query("chain") chain: "BSC" | "ETHEREUM") {
    const status = await this.walletsService.txStatus(hash, chain);
    return {
      status,
    };
  }

  private async calcWithdrawalAmounts(
    ethUbxtBalance: string,
    bscUbxtBalance: string,
    ubxtDeposit: string,
    ubxtDebt: string,
    amount: string
  ) {
    const amountBN = new BN(amount);
    const ethBN = new BN(ethUbxtBalance);
    const bscBN = new BN(bscUbxtBalance);
    const totalBN = amountBN.add(new BN(ubxtDebt));
    const minimal = toWei(new BN(this.MINIMAL_WITHDRAWAL), "ether");

    if (amountBN.gt(bscBN)) throw new ForbiddenException("Amount exceeds balance");
    if (amountBN.gt(ethBN)) throw new ForbiddenException("Amount exceeds deposit");
    if (totalBN.gt(bscBN)) throw new ForbiddenException("Withdrawal total (amount + fee) exceeds balance");
    if (amountBN.lt(minimal)) throw new ForbiddenException(`Withdrawal must be at least ${this.MINIMAL_WITHDRAWAL} UBXT`);

    const depositBN = new BN(ubxtDeposit);

    return {
      withdrawal: amountBN.toString(),
      total: totalBN.toString(),
      deposit: depositBN.sub(amountBN).toString(),
    };
  }

  private calcClaimAmounts(ethBalance: string, ubxtDeposit: string) {
    const ethBalanceBN = new BN(ethBalance);
    const deposit = new BN(ubxtDeposit);
    const delta = ethBalanceBN.sub(deposit);

    return {
      deposit: ethBalanceBN.toString(),
      delta,
    };
  }

  private async updateUserDebt(user: UserDocument, { totalUbxt }, operation: "add" | "sub" = "add") {
    const { ubxtDebt } = user.custodialWallets;
    await this.userService.updateUserWallets(
      {
        custodialWallets: { ubxtDebt: new BN(ubxtDebt)[operation](totalUbxt).toString() },
      },
      user.email
    );
  }
}
