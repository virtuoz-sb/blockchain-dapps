/* eslint-disable import/no-named-default */
/* eslint-disable @typescript-eslint/class-name-casing */

import { default as Web3 } from "web3";

import * as abistaking from "./abi/abistaking.json";
import * as abisushipair from "./abi/abisushipair.json";
import * as abiunipair from "./abi/abiunipair.json";
import * as abiubxt from "./abi/abiubxt.json";

import * as abibscstaking from "./abi/abibscstaking.json";
import * as abicakepair from "./abi/abicakepair.json";
import * as abibscubxt from "./abi/abibscubxt.json";

export interface stakingState {
  farmAPY: number;
  lpFarmAPY: number;
  bscFarmAPY: number;
  bscLpFarmAPY: number;

  stakingAmount: any;
  botsAccess: boolean;
  switcherCurrency: string;

  walletConnected: any;
  metamaskAccountLink: string;
}

export type StakingData = {
  isWalletConnectMode: boolean;
  isMetamaskEnabled: boolean;
  ethWeb3: Web3;
  bscWeb3: Web3;
  decimals: number;
  eth: any;
  bsc: any;
};

export const EthNetLink = `https://mainnet.infura.io/v3/c8a44c9e107f440cae5a5006fc6de3d8`;
export const BscNetLink = `https://bsc-dataseed1.binance.org:443`;

export const stakingAddresses = {
  USDTETHPairAddress: `0x06da0fd433c1a5d7a4faa01111c044910a184553`,
  UBXTPairAddress: `0x18a6175fdacb6f545c9380f8fc61e7ae58fc6e36`,
  stakingAddress: `0x819250DABB939a58DCF67a0A0f09E3d9472FE6Ec`,
  mockLpAddress: `0x6a928D733606943559556F7eb22057C1964ce56a`,
  contractAddress: `0x7A73839bd0e5cdED853cB01aa9773F8989381065`,
  stakingAbi: abistaking,
  pairAbi: abisushipair,
  mockLpAbi: abiunipair,
  erc20Abi: abiubxt,

  bscUSDTETHPairAddress: `0x06da0fd433c1a5d7a4faa01111c044910a184553`,
  bscUBXTPairAddress: `0x4e45b9e29700d019821129a76f6e6b9f6a326f77`,
  bscStakingAddress: `0x3B2d7ea96818E0eD8544146D93B245980A227334`,
  bscMockLpAddress: `0x8D3FF27D2aD6a9556B7C4F82F4d602D20114bC90`,
  bscContractAddress: `0xc822bb8f72c212f0f9477ab064f3bdf116c193e6`,
  bscStakingAbi: abibscstaking,
  bscPairAbi: abicakepair,
  bscMockLpAbi: abicakepair,
  bscErc20Abi: abibscubxt,
};
