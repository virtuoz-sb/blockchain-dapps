import { default as Web3 } from "web3";

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

export const EthNetLink = `${process.env.VUE_APP_WEB3_PROVIDER_INFURA}`;
export const BscNetLink = `${process.env.VUE_APP_WEB3_BSC_RPC_ENDPOINT}`;
export const Web3ProviderInfuraID = `${process.env.VUE_APP_WEB3_PROVIDER_INFURA_ID}`;

export const stakingAddresses = {
  USDTETHPairAddress: `${process.env.VUE_APP_ETH_USDT_PAIR_ADDRESS}`,
  UBXTPairAddress: `${process.env.VUE_APP_UBXT_PAIR_ADDRESS}`,
  stakingAddress: `${process.env.VUE_APP_STAKING_ADDRESS}`,
  mockLpAddress: `${process.env.VUE_APP_LP_ADDRESS}`,
  contractAddress: `${process.env.VUE_APP_UBXT_ADDRESS}`,
  stakingAbi: require("@/assets/contract/abistaking.json"),
  pairAbi: require("@/assets/contract/abisushipair.json"),
  mockLpAbi: require("@/assets/contract/abiunipair.json"),
  erc20Abi: require("@/assets/contract/abiubxt.json"),

  bscUSDTETHPairAddress: `${process.env.VUE_APP_ETH_USDT_PAIR_ADDRESS}`,
  bscUBXTPairAddress: `${process.env.VUE_APP_BSC_UBXT_PAIR_ADDRESS}`,
  bscStakingAddress: `${process.env.VUE_APP_BSC_STAKING_ADDRESS}`,
  bscMockLpAddress: `${process.env.VUE_APP_BSC_LP_ADDRESS}`,
  bscContractAddress: `${process.env.VUE_APP_BSC_UBXT_ADDRESS}`,
  bscStakingAbi: require("@/assets/contract/abibscstaking.json"),
  bscPairAbi: require("@/assets/contract/abicakepair.json"),
  bscMockLpAbi: require("@/assets/contract/abicakepair.json"),
  bscErc20Abi: require("@/assets/contract/abibscubxt.json"),
};
