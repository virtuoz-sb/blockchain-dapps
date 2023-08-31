import { default as Web3 } from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
import { StakingData, stakingAddresses as stAddresses, EthNetLink, BscNetLink } from "./types";

export const stakingData: StakingData = {
  isWalletConnectMode: true,
  isMetamaskEnabled: true,
  ethWeb3: null,
  bscWeb3: null,
  decimals: 18,
  eth: {
    finalPriceUbxt: 0,
    lpStakedTotal: 0,
    tokenPerBlock: 0,
    totalAllocPoint: 0,
    ubxtBalance: 0,
    ubxtStaked: 0,
    totalUbxt: 0,
    balance: 0,
    totalLp: 0,
    farmAPY: 0,
    lpFarmAPY: 0,
  },
  bsc: {
    finalPriceUbxt: 0,
    lpStakedTotal: 0,
    tokenPerBlock: 0,
    totalAllocPoint: 0,
    ubxtBalance: 0,
    ubxtStaked: 0,
    totalUbxt: 0,
    balance: 0,
    totalLp: 0,
    farmAPY: 0,
    lpFarmAPY: 0,
  },
};

export const getStakingData = () => {
  return stakingData;
};

export const calcStakingData = async () => {
  if (stakingData.ethWeb3 === null || stakingData.bscWeb3 === null) {
    stakingData.ethWeb3 = new Web3(EthNetLink);
    stakingData.bscWeb3 = new Web3(BscNetLink);
  }
  await getTotalValueLocked();
  await getFarmAPY();

  await getBSCTotalValueLocked();
  await getBSCFarmAPY();
};

// ethereum network related functions
export const getTotalValueLocked = async () => {
  await getPriceUBXT();
  await getTotalUbxtStaked();
  await getTotalUniLpStaked();
  stakingData.eth.balance = stakingData.eth.totalUbxt + stakingData.eth.totalLp;
};

export const getFarmAPY = async () => {
  await getTokenPerBlock();
  const blockPerYear = 6560 * 365;
  let poolInfo;
  let poolAllocPoint;
  let tokenPerBlock;
  const contract = new stakingData.ethWeb3.eth.Contract(stAddresses.stakingAbi, stAddresses.stakingAddress);
  poolInfo = await contract.methods.poolInfo(0).call();
  if (poolInfo) {
    poolAllocPoint = poolInfo[1];
  }
  tokenPerBlock = (stakingData.eth.tokenPerBlock * poolAllocPoint) / stakingData.eth.totalAllocPoint;
  const ubxtPrice = stakingData.eth.finalPriceUbxt;
  const lpPrice = 29;
  const apy = !stakingData.eth.ubxtStaked
    ? 0
    : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (stakingData.eth.ubxtStaked * ubxtPrice)) * 100;
  stakingData.eth.farmAPY = apy;
  poolInfo = await contract.methods.poolInfo(1).call();
  if (poolInfo) {
    poolAllocPoint = poolInfo[1];
  }
  tokenPerBlock = (stakingData.eth.tokenPerBlock * poolAllocPoint) / stakingData.eth.totalAllocPoint;
  const lpApy = !stakingData.eth.lpStakedTotal
    ? 0
    : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (stakingData.eth.lpStakedTotal * lpPrice)) * 100;
  stakingData.eth.lpFarmAPY = lpApy;
};

export const getERC20Balance = async (accountAddress: string) => {
  const contract = new stakingData.ethWeb3.eth.Contract(stAddresses.erc20Abi, stAddresses.contractAddress);
  stakingData.eth.ubxtBalance = await contract.methods.balanceOf(accountAddress).call();
  stakingData.eth.ubxtBalance = stakingData.eth.ubxtBalance / Math.pow(10, stakingData.decimals);
};

export const getPriceUBXT = async () => {
  const ubxtEthContract = new stakingData.ethWeb3.eth.Contract(stAddresses.pairAbi, stAddresses.UBXTPairAddress);
  let data = await ubxtEthContract.methods.getReserves().call();
  const ubxtEthPrice = data._reserve0 / data._reserve1;
  const usdtEthContract = new stakingData.ethWeb3.eth.Contract(stAddresses.pairAbi, stAddresses.USDTETHPairAddress);
  data = await usdtEthContract.methods.getReserves().call();
  const usdtEthPrice = data._reserve0 / data._reserve1 / Math.pow(10, 12);
  stakingData.eth.finalPriceUbxt = 1 / (ubxtEthPrice * usdtEthPrice);
};

export const getTotalUbxtStaked = async () => {
  const contract = new stakingData.ethWeb3.eth.Contract(stAddresses.stakingAbi, stAddresses.stakingAddress);
  stakingData.eth.ubxtStaked = await contract.methods.totalStakedUBXT().call();
  stakingData.eth.ubxtStaked = stakingData.eth.ubxtStaked / Math.pow(10, stakingData.decimals);
  stakingData.eth.totalUbxt = stakingData.eth.finalPriceUbxt * stakingData.eth.ubxtStaked;
};

export const getTotalUniLpStaked = async () => {
  const contract = new stakingData.ethWeb3.eth.Contract(stAddresses.mockLpAbi, stAddresses.mockLpAddress);
  stakingData.eth.lpStakedTotal = await contract.methods.balanceOf(stAddresses.stakingAddress).call();
  stakingData.eth.lpStakedTotal = stakingData.eth.lpStakedTotal / Math.pow(10, stakingData.decimals);
  const lpPrice = 29;
  stakingData.eth.totalLp = lpPrice * stakingData.eth.lpStakedTotal;
};

export const getTokenPerBlock = async () => {
  const contract = new stakingData.ethWeb3.eth.Contract(stAddresses.stakingAbi, stAddresses.stakingAddress);
  stakingData.eth.totalAllocPoint = await contract.methods.totalAllocPoint().call();
  stakingData.eth.tokenPerBlock = await contract.methods.tokenPerBlock().call();
  stakingData.eth.tokenPerBlock = stakingData.eth.tokenPerBlock / Math.pow(10, stakingData.decimals);
};

// binance smart chain network related functions
export const getBSCTotalValueLocked = async () => {
  await getBSCPriceUBXT();
  await getBSCTotalUbxtStaked();
  await getBSCTotalPancakeLpStaked();
  stakingData.bsc.balance = stakingData.bsc.totalUbxt + stakingData.bsc.totalLp;
};

export const getBSCFarmAPY = async () => {
  await getBSCTokenPerBlock();
  const blockPerYear = 20 * 60 * 24 * 365;
  let poolInfo;
  let poolAllocPoint;
  let tokenPerBlock;
  const contract = new stakingData.bscWeb3.eth.Contract(stAddresses.bscStakingAbi, stAddresses.bscStakingAddress);
  poolInfo = await contract.methods.poolInfo(0).call();
  if (poolInfo) {
    poolAllocPoint = poolInfo[1];
  }
  tokenPerBlock = (stakingData.bsc.tokenPerBlock * poolAllocPoint) / stakingData.bsc.totalAllocPoint;
  const ubxtPrice = stakingData.bsc.finalPriceUbxt;
  const lpPrice = 0.52;
  const apy = !stakingData.bsc.ubxtStaked
    ? 0
    : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (stakingData.bsc.ubxtStaked * ubxtPrice)) * 100;
  stakingData.bsc.farmAPY = apy;
  poolInfo = await contract.methods.poolInfo(2).call();
  if (poolInfo) {
    poolAllocPoint = poolInfo[1];
  }
  tokenPerBlock = (stakingData.bsc.tokenPerBlock * poolAllocPoint) / stakingData.bsc.totalAllocPoint;
  const lpApy = !stakingData.bsc.lpStakedTotal
    ? 0
    : ((tokenPerBlock * blockPerYear * ubxtPrice * 1.0) / (stakingData.bsc.lpStakedTotal * lpPrice)) * 100;
  stakingData.bsc.lpFarmAPY = lpApy;
};

export const getBSCERC20Balance = async (accountAddress: string) => {
  const contract = new stakingData.bscWeb3.eth.Contract(stAddresses.bscErc20Abi, stAddresses.bscContractAddress);
  stakingData.bsc.ubxtBalance = await contract.methods.balanceOf(accountAddress).call();
  stakingData.bsc.ubxtBalance = stakingData.bsc.ubxtBalance / Math.pow(10, stakingData.decimals);
};

export const getBSCPriceUBXT = async () => {
  const bscUbxtBusdContract = new stakingData.bscWeb3.eth.Contract(stAddresses.bscPairAbi, stAddresses.bscUBXTPairAddress);
  let data = await bscUbxtBusdContract.methods.getReserves().call();
  const ubxtBusdPrice = data._reserve0 / data._reserve1;
  stakingData.bsc.finalPriceUbxt = 1 / ubxtBusdPrice;
};

export const getBSCTotalUbxtStaked = async () => {
  const contract = new stakingData.bscWeb3.eth.Contract(stAddresses.bscStakingAbi, stAddresses.bscStakingAddress);
  stakingData.bsc.ubxtStaked = await contract.methods.totalStakedUBXT().call();
  stakingData.bsc.ubxtStaked = stakingData.bsc.ubxtStaked / Math.pow(10, stakingData.decimals);
  stakingData.bsc.totalUbxt = stakingData.bsc.finalPriceUbxt * stakingData.bsc.ubxtStaked;
};

export const getBSCTotalPancakeLpStaked = async () => {
  const contract = new stakingData.bscWeb3.eth.Contract(stAddresses.bscMockLpAbi, stAddresses.bscMockLpAddress);
  stakingData.bsc.lpStakedTotal = await contract.methods.balanceOf(stAddresses.bscStakingAddress).call();
  stakingData.bsc.lpStakedTotal = stakingData.bsc.lpStakedTotal / Math.pow(10, stakingData.decimals);
  const lpPrice = 0.52;
  stakingData.bsc.totalLp = lpPrice * stakingData.bsc.lpStakedTotal;
};

export const getBSCTokenPerBlock = async () => {
  const contract = new stakingData.bscWeb3.eth.Contract(stAddresses.bscStakingAbi, stAddresses.bscStakingAddress);
  stakingData.bsc.totalAllocPoint = await contract.methods.totalAllocPoint().call();
  stakingData.bsc.tokenPerBlock = await contract.methods.tokenPerBlock().call();
  stakingData.bsc.tokenPerBlock = stakingData.bsc.tokenPerBlock / Math.pow(10, stakingData.decimals);
};
