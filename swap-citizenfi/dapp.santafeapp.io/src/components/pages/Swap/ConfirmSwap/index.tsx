import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../common/libs/context";

import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import styles from "./ConfirmSwap.module.sass"
import cn from "classnames"

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import contractData, { contractAddress } from "../../../../contracts";
import { executeSwap } from "../swapSlice";
import { SWAP_TYPE } from "../../../../helpers";
import { getBalanceStr, rounded } from "../../../common/libs/functions";
import { loaderSpinnerSvg } from "../../../common/libs/image";

const ConfirmSwap = ({ isModalOpen, onHide, payAmount, receiveAmount, swapRouter, walletAddress, swapType }: any) => {
  const dispatch = useAppDispatch()
  const { connectedNetwork } = useAppContext()
  const isSwap = useAppSelector((state: RootState) => state.swapSlice.isSwap)
  const tokenPay = useAppSelector((state: RootState) => state.swapSlice.tokenPay)
  const tokenBuy = useAppSelector((state: RootState) => state.swapSlice.tokenBuy)

  const clickSwap = () => {
    if (isSwap) return
    const title: any = "Swap " + payAmount + tokenPay.symbol + " for " + receiveAmount + tokenBuy.symbol
    return dispatch(executeSwap(payAmount, receiveAmount, swapRouter, walletAddress, swapType, title, contractAddress[connectedNetwork].FamosoRouter))
  }

  const isInput = () => {
    return swapType === SWAP_TYPE.EXACT_ETH_FOR_TOKENS || swapType === SWAP_TYPE.EXACT_TOKENS_FOR_ETH || swapType === SWAP_TYPE.EXACT_TOKENS_FOR_TOKENS
  }

  const clickClose = () => {
    onHide()
  }

  return (
    <Modal 
      show={isModalOpen} 
      onHide={() => clickClose()} 
      centered 
      className={cn("modal-dialog-wallet-connect mx-400 p-2", styles.swapConfirmModal)}
    >
      <ModalBody className=" btn-back-gradient-reverse rounded-x p-4">
        <div className="row flex px-3 pt-3">
          <p className="text-2xl bold">
            Confirm Swap
          </p>
          <div 
            className="close-window pointer right" 
            onClick={() => clickClose()}
          >
            <i className="fa remix ri-close-fill fs-20"></i>
          </div>
        </div>
        <div className="flex-col mt-4">
          <div className="flex">
            <img className="size-24px mr-2 rounded-50" src={tokenPay.logoURI} alt="" />
            <span className="text-2xl">{rounded(payAmount, 12)}</span>
            <span className="right text-2xl bold">{tokenPay.symbol}</span>
          </div>
          <div className="flex my-2">
            <i className="icofont-arrow-down text-2xl my-auto ml-1"></i>
          </div>
          <div className="flex">
            <img className="size-24px mr-2 rounded-50" src={tokenBuy.logoURI} alt="" />
            <span className="text-2xl">{rounded(receiveAmount, 12)}</span>
            <span className="right text-2xl bold">{tokenBuy.symbol}</span>
          </div>
          <div className={styles.update} hidden={true}>
            <i className={cn("icofont-warning mr-2", styles.lightCol)}></i>
            <span className={cn("left", styles.lightCol)}>Price Updated</span>
            <span className={cn(styles.accept_btn, "right text-lg pointer")}>Accept</span>
          </div>
          <p className={styles.desc} hidden={!isInput()}>
            Output is estimated. You will receive at least
            <span className="text-lg">{rounded(receiveAmount, 12) + " " + tokenBuy.symbol}</span>
            or the transaction will revert.

          </p>
          <p className={styles.desc} hidden={isInput()}>
            Input is estimated. You will sell at most
            <span className="text-lg">{rounded(payAmount, 12) + " " + tokenPay.symbol}</span>
            or the transaction will revert.
          </p>

        </div>
        <div className={styles.details}>
          <div className="flex">
            <span className="left">Price</span>
            <span>
              {rounded(payAmount / receiveAmount, 3)} {tokenPay.symbol} / {tokenBuy.symbol}
              <i className="icofont-loop ml-2 text-lg"></i>
            </span>
          </div>
          <div className="flex">
            <span className="left">Minimum received</span>
            <span>{rounded(receiveAmount, 4)} {tokenBuy.symbol}</span>
          </div>
          <div className="flex">
            <span className="left">Price Impact</span>
            <span className={styles.per}>0.10%</span>
          </div>
          <div className="flex">
            <span className="left">Liquidity Provider Fee</span>
            <span>{rounded(0.025 * payAmount, 5)} {tokenPay.symbol}</span>
          </div>
        </div>
        <div className="flex mt-4">
          <div
            onClick={() => clickSwap()}
            className={cn("flex bd-shiny rounded btn-back-gradient btn-hover py-2 px-8 pointer bold text-base c-white rounded m-auto", styles.confirmBtn)}>
            <span hidden={isSwap} className="px-8 py-1">Confirm Swap</span>
            <div hidden={!isSwap} >
              <img src={loaderSpinnerSvg} style={{ height: "10px", margin: "5px auto" }} alt="" />
            </div>
          </div>
          {/* <div hidden={!isProcess} className="loader-animation-sm m-auto"></div> */}
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ConfirmSwap;
