export interface UbxtBridgeState {
  walletConnected: any;
  metamaskAccountLink: string;
  serverInfo: UbxtBridgeServerInfo;
  ethUbxtContractAddress: string;
  bscUbxtContractAddress: string;
  eth2bscDepositAddress: string;
  bridgeWay: boolean;
  networkId: number;
}
export enum ChainID {
  CHAIN_ETH = 1,
  CHAIN_BSC = 56,
}

export const EthNetLink = `${process.env.VUE_APP_WEB3_PROVIDER_INFURA}`;
export const BscNetLink = `${process.env.VUE_APP_WEB3_BSC_RPC_ENDPOINT}`;

export interface UbxtBridgeServerInfo {
  SrcChainID?: number;
  DestChainID?: number;
  SrcToken?: {
    Decimals: number;
    DepositAddress: string;
    ContractAddress: string;
    MaximumSwap: number;
    MinimumSwap: number;
    BigValueThreshold: number;
    SwapFeeRate: number;
    MaximumSwapFee: number;
    MinimumSwapFee: number;
    PlusGasPricePercentage: number;
    DisableSwap: boolean;
    IsDelegateContract: boolean;
  };
  DestToken?: {
    Decimals: number;
    ContractAddress: string;
    MaximumSwap: number;
    MinimumSwap: number;
    BigValueThreshold: number;
    SwapFeeRate: number;
    MaximumSwapFee: number;
    MinimumSwapFee: number;
    PlusGasPricePercentage: number;
    DisableSwap: boolean;
    IsDelegateContract: boolean;
  };
}
