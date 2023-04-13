import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import { rounded } from "../../../../common/libs/functions"

import cn from "classnames"
import styles from "./ConfirmSupply.module.sass"

function ConfirmSupply({ isModalOpen, onHide, tokenA, tokenB, lpAmount, lpPercent, firstAmount, secondAmount, clickSupplyHandler, doingSupply }: any) {
  const clickSupply = () => {
    if (doingSupply) return
    return clickSupplyHandler()
  }

  const clickClose = () => {
    onHide()
  }

  return (
    <>{tokenA && tokenB && firstAmount && secondAmount && 
      <Modal show={isModalOpen} onHide={() => clickClose()} centered className={cn("modal-dialog-wallet-connect mx-400 p-2", styles.confirmSupply)}>
        <ModalBody className={cn(" btn-back-gradient-reverse rounded-x p-4")}>
          <div className="row flex px-4 pt-3 c-white">
            <p className={cn("text-3xl bold", styles.mainTitle)}>
              You will receive
            </p>
            <div className="close-window pointer right" onClick={() => clickClose()}>
              <i className="fa remix ri-close-fill fs-32"></i>
            </div>
          </div>
          <div className={styles.poolAmount}>
            <span>{lpAmount.toFixed(10)}</span>
            <img src={tokenA.logoURI} alt="" />
            <img src={tokenB.logoURI} alt="" />
          </div>
          <div className={styles.subTitle}>
            {tokenA.symbol}/{tokenB.symbol} Pool Tokens
          </div>
          <div className={styles.desc}>
            Output is estimated. If the price changes by more than 0.5% your transaction will revert.
          </div>
          <div className={styles.prices}>
            <div className={styles.col}>
              <span>{tokenA.symbol} Deposited</span>
              <img src={tokenA.logoURI} alt="" />
              <span>{rounded(firstAmount, 5)}</span>
            </div>
            <div className={styles.col}>
              <span>{tokenB.symbol} Deposited</span>
              <img src={tokenB.logoURI} alt="" />
              <span>{rounded(secondAmount, 5)}</span>
            </div>
            <div className={styles.col}>
              <span className={styles.rateSpan}>Rates</span>
              <div className={styles.rateCol}>
                <div>
                  1{tokenA.symbol} = {rounded(firstAmount / secondAmount, 5)}{tokenB.symbol}
                </div>
                <div>
                  1{tokenB.symbol} = {rounded(secondAmount / firstAmount, 5)}{tokenA.symbol}
                </div>
              </div>
            </div>
            <div className={styles.col}>
              <span>Share of Pool:</span>
              <span className="ml-auto mr-0">{lpPercent.toFixed(15)}%</span>
            </div>
          </div>
          <div className={cn(styles.confirmBtn, " btn-hover btn-back-gradient")} onClick={() => clickSupply()}>
            <span hidden={doingSupply}>Confirm Supply</span>
            <img hidden={!doingSupply} src="/assets/images/EllipsisSpinner3.svg" alt="" />
          </div>
        </ModalBody>
      </Modal>}
      <Link to="/portfolio?tab=wallet" id="goto_portfolio" hidden={true}>Go to portfolio</Link>
    </>
  );
}

export default ConfirmSupply

