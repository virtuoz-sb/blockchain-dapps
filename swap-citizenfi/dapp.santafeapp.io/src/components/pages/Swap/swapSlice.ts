import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';
import contracts, { net_state } from '../../../contracts';
import { famostoGraph } from '../../common/libs/data';

import defaultToken from "../../../helpers/tokenLists/famoso-default.tokenlist.json"
import { maxSupply, mnDeadline, SWAP_MODAL_TYPE, zeroAddr } from '../../common/libs/constant';


import x0_pro from "../../../assets/img/icons/providers/0x_color.svg"
import uniswap_pro from "../../../assets/img/icons/providers/uniswap_color.svg"
import sushiswap_pro from "../../../assets/img/icons/providers/sushiswap_color.svg"
import shiba_pro from "../../../assets/img/icons/providers/shiba_color.svg"
import defiswap_pro from "../../../assets/img/icons/providers/defiswap_color.svg"
import clipper_pro from "../../../assets/img/icons/providers/clipper_color.svg"
import inch_pro from "../../../assets/img/icons/providers/1inch_color.svg"
import famoso_pro from "../../../assets/img/icons/providers/famoso.png"
import balancer_pro from "../../../assets/img/icons/providers/balancer_color.svg"
import { SWAP_TYPE } from '../../../helpers';
import { truncate } from '../../common/libs/functions';
import { openNotification } from '../../../app/reducers/appSlice';
import { getFamosoPairsFromGraph } from '../../common/libs/functions/getData';

export const STATE = {
  START: 0,
  SUCC: 1,
  ERR: 2
}

let tokenObject: any = defaultToken

export const swapSlice = createSlice({
  name: 'swap',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState: {
    tokenPay: { ...tokenObject['tokens' + net_state][0], isCoin: tokenObject['tokens' + net_state][0].address === zeroAddr } as any,
    tokenBuy: { ...tokenObject['tokens' + net_state][2], isCoin: tokenObject['tokens' + net_state][2].address === zeroAddr } as any,
    famosoPairs: [] as Array<any>,
    tradeHistory: [] as Array<any>,
    payApproved: false,
    isSwap: false,
    showTx: false,
    showConfirmSwap: false,
    modalType: SWAP_MODAL_TYPE.SWAP,
    swapCount: 0,
    liquidityCount: 0
  },
  reducers: {
    setTokenPay: (state, action: PayloadAction<any>) => {
      state.tokenPay = action.payload
    },
    setSwapCount: (state, action: PayloadAction<any>) => {
      state.swapCount = state.swapCount + 1
    },
    setLiquidityCount: (state, action: PayloadAction<any>) => {
      state.liquidityCount = state.liquidityCount + 1
    },
    setModalType: (state, action: PayloadAction<SWAP_MODAL_TYPE>) => {
      state.modalType = action.payload
    },
    setTokenBuy: (state, action: PayloadAction<any>) => {
      state.tokenBuy = action.payload
    },
    setFamosoPairs: (state, action: PayloadAction<Array<any>>) => {
      state.famosoPairs = action.payload
    },
    setTradeHistory: (state, action: PayloadAction<Array<any>>) => {
      state.tradeHistory = action.payload
    },
    addTradeHistory: (state, action: PayloadAction<any>) => {
      state.tradeHistory = [...state.tradeHistory, action.payload]
    },
    setPayApproved: (state, action: PayloadAction<boolean>) => {
      state.payApproved = action.payload
    },
    setIsSwap: (state, action: PayloadAction<boolean>) => {
      state.isSwap = action.payload
    },
    setShowTx: (state, action: PayloadAction<boolean>) => {
      state.showTx = action.payload
    },
    setShowConfirmSwap: (state, action: PayloadAction<boolean>) => {
      state.showConfirmSwap = action.payload
    },
  },
})


export const { setTokenPay, setTokenBuy, setModalType, setSwapCount, setLiquidityCount } = swapSlice.actions
export const { setFamosoPairs, addTradeHistory, setTradeHistory } = swapSlice.actions
export const { setPayApproved, setIsSwap, setShowTx, setShowConfirmSwap } = swapSlice.actions
// Other code such as selectors can use the imported `RootState` type

export default swapSlice.reducer

export const getFamosoPairs = (connectedNetwork: number) => {
  return function (dispatch: Dispatch<any>) {
    return getFamosoPairsFromGraph(connectedNetwork)
      .then((result) => {
        console.log("get created famoso pairs", result)
        return dispatch(setFamosoPairs(result || []))
      })
      .catch((err: any) => {

      })
  }
}



export const getTradeData = () => {
  return function (dispatch: Dispatch<any>) {
    dispatch(setTradeHistory([]))
    const query = {
      query: `     
        query swaps($limit: Int!, $field: String!, $order: String!) {
          swaps(first: $limit, orderBy: $field, orderDirection: $order) {
            id
            sender
            from
            to
            amount0In
            amount1In
            amount0Out
            amount1Out
            timestamp
            pair{
              token0{
                id
                symbol
              }
              token1{
                id
                symbol
              }
            }
          }
        }          
      `,
      variables: {
        limit: 20,
        field: 'timestamp',
        order: 'desc'
      },
    }
    return fetch('https://api.thegraph.com/subgraphs/name/jeydev310/famoso-dex', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query),
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("get swap history from subgraph", result.data.swaps)
        return result.data.swaps.map((item: any) => {
          return item.amount1Out > 0 ?
            dispatch(addTradeHistory({
              id: item.id,
              account: item.from,
              pay: item.pair.token0,
              buy: item.pair.token1,
              payAmount: Number(item.amount0In) / (10 ** 18),
              buyAmount: Number(item.amount1Out) / (10 ** 18),
              timestamp: item.timestamp,
              price: item.amount0In / item.amount1Out
            }))
            :
            dispatch(addTradeHistory({
              account: item.from,
              id: item.id,
              pay: item.pair.token1,
              buy: item.pair.token0,
              payAmount: Number(item.amount1In) / (10 ** 18),
              buyAmount: Number(item.amount0Out) / (10 ** 18),
              timestamp: item.timestamp,
              price: item.amount1In / item.amount0Out
            }))
        })
      })
      .catch((err: any) => {

      })
  }
}


export const checkPayApproved = (tokenAddress: any, owner: any, spender: any) => {
  return function (dispatch: Dispatch<any>) {
    if (tokenAddress === zeroAddr)
      return dispatch(setPayApproved(true))
    else {
      const tokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, tokenAddress)
      return tokenContract.methods.allowance(owner, spender)
        .call()
        .then((res: any) => {
          const isApproved: boolean = Number(res) >= maxSupply
          return dispatch(setPayApproved(isApproved))
        })
    }
  }
}

export const endSwap = (txRes: any, title: any) => {
  return function (dispatch: Dispatch<any>) {
    dispatch(setIsSwap(false))
    console.log("Swap Ended", txRes)
    dispatch(setShowConfirmSwap(false))
    dispatch(setSwapCount(true))
    return dispatch(openNotification(txRes, title))
  }
}

export const executeSwap = (payAmount: any, receiveAmount: any, swapRouter: any, walletAddress: any, swapType: SWAP_TYPE, title: any, famosoRouterAddress: any) => {
  return function (dispatch: Dispatch<any>) {
    let FamosoRouter: any = new window.web3.eth.Contract(contracts.abis.FamosoRouter, famosoRouterAddress);
    let payAmountVal = BigInt(String(Number(payAmount) * (10 ** 18)))
    let receiveAmountVal = BigInt(String(Number(receiveAmount) * (10 ** 18)))

    dispatch(setIsSwap(true))
    if (swapType === SWAP_TYPE.EXACT_TOKENS_FOR_TOKENS) {
      console.log("EXACT_TOKENS_FOR_TOKENS")
      console.log(payAmountVal,
        BigInt("10"),
        swapRouter,
        walletAddress,
        truncate((new Date().getTime()) / 1000 + 1000)
      )

      return FamosoRouter.methods.swapExactTokensForTokens(
        payAmountVal,
        BigInt("10"),
        swapRouter,
        walletAddress,
        mnDeadline
        // truncate((new Date().getTime())/1000 + 1000)
      )
        .send({
          from: walletAddress
        })
        .then((res: any) => {
          return dispatch(endSwap(res, title))
        })
        .catch((err: any) => {
          dispatch(setIsSwap(false))
        })
    } else if (swapType === SWAP_TYPE.TOKENS_FOR_EXACT_TOKENS) {
      console.log("TOKENS_FOR_EXACT_TOKENS")
      console.log(receiveAmountVal,
        BigInt("10"),
        swapRouter,
        walletAddress,
        truncate((new Date().getTime()) / 1000 + 1000))
      return FamosoRouter.methods.swapExactTokensForTokens(
        receiveAmountVal,
        BigInt("10"),
        swapRouter,
        walletAddress,
        mnDeadline
        // truncate((new Date().getTime())/1000 + 1000)
      )
        .send({
          from: walletAddress
        })
        .then((res: any) => {
          return dispatch(endSwap(res, title))
        })
        .catch((err: any) => {
          dispatch(setIsSwap(false))
        })
    } else if (swapType === SWAP_TYPE.EXACT_ETH_FOR_TOKENS) {
      console.log("EXACT_ETH_FOR_TOKENS")
      return FamosoRouter.methods.swapExactETHForTokens(
        BigInt("10"),
        swapRouter,
        walletAddress,
        mnDeadline
      )
        .send({
          from: walletAddress,
          value: payAmount * (10 ** 18)
        })
        .then((res: any) => {
          return dispatch(endSwap(res, title))
        })
        .catch((err: any) => {
          dispatch(setIsSwap(false))
        })
    } else if (swapType === SWAP_TYPE.TOKENS_FOR_EXACT_ETH) {
      console.log("TOKENS_FOR_EXACT_ETH")
      return FamosoRouter.methods.swapTokensForExactETH(
        receiveAmountVal,
        BigInt("10"),
        swapRouter,
        walletAddress,
        mnDeadline
      )
        .send({
          from: walletAddress
        })
        .then((res: any) => {
          return dispatch(endSwap(res, title))
        })
        .catch((err: any) => {
          dispatch(setIsSwap(false))
        })
    } else if (swapType === SWAP_TYPE.EXACT_TOKENS_FOR_ETH) {
      console.log("EXACT_TOKENS_FOR_ETH")
      return FamosoRouter.methods.swapExactTokensForETH(
        payAmountVal,
        BigInt("10"),
        swapRouter,
        walletAddress,
        mnDeadline
      )
        .send({
          from: walletAddress
        })
        .then((res: any) => {
          return dispatch(endSwap(res, title))
        })
        .catch((err: any) => {
          return dispatch(setIsSwap(false))
        })
    } else if (swapType === SWAP_TYPE.ETH_FOR_EXACT_TOKENS) {
      console.log("ETH_FOR_EXACT_TOKENS")
      return FamosoRouter.methods.swapETHForExactTokens(
        receiveAmountVal,
        swapRouter,
        walletAddress,
        mnDeadline
      )
        .send({
          from: walletAddress
        })
        .then((res: any) => {
          return dispatch(endSwap(res, title))
        })
        .catch((err: any) => {
          dispatch(setIsSwap(false))
        })
    }
  }
}


const swapsArr: any = [
  {
    icon: famoso_pro,
    label: 'Famoso',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: inch_pro,
    label: '1inch',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: uniswap_pro,
    label: 'Uniswap V3',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: sushiswap_pro,
    label: 'Sushiswap',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: shiba_pro,
    label: 'Shibaswap',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: balancer_pro,
    label: 'Balancer V2',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: defiswap_pro,
    label: 'DeFi Swap',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  },
  {
    icon: x0_pro,
    label: '0x',
    v_1: "1891.2176886924228",
    v_2: "0.000512343",
    amount: 12,
    usd: 1230034034
  }
]
