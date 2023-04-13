import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./LiquidityRow.module.sass";
import Icon from "../../../../parts/Icon";

import { useAppContext } from "../../../../common/libs/context";
import { useAppSelector, useAppDispatch } from '../../../../../app/hook'
import { connectToMetamask } from "../../../../common/libs/ConnectWallet/connectWalletSlice";

import { RootState } from '../../../../../app/store'
import contracts, { contractAddress } from "../../../../../contracts";
import { approveErc20, balanceErc20 } from "../../../../common/libs/functions/integrate";
import { bestGas, bestGasPrice, zeroAddr } from "../../../../common/libs/constant";
import { rounded } from "../../../../common/libs/functions";
import RemoveLiquidity from "../RemoveLiquidity";
import { getTokenURI } from "../../../../common/libs/functions/getData";

const LiquidityRow = ({ className, item }: any) => {
  const dispatch  = useAppDispatch()
  const {isConnected, onConnectWallet, walletAddress, isCorrectNet, connectedNetwork} = useAppContext()
  const swapCount = useAppSelector((state: RootState) => state.swapSlice.swapCount)
  const liquidityCount = useAppSelector((state: RootState) => state.swapSlice.liquidityCount)
  const modalType = useAppSelector((state: RootState) => state.swapSlice.modalType)

  const [visible, setVisible] = useState(false);
  const [mySupply, setMySupply] = useState<any>(0)

  const [showRemoveLp, setShowRemoveLp] = useState<boolean>(false)

  useEffect(() => {
    if (window.web3 && window.web3.eth) {
      initToken()
      getMySupply()
    }
  }, [swapCount, liquidityCount])

  useEffect(() => {
    setVisible(false)
  }, [modalType])

  const getMySupply = () => {
    balanceErc20(item.id, walletAddress)  
    .then((res: any) => {
      setMySupply(Number(res)/(10**18))
    })
  }

  
  const [reserveFirst, setReserveFirst] = useState<any>("0.00")
  const [reserveSecond, setReserveSecond] = useState<any>("0.00")
  const [priceFirst, setPriceFirst] = useState<any>("---")
  const [priceSecond, setPriceSecond] = useState<any>("---")
  const [totalSupply, setTotalSupply] = useState<number>(0)
  const [myShare, setMyShare] = useState<number>(0)
  const [tokenA, setTokenA] = useState<any>({})
  const [tokenB, setTokenB] = useState<any>({})

  const initToken = () => {
    setTokenA({
      isCoin: false,
      address: item.token0.id,
      logoURI: getTokenURI(connectedNetwork, item.token0.id),
      symbol: item.token0.symbol
    })

    setTokenB({
      isCoin: false,
      address: item.token1.id,
      logoURI: getTokenURI(connectedNetwork, item.token1.id),
      symbol: item.token1.symbol
    })

    if (window.web3 && window.web3.eth) {
          let token0: any =  item.token0.id
          let token1: any =  item.token1.id
          let isOrder = Number(token0) < Number(token1)
          
          let famosoPairAddress: any = item.id

          let FamosoPair: any = new window.web3.eth.Contract(contracts.abis.FamosoPair, famosoPairAddress);
          FamosoPair.methods.totalSupply().call()
          .then((totRes: any) => {
              console.log("total Supply", totRes)
              setTotalSupply(Number(totRes)/(10**18))
              return balanceErc20(famosoPairAddress, walletAddress)
              .then((shareRes: any) => {
                  console.log("my share", shareRes)
                  setMyShare(Number(shareRes)/(10**18))
              })
              .catch((err: any) => {
                  setMyShare(0)
              })
          })

          return FamosoPair.methods.getReserves().call()
          .then((res: any) => {
              console.log("getReserves ===>", res);
              let resA = isOrder? res._reserve0 : res._reserve1
              let resB = isOrder? res._reserve1 : res._reserve1

              setReserveFirst(Number(resA) / (10 ** 18))
              setReserveSecond(Number(resB) / (10 ** 18))

              if (Number(resA) > 0) 
                  setPriceFirst(Number(Number(resB) / Number(resA)).toFixed(2))
              else
                  setPriceFirst("0.00")
              
              if (Number(resB) > 0) 
                  setPriceSecond(Number(Number(resA) / Number(resB)).toFixed(2))
              else
                  setPriceSecond("0.00")

          })
          .catch((err: any) => console.log(err), console.log("getFamoso error"));
          
    }
  }

  const getMyFristReceiveAmount = () => {
    if(totalSupply > 0) return reserveFirst*myShare/totalSupply
    else return 0
  }
  const getMySecondReceiveAmount = () => {
    if(totalSupply > 0) return reserveSecond*myShare/totalSupply
    else return 0
  }

  const getSharePercent = () => {
    if(totalSupply > 0){
      let val: any = 100.0*myShare/totalSupply
      if(val < 0.01) return "<0.01"
      else return rounded(val, 3)
    }else return "-"
  }
  return (
    <div className={cn(className, styles.liquidity_row, { [styles.active]: visible })}>
      <div className={styles.head} onClick={() => setVisible(!visible)}>
        <div className={styles.title}>
          <div className={styles.topTitle}>
            <div className={styles.logoImg}>
                <img src={getTokenURI(connectedNetwork, item.token0.id)} alt="" />
                <img src={getTokenURI(connectedNetwork, item.token1.id)} alt="" />
            </div>
            <span className={styles.poolName}>{item.token0.symbol + "-" + item.token1.symbol}</span>
            <Icon name="arrow-bottom" className={styles.downIcon} size="16" />
          </div>
          <div className={styles.amount}>
            {rounded(mySupply, 18)}
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <img src={getTokenURI(connectedNetwork, item.token0.id)} alt="" />
          <span className={styles.title}>Pooled {item.token0.symbol}</span>
          <span className={styles.desc}>{rounded(getMyFristReceiveAmount(), 18)}</span>
        </div>
        <div className={styles.row}>
          <img src={getTokenURI(connectedNetwork, item.token1.id)} alt="" />
          <span className={styles.title}>Pooled {item.token1.symbol}</span>
          <span className={styles.desc}>{rounded(getMySecondReceiveAmount(), 18)}</span>
        </div>
        <div className={styles.row}>
          <span className={cn(styles.title, "ml-0 mt-2 mb-2")}>Share of pool</span>
          <span className={styles.desc}>{getSharePercent()}%</span>
        </div>
        <div className={cn(styles.removeBtn, "btn-hover")} onClick={() => setShowRemoveLp(true)}>
          Remove
        </div>
      </div>
      <RemoveLiquidity 
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
          pairAddress={item.id}
      />
    </div>
  );
};

export default LiquidityRow;
