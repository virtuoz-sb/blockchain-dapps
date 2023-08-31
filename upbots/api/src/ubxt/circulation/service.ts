/* eslint @typescript-eslint/no-var-requires: "off" */
/* eslint @typescript-eslint/no-use-before-define: "off" */
/* eslint @typescript-eslint/class-name-casing: "off" */
/* eslint-disable prefer-destructuring */
/* eslint-disable operator-assignment */
/* eslint-disable no-restricted-properties */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-named-default */

import * as UbxtAbi from "./contracts/ubxt-abi.json";
import * as BusdAbi from "./contracts/busd-abi.json";
import * as CakePairAbi from "./contracts/abicakepair.json";
import * as UbxnStakingAbi from "./contracts/abi-eth-bsc-ubxn-staking.json";

const Web3 = require("web3");

export const EthNetLink = `https://mainnet.infura.io/v3/c8a44c9e107f440cae5a5006fc6de3d8`;
export const BscNetLink = `https://bsc-dataseed1.binance.org:443`;

const ubxnInfo = {
  eth: {
    token: "0x7A73839bd0e5cdED853cB01aa9773F8989381065",
    lp: "0x18a6175fdacb6f545c9380f8fc61e7ae58fc6e36",
    staking: "0x819250DABB939a58DCF67a0A0f09E3d9472FE6Ec",
    lpstaking: "0x2A45eA0Cf9504c2C745d0aF9961dD57fEBcee1e1",
  },
  bsc: {
    token: "0xc822bb8f72c212f0f9477ab064f3bdf116c193e6",
    lp: "0x4e45b9e29700d019821129a76f6e6b9f6a326f77",
    staking: "0x3B2d7ea96818E0eD8544146D93B245980A227334",
    lpstaking: "0xd80F8ecB7df207b64D09097291F35a5F4910d3E9",
  },
};

/// /////////////////////////////////////////////////
const calculateCirculation = async (web3, ubxnInfo1, isEth) => {
  const deadAddress = "0x000000000000000000000000000000000000dEaD";
  const contractToken = new web3.eth.Contract(BusdAbi as any, ubxnInfo1.token);
  const contractPair = new web3.eth.Contract(CakePairAbi as any, ubxnInfo1.lp);
  const contractStaking = new web3.eth.Contract(UbxnStakingAbi as any, ubxnInfo1.staking);
  // const contractLpStaking = new web3.eth.Contract(LpStakingAbi as any, ubxnInfo1.lpstaking);

  // supply
  const supply = (await contractToken.methods.totalSupply().call()) / Math.pow(10, 18);

  // circulation
  const reserve = (await contractToken.methods.balanceOf(ubxnInfo1.lp).call()) / Math.pow(10, 18);
  const totalSupply = (await contractToken.methods.totalSupply().call()) / Math.pow(10, 18);
  const circulation = totalSupply - reserve;

  // ubxn price
  const getReserves = await contractPair.methods.getReserves().call();
  const ubxnPrice = ((isEth ? 1e12 : 1) * getReserves._reserve1) / getReserves._reserve0;

  // market cap
  const marketCap = circulation * ubxnPrice;

  // burned amount
  const burnedAmount = (await contractToken.methods.balanceOf(deadAddress).call()) / Math.pow(10, 18);

  // staked amount
  const ubxnStaked = (await contractStaking.methods.totalDeposited().call()) / Math.pow(10, 18);
  const lpStaked = (await contractPair.methods.balanceOf(ubxnInfo1.lpstaking).call()) / Math.pow(10, 18);
  const stakedAmount = ubxnStaked + lpStaked;

  return {
    supply,
    available: circulation,
    marketCap,
    burnedAmount,
    stakedAmount,
    ubxnPrice,
  };
};

export const getCirculation = async () => {
  const ethWeb3 = new Web3(EthNetLink);
  const bscWeb3 = new Web3(BscNetLink);
  const circulationEth = await calculateCirculation(ethWeb3, ubxnInfo.eth, true);
  const circulationBsc = await calculateCirculation(bscWeb3, ubxnInfo.bsc, false);

  return {
    supply: circulationBsc.supply + circulationEth.supply,
    available: circulationBsc.available + circulationEth.available,
    marketCap: circulationBsc.marketCap + circulationEth.marketCap,
    burnedAmount: circulationBsc.burnedAmount + circulationEth.burnedAmount,
    stakedAmount: circulationBsc.stakedAmount + circulationEth.stakedAmount,
    ubxnPrice: circulationEth.ubxnPrice,
  };
};

export const getUbxnPrice = async () => {
  const ethWeb3 = new Web3(EthNetLink);
  const contractPair = new ethWeb3.eth.Contract(CakePairAbi as any, ubxnInfo.eth.lp);

  // ubxn price
  const getReserves = await contractPair.methods.getReserves().call();
  const ubxnPrice = (1e12 * getReserves._reserve1) / getReserves._reserve0;

  return ubxnPrice;
};

/// /////////////////////////////////////////////////
