import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../../common/libs/context";

import { approveErc20, balanceCoin, balanceErc20, decimalsErc20 } from "../../../../common/libs/functions/integrate";

import Icon from "../../../../parts/Icon";
import { isNumeric, isSameAddress, rounded, showError, truncate } from "../../../../common/libs/functions";
import { bestGas, bestGasPrice, chkApproveAmount, maxApproveAmount, maxSupply, mnDeadline, NetworkArray, wethAddr, zeroAddr } from "../../../../common/libs/constant";
// import useTransactionDeadline from "../../../../hooks/useTransactionDeadline";
import RemoveLiquidity from "../RemoveLiquidity"
import SearchToken from "../SearchToken";

import styles from "./AddLiquidity.module.sass"
import cn from "classnames"

import { RootState } from '../../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../../app/hook'
import { checkApproved, setApprovedA, setApprovedB, setTokenA, setTokenB } from "./addLiquiditySlice";
import contractData, { contractAddress } from "../../../../../contracts";
import commonToken from "../../../../../helpers/tokenLists/famoso-common.tokenlist.json"
import ConfirmSupply from "./ConfirmSupply";
import { openNotification } from "../../../../../app/reducers/appSlice";
import BigNumber from "bignumber.js";
let tokenObject: any = commonToken

function AddLiquidity() {
  const dispatch = useAppDispatch()


  const tokenA = useAppSelector((state: RootState) => state.addLiquiditySlice.tokenA)
  const tokenB = useAppSelector((state: RootState) => state.addLiquiditySlice.tokenB)
  const approvedA = useAppSelector((state: RootState) => state.addLiquiditySlice.approvedA)
  const approvedB = useAppSelector((state: RootState) => state.addLiquiditySlice.approvedB)

  const swapCount = useAppSelector((state: RootState) => state.swapSlice.swapCount)
  const liquidityCount = useAppSelector((state: RootState) => state.swapSlice.liquidityCount)

  const [showRemoveLp, setShowRemoveLp] = useState<boolean>(false)

  const [totalSupply, setTotalSupply] = useState<BigNumber>(new BigNumber(0))
  const [myShare, setMyShare] = useState<BigNumber>(new BigNumber(0))
  const [lpAmount, setLpAmount] = useState<BigNumber>(new BigNumber(0))
  const [lpPercent, setLpPercent] = useState<number>(0)


  const [firstBalance, setPayBalance] = useState<BigNumber>(new BigNumber(0))
  const [secondBalance, setReceiveBalance] = useState<BigNumber>(new BigNumber(0))

  const [reserveFirst, setReserveFirst] = useState<BigNumber>(new BigNumber(0))
  const [reserveSecond, setReserveSecond] = useState<BigNumber>(new BigNumber(0))

  const [firstAmount, setFirstAmount] = useState<any>("")
  const [secondAmount, setSecondAmount] = useState<any>("")

  const [reserve0, setReserve0] = useState<BigNumber>(new BigNumber(0))
  const [reserve1, setReserve1] = useState<BigNumber>(new BigNumber(0))

  const [priceFirst, setPriceFirst] = useState<BigNumber>(new BigNumber(0))
  const [priceSecond, setPriceSecond] = useState<BigNumber>(new BigNumber(0))

  const [isErr, setIsErr] = useState<number>(1)
  const [errMsg, setErrMsg] = useState<any>("Enter an amount")

  const { isConnected, walletAddress, isCorrectNet, connectedNetwork } = useAppContext()
  const { contracts } = useAppContext()

  const [currentPairAddress, setCurrentPairAddress] = useState(null);
  const [blocked, setBlocked] = useState<boolean>(true)

  const [showSearchToken, setShowSearchToken] = useState<boolean>(false)
  const [isFirstToken, setIsFirstToken] = useState<boolean>(false)

  const [doingSupply, setDoingSupply] = useState<boolean>(false)

  const blockErr = "Your wallet address is blocked on Famoso"

  // useEffect(() => {

  // }, [])
  useEffect(() => {
    if (isCorrectNet && isConnected) {
      dispatch(setTokenA({ ...tokenObject['tokens' + connectedNetwork][0], isCoin: tokenObject['tokens' + connectedNetwork][0].address === zeroAddr }))
      dispatch(setTokenB({ ...tokenObject['tokens' + connectedNetwork][2], isCoin: tokenObject['tokens' + connectedNetwork][2].address === zeroAddr }))
    }
  }, [walletAddress, isCorrectNet, isConnected])

  useEffect(() => {
    // if (tokenA.chainId !== NetworkArray[connectedNetwork][0].chainId_dec) return
    // console.log("here is liquidity", connectedNetwork, tokenA, tokenB, tokenObject['tokens' + connectedNetwork][0], tokenObject['tokens' + connectedNetwork][2])

    if (window.web3 && window.web3.eth) {
      getBaseData()
      if (tokenA) {
        dispatch(checkApproved(tokenA.address, true, walletAddress, contractAddress[connectedNetwork].FamosoRouter))
      }
      if (tokenB) {
        dispatch(checkApproved(tokenB.address, false, walletAddress, contractAddress[connectedNetwork].FamosoRouter))
      }
      if (tokenA && tokenB) {
        if (firstAmount === "" || secondAmount === "") {
          setIsErr(1)
          setErrMsg("Enter an amount")
        }
      }
    }
  }, [tokenA, tokenB, liquidityCount, swapCount])

  useEffect(() => {
    if (tokenA && tokenB) {
      calcGetLP();
    }
  }, [totalSupply, firstAmount, secondAmount]);
  const calcGetLP = () => {
    if (firstAmount === "" || secondAmount === "") {
      setLpAmount(new BigNumber(0));
      setLpPercent(0);
      return;
    }
    if (totalSupply.isZero()) {
      setLpAmount(new BigNumber(firstAmount).multipliedBy(secondAmount).sqrt())
      setLpPercent(100)
      return
    }

    let reserve_A: BigNumber = new BigNumber(0);
    let reserve_B: BigNumber = new BigNumber(0);
    if (Number(tokenA.address) < Number(tokenB.address)) {
      reserve_A = reserve0.shiftedBy(-Number(tokenA.decimals))
      reserve_B = reserve1.shiftedBy(-Number(tokenB.decimals))
    } else {
      reserve_A = reserve1.shiftedBy(-Number(tokenA.decimals))
      reserve_B = reserve0.shiftedBy(-Number(tokenB.decimals))
    }
    let tmp1: BigNumber = new BigNumber(0);
    let tmp2: BigNumber = new BigNumber(0);
    if (reserve_A.isGreaterThan(0)) {
      tmp1 = new BigNumber(Number(firstAmount)).multipliedBy(totalSupply).dividedBy(reserve_A)
    }
    if (reserve_B.isGreaterThan(0)) {
      tmp2 = new BigNumber(Number(secondAmount)).multipliedBy(totalSupply).dividedBy(reserve_B)
    }
    console.log("calc Get LP: ");
    console.log(`tokenA Decimals(${tokenA.decimals}), tokenB Decimals(${tokenB.decimals})`)
    console.log(`firstAmount(${firstAmount}), secondAmount(${secondAmount})`);
    console.log(`totalSupply(${totalSupply})`);
    console.log(`reserve0(${reserve0}), reserve1(${reserve1})`, reserve_A.toString(), reserve_B.toString());
    console.log(`tmp1, tmp2: `, tmp1.toString(), tmp2.toString());
    if (tmp1.isLessThan(tmp2)) {
      setLpAmount(tmp1)
      setLpPercent(tmp1.dividedBy(totalSupply.plus(tmp1)).shiftedBy(2).toNumber())
    } else {
      setLpAmount(tmp2)
      setLpPercent(tmp2.dividedBy(totalSupply.plus(tmp2)).shiftedBy(2).toNumber())
    }
  }

  const getBaseData = () => {
    if (tokenA) {
      console.log("-------->", tokenA)
      setFirstAmount("")
      getExchangeBalances(tokenA?.address, true)
    }
    if (tokenB) {
      setSecondAmount("")
      getExchangeBalances(tokenB?.address, false)
    }
    if (tokenA && tokenB) {
      initToken()
    }
  }

  // const deadline = useTransactionDeadline()

  const initToken = () => {
    console.log("init Token --------->");
    if (window.web3 && window.web3.eth) {
      let FamosoFactory: any = new window.web3.eth.Contract(contracts.abis.FamosoFactory, contractAddress[connectedNetwork].FamosoFactory)
      let token0: any = tokenA.isCoin ? wethAddr[connectedNetwork] : tokenA.address
      let token1: any = tokenB.isCoin ? wethAddr[connectedNetwork] : tokenB.address
      let isOrder = Number(token0) < Number(token1)

      return FamosoFactory.methods.getPair(token0, token1)
        .call()
        .then((famosoPairAddress: any) => {

          console.log(token0, token1, "famosoAddress", famosoPairAddress)
          if (famosoPairAddress === zeroAddr) {
            setReserveFirst(new BigNumber(0))
            setReserveSecond(new BigNumber(0))
            setPriceFirst(new BigNumber(0))
            setPriceSecond(new BigNumber(0))
            setTotalSupply(new BigNumber(0))
            return
          }
          setCurrentPairAddress(famosoPairAddress)
          let FamosoPair: any = new window.web3.eth.Contract(contracts.abis.FamosoPair, famosoPairAddress);
          FamosoPair.methods.totalSupply().call()
            .then((totRes: any) => {
              console.log("total Supply", totRes)
              setTotalSupply(new BigNumber(totRes).shiftedBy(-18))
              return balanceErc20(famosoPairAddress, walletAddress)
                .then((shareRes: any) => {
                  console.log("my share", shareRes)
                  setMyShare(new BigNumber(shareRes).shiftedBy(-18))
                })
                .catch((err: any) => {
                  setMyShare(new BigNumber(0))
                })
            })

          return FamosoPair.methods.getReserves().call()
            .then((res: any) => {
              console.log("getReserves ===>", res);
              let resA = isOrder ? res._reserve0.toString() : res._reserve1.toString()
              let resB = isOrder ? res._reserve1.toString() : res._reserve0.toString()

              setReserve0(new BigNumber(resA))
              setReserve1(new BigNumber(resB))

              setReserveFirst(new BigNumber(resA).shiftedBy(-tokenA.decimals))
              setReserveSecond(new BigNumber(resB).shiftedBy(-tokenB.decimals))
              if (new BigNumber(resA).isGreaterThan(0)) {
                setPriceFirst(new BigNumber(resB).dividedBy(new BigNumber(resA)).shiftedBy(tokenA.decimals - tokenB.decimals))
              } else {
                setPriceFirst(new BigNumber(0))
              }
              if (new BigNumber(resB).isGreaterThan(0)) {
                setPriceSecond(new BigNumber(resA).dividedBy(new BigNumber(resB)).shiftedBy(tokenB.decimals - tokenA.decimals))
              } else {
                setPriceSecond(new BigNumber(0))
              }
            })
            .catch((err: any) => console.log(err), console.log("getFamoso error"));
        });
    } else {

    }
  }

  const validInput = () => {
    if (!isNumeric(firstAmount) || !isNumeric(secondAmount)) return showError("Please input correct amount")
    return true
  }

  // Need to check the maxApproveAmount for the approving.
  const approveTokenA = () => {
    if (approvedA || tokenA.isCoin) return
    return approveErc20(tokenA.address, contractAddress[connectedNetwork].FamosoRouter, walletAddress, maxApproveAmount)
      .then((approveRes: any) => {
        if (!approveRes.events.Approval.returnValues.value) return dispatch(setApprovedA(false))
        else return dispatch(setApprovedA(Number(approveRes.events.Approval.returnValues.value) >= maxSupply))
      }).catch((e: any) => {
        console.log(e)
        return dispatch(setApprovedA(false))
      });
  }

  const approveTokenB = () => {
    if (approvedB || tokenB.isCoin) return
    return approveErc20(tokenB.address, contractAddress[connectedNetwork].FamosoRouter, walletAddress, maxApproveAmount)
      .then((approveRes: any) => {
        if (!approveRes.events.Approval.returnValues.value) return dispatch(setApprovedB(false))
        else return dispatch(setApprovedB(Number(approveRes.events.Approval.returnValues.value) >= maxSupply))
      }).catch((e: any) => {
        console.log(e)
        return dispatch(setApprovedB(false))
      });
  }

  const clickSupply = () => {
    if (!(approvedA && approvedB && (isErr === 0))) return
    if (!validInput()) return showError("Please input correct values")
    setShowConfirm(true)
  }

  const supplyHandler = () => {
    setDoingSupply(true)
    const router = new window.web3.eth.Contract(contracts.abis.FamosoRouter, contractAddress[connectedNetwork].FamosoRouter)
    if (tokenA.isCoin || tokenB.isCoin) {
      return router.methods.addLiquidityETH(
        tokenA.isCoin ? tokenB.address : tokenA.address,
        tokenB.isCoin ? BigInt(new BigNumber(firstAmount).shiftedBy(tokenA.decimals).toString()) : BigInt(new BigNumber(secondAmount).shiftedBy(tokenB.decimals).toString()),
        BigInt("0"),
        BigInt("0"),
        walletAddress,
        mnDeadline
        // truncate((new Date().getTime())/1000 + 1000)
      )
        .send({
          from: walletAddress,
          gas: bestGas,
          gasPrice: bestGasPrice,
          value: tokenA.isCoin ? Number(new BigNumber(firstAmount).shiftedBy(18).toString()) : Number(new BigNumber(secondAmount).shiftedBy(18).toString())
        })
        .then((res: any) => {
          console.log("res add liquidity", res)
          setDoingSupply(false)
          setShowConfirm(false)
          getBaseData()
          return dispatch(openNotification(res, "Liquidity supplied"))
        })
        .catch((err: any) => {
          setDoingSupply(false)
        })
    } else {
      return router.methods.addLiquidity(
        tokenA.address,
        tokenB.address,
        BigInt(new BigNumber(firstAmount).shiftedBy(tokenA.decimals).toString()),
        BigInt(new BigNumber(secondAmount).shiftedBy(tokenB.decimals).toString()),
        BigInt("0"),
        BigInt("0"),
        walletAddress,
        mnDeadline
        // truncate((new Date().getTime())/1000 + 1000)
      )
        .send({
          from: walletAddress,
          gas: bestGas,
          gasPrice: bestGasPrice
        })
        .then((res: any) => {
          console.log("res add liquidity", res)
          setDoingSupply(false)
          setShowConfirm(false)
          getBaseData()
          return dispatch(openNotification(res, "Liquidity supplied"))
        })
        .catch((err: any) => {
          setDoingSupply(false)
        })
    }
  }

  const getExchangeBalances = (address: any, pay: boolean) => {
    console.log("====>", address, pay);
    if (address !== zeroAddr)
      return balanceErc20(address, walletAddress)
        .then((payBalRes: any) => {
          decimalsErc20(address).then((decimalsRes: any) => {
            pay === true ?
              setPayBalance(new BigNumber(payBalRes).shiftedBy(-decimalsRes))
              : setReceiveBalance(new BigNumber(payBalRes).shiftedBy(-decimalsRes))
          })
        })
    else return balanceCoin(walletAddress)
      .then((payBalRes: any) => {
        pay === true ?
          setPayBalance(new BigNumber(payBalRes).shiftedBy(-18))
          : setReceiveBalance(new BigNumber(payBalRes).shiftedBy(-18))
      })
  }

  const enterFirstAmount = (str: any) => {
    setFirstAmount(str)
    if (tokenA === null) {
      return;
    }
    if (str === "") {
      if (totalSupply.isGreaterThan(0)) {
        setSecondAmount("")
      }
      setIsErr(1)
      setErrMsg("Enter an amount")
      return
    }

    if (firstBalance.isLessThan(new BigNumber(str))) {
      setIsErr(1)
      setErrMsg(`Insufficient ${tokenA.symbol} balance`)
      return
    }
    if (tokenB === null) {
      return;
    }

    if (priceFirst.isGreaterThan(0)) {
      setSecondAmount(currencyFormat(priceFirst.multipliedBy(new BigNumber(str)).toString()))
      if (secondBalance.isLessThan(new BigNumber(priceFirst).multipliedBy(new BigNumber(str)))) {
        setIsErr(1)
        setErrMsg(`Insufficient ${tokenB.symbol} balance`)
      } else {
        setIsErr(0)
      }
    } else {
      if (secondAmount === "") {
        setIsErr(1)
        setErrMsg('Enter an amount');
        return;
      } else {
        if (secondBalance.isLessThan(new BigNumber(secondAmount))) {
          setIsErr(1)
          setErrMsg(`Insufficient ${tokenB.symbol} balance`)
        }
      }
    }

  }

  const enterSecondAmount = (str: any) => {
    setSecondAmount(str)
    if (tokenB === null) {
      return;
    }
    if (str === "") {
      if (totalSupply.isGreaterThan(0)) {
        setFirstAmount("")
      }
      setIsErr(1)
      setErrMsg("Enter an amount");
      return
    }

    if (secondBalance.isLessThan(new BigNumber(str))) {
      setIsErr(1)
      setErrMsg(`Insufficient ${tokenB.symbol} balance`)
      return
    }

    if (tokenA === null) {
      return;
    }

    if (priceSecond.isGreaterThan(0)) {
      setFirstAmount(currencyFormat(priceSecond.multipliedBy(new BigNumber(str)).toString()))
      if (firstBalance.isLessThan(new BigNumber(priceSecond).multipliedBy(str))) {
        setIsErr(1)
        setErrMsg(`Insufficient ${tokenA.symbol} balance`)
      } else {
        setIsErr(0)
      }
    } else {
      if (firstAmount === "") {
        setIsErr(1)
        setErrMsg('Enter an amount');
        return;
      } else {
        if (firstBalance.isLessThan(new BigNumber(firstAmount))) {
          setIsErr(1)
          setErrMsg(`Insufficient ${tokenA.symbol} balance`)
        }
      }
    }

  }

  const clickMaxAmount = (index: number) => {
    if (index === 1) {
      enterFirstAmount(firstBalance)
    } else if (index === 2) {
      enterSecondAmount(secondBalance)
    }
  }

  const clickRemoveSupply = () => {
    setShowRemoveLp(true)
  }

  const getSharePercent = () => {
    if (myShare.isZero()) {
      return '0'
    } else if (totalSupply.isZero()) {
      return '0'
    }
    return myShare.dividedBy(totalSupply).shiftedBy(2).toFixed(2)
  }

  const clickSearchToken = (index: any) => {
    setIsFirstToken(index === 1)
    setShowSearchToken(true)
  }

  const tokenSelected = (token: any) => {
    if (isFirstToken === true) {
      if (tokenB !== null) {
        if (isSameAddress(token.address, tokenB.address)) {
          dispatch(setTokenB(tokenA))
          dispatch(setTokenA(token))
        }
      }
      dispatch(setTokenA(token))
    } else {
      if (tokenA !== null) {
        if (isSameAddress(token.address, tokenA.address)) {
          dispatch(setTokenA(tokenB))
          dispatch(setTokenB(token))
        }
      }
      dispatch(setTokenB(token))
    }
  }

  const [showConfirm, setShowConfirm] = useState<boolean>(false)

  const currencyFormat = (str: string) => {
    let aStr = str.split('.');
    if (aStr.length > 1) {
      return aStr[0] + '.' + aStr[1].substring(0, 4);
    } else {
      return str;
    }
  }
  return (
    <div>
      <div className="flex-col pt-3">
        {/** Add Liquidity Label Section */}
        <p className="c-white text-lg bold mb-1 text-center">
          Add Liquidity
        </p>
        {/* <p className="c-white text-lg bold mb-1 text-center">Your Liquidity</p> */}
        <p
          className="c-white text-base text-center"
        // hidden={myShare === 0}
        >
          Add liquidity to receive LP tokens
        </p>


        {/** First Liquidity Provider Description Section */}
        <div className={cn("c-white text-base font-DmSans", styles.desc)} hidden={totalSupply.isGreaterThan(0) || tokenA === null || tokenB === null}>
          <p> You are the first liquidity provider.</p>
          <p>
            The ratio of tokens you add will set the price of this pool.
          </p>
          <p>
            Once you are happy with the rate click supply to review.
          </p>
        </div>


        {/**  >>>Main Section for Selecting Tokens And Enter Amount */}

        <div className="back-dark7 flex-col rounded-m p-3">
          <div className="flex flex-no-wrap white">
            <div className="left fc-dark">
              <div className="flex flex-no-wrap pointer" onClick={() => clickSearchToken(1)}>
                {tokenA
                  ? <>
                    <img
                      src={tokenA.logoURI}
                      className="size-32px rounded-50"
                      alt=""
                    />
                    <span className="m-auto-v mx-1 pointer">
                      {tokenA.symbol}
                    </span>
                  </>
                  : <span className="left fc-dark">
                    Select a currency
                  </span>
                }
                <span className="m-auto-v">
                  <i className="icofont-thin-down"></i>
                </span>
              </div>
            </div>
            <span className="right fc-dark">
              {tokenA ? `Balance: ${currencyFormat(firstBalance.toString())}` : '-'}
            </span>
          </div>
          <div className="flex flex-no-wrap white">
            {tokenA && <div className="flex mx-2 m-auto-v" onClick={() => clickMaxAmount(1)}>
              <div className="after-none flex flex-no-wrap  m-auto-v pointer">
                <span className="pointer">
                  MAX
                </span>
              </div>
            </div>}
            <input
              type="text"
              className="right m-auto-v white blank-box w-fill sp-mx-w-160"
              placeholder="0.0"
              value={firstAmount}
              onChange={((e) => enterFirstAmount(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="text-center flex mb-2 mt-0">
        {/* <img src={changeSvg} alt="" className="m-auto-v img-white pointer" /> */}
        <Icon name="plus" size="30" fill="#fff" className="c-white" />
        {/* <img src={loadingPng} alt="" /> */}
      </div>


      <div className="flex-col mb-4">
        {/* <p className=" c-white text-lg bold mb-1">Input</p> */}
        <div className="back-dark7 flex-col rounded-m p-3">
          <div className="flex flex-no-wrap white">
            <div className="left fc-dark">
              <div className="flex flex-no-wrap pointer" onClick={() => clickSearchToken(2)}>
                {tokenB
                  ? <>
                    <img
                      src={tokenB.logoURI}
                      className="size-32px rounded-50"
                      alt=""
                    />
                    <span className="m-auto-v mx-1 pointer">
                      {tokenB.symbol}
                    </span>
                  </>
                  : <span className="left fc-dark">
                    Select a currency
                  </span>
                }
                <span className="m-auto-v">
                  <i className="icofont-thin-down"></i>
                </span>
              </div>
            </div>
            <span className="right fc-dark">
              {tokenB ? `Balance: ${currencyFormat(secondBalance.toString())}` : '-'}
            </span>
          </div>
          <div className="flex flex-no-wrap white">
            {tokenB && <div className="flex mx-2 m-auto-v" onClick={() => clickMaxAmount(2)}>
              <div className="after-none flex flex-no-wrap  m-auto-v pointer">
                <span className="pointer">
                  MAX
                </span>
              </div>
            </div>}
            <input
              type="text"
              className="right m-auto-v white blank-box w-fill sp-mx-w-160"
              placeholder="0.0"
              value={secondAmount}
              onChange={((e) => enterSecondAmount(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/** Liquidity and Approved State*/}
      {tokenA && tokenB && <>
        <p className="my-1 c-white">
          {totalSupply.isZero() ? `Initial prices and pool share` : `Prices and pool share`}
        </p>
        <div className="flex-col font-DmSans border-dark p-3 rounded-m mb-2 c-white">
          <div className="flex w-100 my-1 grid3-abs">
            <div className="item text-center">{totalSupply.isZero() ? '-' : currencyFormat(priceFirst.toString())}</div>
            <div className="item text-center">{totalSupply.isZero() ? '-' : currencyFormat(priceSecond.toString())}</div>
            <div className="item text-center">{lpPercent.toFixed(2)}%</div>
          </div>
          <div className="flex w-100 my-1 grid3-abs">
            <span className="item text-center text-base">{tokenB?.symbol} per {tokenA?.symbol}</span>
            <span className="item text-center text-base">{tokenA?.symbol} per {tokenB?.symbol}</span>
            <span className="item text-center text-base">Share of Pool</span>
          </div>
        </div>
        {firstAmount && secondAmount && isErr === 0 && <div
          className={cn("flex", { [styles.approve_2]: (!approvedA) && (!approvedB) }, { [styles.approve_1]: (approvedA || approvedB) })}
          hidden={approvedA && approvedB}
        >
          <div
            hidden={approvedA}
            onClick={() => approveTokenA()}
            className="flex text-center btn-hover back-blue1 p-2 my-2 rounded-m pointer c-white">
            <span className="m-auto-v">Enable {tokenA.symbol}</span>
          </div>
          <div
            hidden={approvedB}
            onClick={() => approveTokenB()}
            className="flex text-center btn-hover back-blue1 p-2 my-2 rounded-m pointer c-white">
            <span className="m-auto-v">Enable {tokenB.symbol}</span>
          </div>
        </div>}
      </>}

      {/** Button */}
      <div
        hidden={isErr > 0 || tokenA === null || tokenB === null}
        onClick={() => clickSupply()}
        className={
          cn(
            "flex text-center btn-hover btn-back-gradient-reverse p-2 my-2 rounded-m pointer c-white",
            {
              [styles.disallowedButton]: !(approvedA && approvedB && (isErr === 0))
            }
          )
        }
      >
        {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
        <span className="m-auto-v">Supply</span>
      </div>

      <div
        hidden={isErr > 0 || myShare.isZero() || tokenA === null || tokenB === null}
        onClick={() => clickRemoveSupply()}
        className="flex text-center btn-hover btn-back-gradient-reverse p-2 my-2 rounded-m pointer c-white">
        {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
        <span className="m-auto-v">Remove liquidity</span>
      </div>

      <div
        hidden={isErr !== 1 || tokenA === null || tokenB === null}
        className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-white disabled"
      >
        {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
        <span className="m-auto-v">{errMsg}</span>
      </div>

      <div
        hidden={tokenA && tokenB}
        className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-green disabled"
      >
        <span className="m-auto-v">Invalid pair</span>
      </div>
      {tokenA && tokenB && <RemoveLiquidity
        isModalOpen={showRemoveLp}
        onHide={() => setShowRemoveLp(false)}
        firstCoin={tokenA}
        secondCoin={tokenB}
        reserveFirst={reserveFirst}
        reserveSecond={reserveSecond}
        priceFirst={priceFirst}
        priceSecond={priceSecond}
        totalSupply={totalSupply}
        myShare={myShare}
        pairAddress={currentPairAddress}
      />}
      <SearchToken
        isModalOpen={showSearchToken}
        onHide={() => setShowSearchToken(false)}
        tokenSelected={tokenSelected}
        tokenA={tokenA}
        tokenB={tokenB}
        isSwap={false}
      />
      {tokenA && tokenB && <ConfirmSupply
        isModalOpen={showConfirm}
        onHide={() => setShowConfirm(false)}
        tokenA={tokenA}
        tokenB={tokenB}
        lpAmount={lpAmount}
        lpPercent={lpPercent}
        firstAmount={firstAmount}
        secondAmount={secondAmount}
        clickSupplyHandler={supplyHandler}
        doingSupply={doingSupply}
      />}
    </div>
  )
}

export default AddLiquidity;
