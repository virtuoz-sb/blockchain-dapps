import { useState, useEffect } from 'react';
import styles from "./Swap.module.sass"

import SearchToken from "./Liquidity/SearchToken";
import ConfirmSwap from "./ConfirmSwap"
import { getBalanceStr, isNumeric, isSameAddress, rounded, shortAddress, showError, truncate } from "../../common/libs/functions"
import { approveErc20, balanceCoin, balanceErc20 } from "../../common/libs/functions/integrate";

import { RootState } from '../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../app/hook'
import { useAppContext } from "../../common/libs/context";

import { checkPayApproved, setPayApproved, getTradeData, setTokenBuy, setTokenPay, setShowConfirmSwap, setModalType } from "./swapSlice";
import { setIsSwap } from "./swapSlice";
import { NetworkArray, wethAddr, zeroAddr } from "../../common/libs/constant";
import { SWAP_TYPE } from "../../../helpers";
import { shortestPath } from "./hooks";
import { maxSupply } from "../../common/libs/constant"
import { contractAddress } from "../../../contracts";
import PaySection from './PaySection';

import commonToken from "../../../helpers/tokenLists/famoso-common.tokenlist.json"
import ReceiveSection from './ReceiveSection';
import BigNumber from 'bignumber.js';
let tokenObject: any = commonToken

const SwapModal = () => {
  const dispatch = useAppDispatch()

  const tokenPay = useAppSelector((state: RootState) => state.swapSlice.tokenPay)
  const tokenBuy = useAppSelector((state: RootState) => state.swapSlice.tokenBuy)
  const famosoPairs = useAppSelector((state: RootState) => state.swapSlice.famosoPairs)

  const payApproved = useAppSelector((state: RootState) => state.swapSlice.payApproved)
  const isSwap = useAppSelector((state: RootState) => state.swapSlice.isSwap)
  const swapCount = useAppSelector((state: RootState) => state.swapSlice.swapCount)
  const liquidityCount = useAppSelector((state: RootState) => state.swapSlice.liquidityCount)

  const [swapType, setSwapType] = useState<any>(SWAP_TYPE.EXACT_TOKENS_FOR_TOKENS)
  const { isConnected, walletAddress, isCorrectNet, connectedNetwork } = useAppContext()
  const { contracts } = useAppContext()

  const [showSearchToken, setShowSearchToken] = useState<boolean>(false)
  const [isFirstSelect, setIsFirstSelect] = useState<boolean>(false)
  const [swapRouter, setSwapRouter] = useState<any>([])
  const showConfirmSwap = useAppSelector((state: RootState) => state.swapSlice.showConfirmSwap)

  const [payBalance, setPayBalance] = useState<any>("---")
  const [receiveBalance, setReceiveBalance] = useState<any>("---")
  const [pricePay, setPricePay] = useState<any>("---")
  const [priceReceive, setPriceReceive] = useState<any>("---")
  const [payAmount, setPayAmount] = useState<any>("")
  const [receiveAmount, setReceiveAmount] = useState<any>("")

  const [isErr, setIsErr] = useState<number>(0)
  const [errMsg, setErrMsg] = useState<any>("Insufficient balance")
  const [isOrder, setIsOrder] = useState<boolean>(true)

  const [isCoinSwap, setIsCoinSwap] = useState<boolean>(false)

  useEffect(() => {
    if (isCorrectNet && isConnected) {
      dispatch(setTokenPay({ ...tokenObject['tokens' + connectedNetwork][0], isCoin: tokenObject['tokens' + connectedNetwork][0].address === zeroAddr }))
      dispatch(setTokenBuy({ ...tokenObject['tokens' + connectedNetwork][2], isCoin: tokenObject['tokens' + connectedNetwork][2].address === zeroAddr }))
    }
  }, [walletAddress, isCorrectNet, isConnected])

  useEffect(() => {
    if (tokenPay.chainId !== NetworkArray[connectedNetwork][0].chainId_dec) return
    getExchangeBalances(tokenPay.address, true)
    console.log(tokenPay.address, walletAddress)
    dispatch(checkPayApproved(tokenPay.address, walletAddress, contractAddress[connectedNetwork].FamosoRouter))
  }, [tokenPay, swapCount, liquidityCount])

  useEffect(() => {
    if (tokenBuy.chainId !== NetworkArray[connectedNetwork][0].chainId_dec) return
    getExchangeBalances(tokenBuy.address, false)
  }, [tokenBuy, swapCount, liquidityCount])

  useEffect(() => {
    console.log("to call init()")
    console.log(tokenPay.chainId, NetworkArray[connectedNetwork][0].chainId_dec)
    if (tokenPay.chainId !== NetworkArray[connectedNetwork][0].chainId_dec) return
    setIsCoinSwap(tokenPay.isCoin || tokenBuy.isCoin)
    // dispatch(getTradeData(tokenPay.isCoin ? wethAddr : tokenPay.address, tokenBuy.isCoin ? wethAddr : tokenBuy.address))
    init()
  }, [tokenPay, tokenBuy, famosoPairs])

  useEffect(() => {
    setPayAmount("")
    setReceiveAmount("")
  }, [swapCount])

  useEffect(() => {
    if (!isOrder) return
    if (String(payAmount) === "") {
      setReceiveAmount("")
      return
    }
    if (!isNumeric(payAmount)) return
    let FamosoRouter: any = new window.web3.eth.Contract(
      contracts.abis.FamosoRouter, 
      contractAddress[connectedNetwork].FamosoRouter
    )
    if (isValidRouter(swapRouter)) {
      FamosoRouter.methods.getAmountsOut(
        BigInt(
          new BigNumber(payAmount).shiftedBy(tokenPay.decimals).toString()
        ),
        swapRouter
      )
        .call()
        .then((res: any) => {
          console.log("reserves result", res)
          if (res.length > 0) {
            let resA = new BigNumber(res[0]).shiftedBy(-Number(tokenPay.decimals))
            let resB = new BigNumber(res[res.length - 1]).shiftedBy(-Number(tokenBuy.decimals))
            setReceiveAmount(resB.toFixed(tokenBuy.decimals))

            if (resA.isGreaterThan(0)) {
              setPricePay(resB.dividedBy(resA).toFixed(18))
            } else {
              setPricePay("0")
            }
            if (resB.isGreaterThan(0)) {
              setPriceReceive(resA.dividedBy(resB).toFixed(18))
            } else {
              setPriceReceive("0")
            }
          }
        })
    }
  }, [payAmount])

  useEffect(() => {
    if (isOrder) return
    if (String(receiveAmount) === "") {
      setPayAmount("")
      return
    }
    if (!isNumeric(receiveAmount)) return
    let FamosoRouter: any = new window.web3.eth.Contract(
      contracts.abis.FamosoRouter, 
      contractAddress[connectedNetwork].FamosoRouter
    )
    if (isValidRouter(swapRouter)) {
      FamosoRouter.methods.getAmountsIn(
        BigInt(
          new BigNumber(receiveAmount).shiftedBy(tokenBuy.decimals).toString()
        ),
        swapRouter
      )
        .call()
        .then((res: any) => {
          console.log("reserves result", res)
          if (res.length > 0) {
            let resA = new BigNumber(res[0]).shiftedBy(tokenBuy.decimals)
            let resB = new BigNumber(res[res.length - 1]).shiftedBy(tokenPay.decimals)
            setPayAmount(resA.toFixed(tokenPay.decimals))

            if (resA.isGreaterThan(payBalance)) {
              setIsErr(1)
            } else {
              setIsErr(0)
            }
            if (resA.isGreaterThan(0)) {
              setPricePay(resB.dividedBy(resA).toFixed(18))
            } else {
              setPricePay("0")
            }
            if (resB.isGreaterThan(0)) {
              setPriceReceive(resA.dividedBy(resB).toFixed(18))
            } else {
              setPriceReceive("0")
            }
          }
        })
    }
  }, [receiveAmount])

  function init() {
    console.log("swap init call")
    const swapPath: Array<string> = !isCoinSwap ? shortestPath(famosoPairs, tokenPay.address, tokenBuy.address)
      : tokenPay.isCoin ? shortestPath(famosoPairs, wethAddr[connectedNetwork], tokenBuy.address)
        : shortestPath(famosoPairs, tokenPay.address, wethAddr[connectedNetwork])
    console.log("token Pair", tokenPay, tokenBuy)
    console.log("famosoPairs", famosoPairs)
    console.log("swapPath", swapPath)
    setSwapRouter(swapPath)
  }



  const validInput = () => {
    if (!isNumeric(payAmount) || !isNumeric(receiveAmount)) return showError("Please input correct amount")
    return true
  }

  const clickSwap = () => {
    if (isSwap) return
    if (!validInput()) return
    if (!payApproved) return
    return swap()
  }

  const approveTokenPay = () => {
    if (isSwap) return
    if (!validInput()) return
    if (tokenPay.isCoin) return
    return approveErc20(tokenPay.address, contractAddress[connectedNetwork].FamosoRouter, walletAddress)
      .then((approveRes: any) => {
        if (!approveRes.events.Approval.returnValues.value) return dispatch(setPayApproved(false))
        else return dispatch(setPayApproved(Number(approveRes.events.Approval.returnValues.value) >= maxSupply))
      }).catch((e: any) => {
        console.log(e)
      });
  }

  const isValidRouter = (path: Array<string>) => {
    if (path.length < 2) return false
    let start_addr: any = tokenPay.isCoin ? wethAddr[connectedNetwork] : tokenPay.address
    let end_addr: any = tokenBuy.isCoin ? wethAddr[connectedNetwork] : tokenBuy.address
    console.log("isValidRouter", start_addr, end_addr, path)
    return isSameAddress(start_addr, path[0]) && isSameAddress(end_addr, path[path.length - 1])
  }

  const swap = () => {
    if (isErr > 0) return
    if (!isValidRouter(swapRouter)) return
    return dispatch(setShowConfirmSwap(true))
  }

  const getExchangeBalances = (address: any, pay: boolean) => {
    if (address !== zeroAddr)
      return balanceErc20(address, walletAddress)
        .then((payBalRes: any) => {
          pay === true ?
            setPayBalance(getBalanceStr(payBalRes, Number(tokenPay.decimals)))
            : setReceiveBalance(getBalanceStr(payBalRes, Number(tokenBuy.decimals)))
        })
    else
      return balanceCoin(walletAddress)
        .then((payBalRes: any) => {
          pay === true ?
            setPayBalance(getBalanceStr(payBalRes, Number(tokenPay.decimals)))
            : setReceiveBalance(getBalanceStr(payBalRes, Number(tokenBuy.decimals)))
        })
  }

  /** ENTER AMOUNT METHODS */
  const enterPayAmount = (str: any) => {
    /** Need to add <NUMBER VALIDATION> !!!!!!!!!!! */
    setIsOrder(true)
    setPayAmount(str)
    if (Number(str) > Number(payBalance)) {
      setIsErr(1)
    } else {
      setIsErr(0)
    }

    if (Number(str) === 0) {
      setReceiveAmount("0");
    }
    if (tokenBuy.isCoin) {
      setSwapType(SWAP_TYPE.EXACT_TOKENS_FOR_ETH)
    } else if (tokenPay.isCoin) {
      setSwapType(SWAP_TYPE.EXACT_ETH_FOR_TOKENS)
    } else {
      setSwapType(SWAP_TYPE.EXACT_TOKENS_FOR_TOKENS)
    }
  }

  const enterReceiveAmount = (str: any) => {
    /** Need to add <NUMBER VALIDATION> !!!!!!!!!!! */
    setIsOrder(false)
    setReceiveAmount(str)
    if (str === "") {
      setPayAmount("")
    } else if (Number(str) === 0) {
      setPayAmount("0")
      // setPayAmount(rounded(Number(priceReceive) * Number(str), 18))
    }

    if (tokenPay.isCoin) {
      setSwapType(SWAP_TYPE.ETH_FOR_EXACT_TOKENS)
    } else if (tokenBuy.isCoin) {
      setSwapType(SWAP_TYPE.TOKENS_FOR_EXACT_ETH)
    } else {
      setSwapType(SWAP_TYPE.TOKENS_FOR_EXACT_TOKENS)
    }
  }

  const clickMaxPay = () => {
    enterPayAmount(payBalance)
  }


  const hideConfirmSwap = () => {
    dispatch(setShowConfirmSwap(false))
    dispatch(setIsSwap(false))
  }


  /** TOKEN SELECT AND RESERVE METHODS */
  const reverseExchange = () => {
    const tmp: number = tokenPay
    dispatch(setTokenPay(tokenBuy))
    dispatch(setTokenBuy(tmp))

    const tmpAmount: any = payAmount
    setPayAmount(receiveAmount)
    setReceiveAmount(tmpAmount)
  }
  const tokenSelected = (token: any) => {
    if (isFirstSelect === true) {
      if (tokenBuy !== null) {
        if (isSameAddress(token.address, tokenBuy.address)) {
          reverseExchange()
          return;
        }
      }
      dispatch(setTokenPay(token))
    } else {
      if (tokenPay !== null) {
        if (isSameAddress(token.address, tokenPay.address)) {
          reverseExchange()
          return;
        }
      }
      dispatch(setTokenBuy(token))
    }
  }
  const clickTokenSelect = (first: boolean) => {
    setIsFirstSelect(first)
    setShowSearchToken(true)
  }

  return (<>
    {/** 1. PAY SECTION */}
    <PaySection
      tokenPay={tokenPay}
      isOrder={isOrder}
      clickMaxPay={clickMaxPay}
      payBalance={payBalance}
      payAmount={payAmount}
      enterPayAmount={enterPayAmount}
      clickTokenSelect={clickTokenSelect}
    />

    {/** 2. REVERSE SECTION */}
    <div
      className="text-center flex mt-2"
      onClick={() => reverseExchange()}
    >
      <i className="icofont-arrow-down text-3xl pointer hover-rot"></i>
    </div>

    {/** 3. RECEIVE SECTION */}
    <ReceiveSection
      tokenBuy={tokenBuy}
      isOrder={isOrder}
      receiveBalance={receiveBalance}
      receiveAmount={receiveAmount}
      clickTokenSelect={clickTokenSelect}
      enterReceiveAmount={enterReceiveAmount}
    />

    {/** 4. APPROVING SECTION */}
    <div
      hidden={payApproved}
      onClick={() => approveTokenPay()}
      className={
        "flex text-center btn-hover back-blue1 p-2 my-2 rounded-m pointer " 
        + ((isErr === 0) && !isSwap ? "c-white" : "fc-dark disabled")
      }
    >
      <span className="m-auto-v" >Approve {tokenPay.symbol}</span>
    </div>
    <div
      hidden={(isErr > 0)}
      onClick={() => !isSwap ? clickSwap() : {}}
      className={
        "flex text-center btn-back-gradient-reverse btn-hover p-2 my-1 rounded-m pointer "
        + ((isErr === 0) && !isSwap ? "c-white" : "fc-dark disabled")
      }
    >
      <span hidden={isSwap} className="m-auto-v">Swap</span>
      <div hidden={!isSwap} className={styles.ldsEllipsis}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <div
      hidden={isErr === 0}
      className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-white"
    >
      <span className="m-auto-v">
        {errMsg}
      </span>
    </div>
    <div
      className="flex-col border-dark p-3 rounded-m my-3"
      hidden={
        (Number(payAmount) < 10 ** (-18)) || (Number(receiveAmount) < 10 ** (-18))
      }
    >
      <div className="flex">
        <span className=" c-white left">
          1 {tokenPay.symbol} cost
        </span>
        <div className="fc-dark right">
          <div>
            <span className=" c-white">{pricePay} </span>
            <span className="fc-dark">{tokenBuy.symbol}</span>
          </div>
        </div>
      </div>
      <div className="flex">
        <span className=" c-white left">
          1 {tokenBuy.symbol} cost
        </span>
        <div className="fc-dark right">
          <div>
            <span className=" c-white">{priceReceive}</span>
            <span className="fc-dark"> {tokenPay.symbol}</span>
          </div>
        </div>
      </div>
      {/* <div className="flex">
        <span className=" c-white left">
          Transaction cost
        </span>
        <div className="fc-dark right">
          <div>
            <span className=" c-white">≈ ---</span>
          </div>
        </div>
      </div> */}
    </div>

    {/** LAST. MODAL SECTION */}
    <SearchToken
      isModalOpen={showSearchToken}
      onHide={() => setShowSearchToken(false)}
      tokenSelected={tokenSelected}
      tokenA={tokenPay}
      tokenB={tokenBuy}
      isSwap={true}
    />
    <ConfirmSwap
      isModalOpen={showConfirmSwap}
      onHide={() => hideConfirmSwap()}
      payAmount={payAmount}
      receiveAmount={receiveAmount}
      swapRouter={swapRouter}
      walletAddress={walletAddress}
      swapType={swapType}
    />

  </>);
}

export default SwapModal;