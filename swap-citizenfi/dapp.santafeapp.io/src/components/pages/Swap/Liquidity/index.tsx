import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../common/libs/context";
import Icon from "../../../parts/Icon";

import styles from "./Liquidity.module.sass"
import cn from "classnames"

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { setModalType } from "../swapSlice";
import { NetworkArray, SWAP_MODAL_TYPE } from "../../../common/libs/constant";
import { getFamosoPairsFromGraph } from "../../../common/libs/functions/getData";
import { balanceErc20 } from "../../../common/libs/functions/integrate";
import { setTokenA, setTokenB } from "./AddLiquidity/addLiquiditySlice";

import LiquidityRow from "./LiquidityRow";

function Liquidity() {
  const dispatch = useAppDispatch()
  const { walletAddress, connectedNetwork } = useAppContext()
  const liquidityCount = useAppSelector((state: RootState) => state.swapSlice.liquidityCount)

  const [myLiquidity, setMyLiquidity] = useState<Array<any>>([])
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  useEffect(() => {
    setMyLiquidity([])
    getLp()
  }, [liquidityCount])

  const getLp = () => {
    return getFamosoPairsFromGraph(connectedNetwork)
      .then((pairs: any) => {
        if (pairs) {
          return pairs.map((pair: any, index: number) => {
            return balanceErc20(pair.id, walletAddress)
              .then((balRes: any) => {
                if (Number(balRes) > 0) {
                  pair.chainId = NetworkArray[connectedNetwork][0].chainId_dec
                  setMyLiquidity(index === 0 ? [pair] : [...myLiquidity, pair])
                  setIsLoaded(true)
                } else {
                  setIsLoaded(true)
                }
              })
          })
        }
        else setIsLoaded(true)
      })
      .catch((err: any) => {
        setIsLoaded(true)
      })
  }

  const handleAddLiquidity = () => {
    dispatch(setTokenA(null))
    dispatch(setTokenB(null))
    dispatch(setModalType(SWAP_MODAL_TYPE.ADD_LIQUIDITY))
  }
  return (
    <div className={styles.liquidity}>
      <div className="flex-col pt-3">
        <p className="c-white text-lg bold mb-1 text-center">
          Your Liquidity
        </p>
        <p className="c-white text-base" >
          Remove liquidity to receive tokens back
        </p>
      </div>

      <div 
        className={cn(styles.empty_contents, styles.loading)} 
        hidden={isLoaded}
      >
        <img 
          src="/assets/images/EllipsisSpinner3.svg" 
          style={{ height: "12px" }} 
          alt="" 
        />
      </div>

      <div 
        className={styles.empty_contents} 
        hidden={!isLoaded || (myLiquidity.length > 0)}
      >
        <div className={styles.first}>
          No liquidity found
        </div>
        <div className={styles.second}>
          Don't see a pool you joined?
        </div>
        <div className={styles.find}>
          Find other LP tokens
        </div>
      </div>

      <div 
        className={styles.empty_contents} 
        hidden={!isLoaded || (myLiquidity.length < 1)}
      >
        {
          isLoaded && myLiquidity && myLiquidity.map((item: any, index: any) =>
            <LiquidityRow
              key={index}
              index={index}
              item={item}
            />
          )
        }
      </div>

      {/** Add Liquidity Button */}
      <div
        onClick={() => handleAddLiquidity()}
        className={
          cn("flex text-center btn-hover btn-back-gradient-reverse p-2 my-2 rounded-m pointer c-white")
        }
      >
        <Icon 
          name="plus" 
          size="24" 
          fill="#fff" 
          className="my-auto c-white" 
        />
        <span className="m-auto-v">
          Add Liquidity
        </span>
      </div>
    </div>
  )
}

export default Liquidity;