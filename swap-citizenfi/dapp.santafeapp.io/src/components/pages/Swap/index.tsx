import { useEffect } from "react";
import cn from "classnames";
import styles from "./Swap.module.sass"

import Header from "./Header"
import Liquidity from "./Liquidity"
import Bridge from "./Bridge";
import Setting from "./Setting"
import { RootState } from '../../../app/store'
import { SWAP_MODAL_TYPE } from "../../common/libs/constant";
import { useAppSelector, useAppDispatch } from '../../../app/hook'
import { getFamosoPairs } from "./swapSlice";
import { useAppContext } from "../../common/libs/context";

import TradeHistory from "./TradeHistory"
import Routing from "./Routing";
import AddLiquidity from "./Liquidity/AddLiquidity";
import SwapModal from "./SwapModal";

function Swap() {
  const dispatch = useAppDispatch()
  const modalType = useAppSelector((state: RootState) => state.swapSlice.modalType)
  const { connectedNetwork } = useAppContext()

  useEffect(() => {
    console.log("here is use effect in swap page")
    dispatch(getFamosoPairs(connectedNetwork))
  }, [])
  return (
    <div 
      className={
        cn(
          "swap-page mn-h-80 p-4 mx-1400 ff-point-cufon", 
          styles.swap_page
        )
      }
    >
      <div 
        className={
          cn("text-center", styles.title)
        }
      >
        <p className="fs-32 my-2 p-2 white">
          FAMOSO DECENTRALIZED EXCHANGE
        </p>
        <p className="fc-grey mb-2 p-2">
          Swap cryptocurrency and trade derivatives easily on multiple chains
        </p>
      </div>
      <div className={cn("row white", styles.mainPad)}>
        {/** CHART SECTION */}
        {/* <div className="flex-col col-md-8 sp-order-2 p-2">
          <Chart 
            receiveCoin={tokenBuy} 
            payCoin={tokenPay} 
            reverseExchange={reverseExchange} />               
        </div> */}

        {/** HISTORY SECTION */}
        {/* <div 
          className={
            cn(
              "flex-col col-md-7 mx-2 px-2", 
              styles.exchange_history
            )
          } 
          hidden={true}
        >
          <TradeHistory />
        </div> */}

        <div className="flex-col col-md-4 sp-order-1">
          <div className="flex-col bd-shiny on rounded-x btn-back-gradient p-4">
            {/**  HEADER SECTION */}
            <Header />
            {/** SWAP MODAL */}
            <div
              className="swap-part mt-4"
              hidden={modalType !== SWAP_MODAL_TYPE.SWAP}
            >
              <SwapModal />
            </div>
            <div hidden={modalType !== SWAP_MODAL_TYPE.LIQUIDITY}>
              <Liquidity />
            </div>
            <div hidden={modalType !== SWAP_MODAL_TYPE.ADD_LIQUIDITY}>
              <AddLiquidity />
            </div>
            <div hidden={modalType !== SWAP_MODAL_TYPE.SETTING}>
              <Setting />
            </div>
            <div hidden={modalType !== SWAP_MODAL_TYPE.BRIDGE}>
              <Bridge />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-col" hidden={true}>
        <Routing />
      </div>
    </div>
  )
}

export default Swap;
