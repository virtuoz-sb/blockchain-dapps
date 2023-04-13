import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./PoolRow.module.sass";
import Icon from "../../../../parts/Icon";

import { useAppContext } from "../../../../common/libs/context";
import { RootState } from '../../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../../app/hook'
import { connectToMetamask } from "../../../../common/libs/ConnectWallet/connectWalletSlice";

import SupplyStake from "./SupplyStake";
import contracts, { contractAddress } from "../../../../../contracts";
import { approveErc20, balanceErc20 } from "../../../../common/libs/functions/integrate";
import { bestGas, bestGasPrice } from "../../../../common/libs/constant";
import { rounded } from "../../../../common/libs/functions";
import { openNotification } from "../../../../../app/reducers/appSlice";
import { setLiquidityCount } from "../../../Swap/swapSlice";

const PoolRow = ({ className, item }: any) => {
  const dispatch  = useAppDispatch()
  const {isConnected, onConnectWallet, walletAddress, isCorrectNet, connectedNetwork} = useAppContext()

  const swapCount = useAppSelector((state: RootState) => state.swapSlice.swapCount)
  const liquidityCount = useAppSelector((state: RootState) => state.swapSlice.liquidityCount)
  
  const [visible, setVisible] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false)

  const [approved, setApproved] = useState<boolean>(false)
  const [doingApprove, setDoingApprove] = useState<boolean>(false)
  const [doingWithdraw, setDoingWithdraw] = useState<boolean>(false)
  const [mySupply, setMySupply] = useState<any>(0)
  const [doingHarvest, setDoingHarvest] = useState<boolean>(false)
  const [rewarded, setRewarded] = useState<any>(0)
  const [apr, setApr] = useState<any>("-")
  const [liquidityTotal, setLiquidityTotal] = useState<any>("-")

  const _item: any = {
      tokenA: {
          symbol: "CIFI",
          address: "0x19623D433cAa0Cb8e56F42A368d7C7426180DC06",
          logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/10129.png"
      },
      tokenB: {
          symbol: "MATIC",
          address: "0x86652c1301843B4E06fBfbBDaA6849266fb2b5e7",
          logoURI: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png"
      },
  }

  const cols = [
      {
          title: 'Earned',
          desc: 0
      },
      {
          title: 'APR',
          desc: '-',//'42.63%',
          icon: 'calc'
      },
      {
          title: 'Liquidity',
          desc: '-',//'$322,948.399',
          icon: 'info-mark'
      },
      // {
      //     title: 'Multiplier',
      //     desc: '40x',
      //     icon: ''
      // }
  ]

  const arr_num = [0, 1, 2]

  const clickEnableStake = () => {
    if(doingApprove) return
    if(approved === true)
      setShowStakeModal(true)
    else{
      setDoingApprove(true)
      let spender: any = contractAddress[connectedNetwork].FamosoStaking
      if(item.single === true) spender = contractAddress[connectedNetwork].CifiStaking
      approveErc20(item.id, spender, walletAddress)
      .then((res: any) => {
        setApproved(true)
        setDoingApprove(false)
      })
      .catch((err: any) => {
        setDoingApprove(false)
      })
    }
  }

  useEffect(() => {
    if (window.web3 && window.web3.eth) {
      checkApproved()
      getStakingInfo()
    }
  }, [swapCount, liquidityCount])

  const getStakingInfo = () => {
    if(item.single === false){
      const famosoStaking = new window.web3.eth.Contract(contracts.abis.FamosoStaking, contractAddress[connectedNetwork].FamosoStaking)
      return getStakingInfoHandler(famosoStaking, contractAddress[connectedNetwork].FamosoStaking)
    }else{
      const CifiStaking = new window.web3.eth.Contract(contracts.abis.CifiStaking, contractAddress[connectedNetwork].CifiStaking)
      return getStakingInfoHandler(CifiStaking, contractAddress[connectedNetwork].CifiStaking)
    }
  }

  const getStakingInfoHandler = (StakingContract: any, contractAddr: any) => {
    StakingContract.methods.userInfo(walletAddress)
    .call()
    .then((res: any) => {
        console.log("staking info", res)
        setMySupply(Number(res.amount)/(10**18))
        setRewarded(Number(res.rewarded)/(10**18))
    })
    .catch((err: any)  => {
        console.log("staking info", err)
    })

    //calc APR from rewardPerSec
    StakingContract.methods.rewardPerSec()
    .call()
    .then((res: any) => {
        console.log("staking info", res)
        setApr(Number(res) / (10**18) * 3600 * 24 * 365 )
    })
    .catch((err: any)  => {
        console.log("staking info", err)
    })

    const TokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, item.id)
    TokenContract.methods.totalSupply()
    .call()
    .then((res: any) => {
        console.log("staking info", res)
        setLiquidityTotal(Number(res) / (10**18) )
    })
    .catch((err: any)  => {
        console.log("staking info", err)
    })

    //get liquidity balance of staking pool
    // balanceErc20(item.id, contractAddr)
    // .then((res: any) => {
    //   setLiquidityTotal(Number(res) / (10**18))
    // })
    // .catch((err: any) => {

    // })
  }

  const checkApproved = () => {
    if(item.single === false)
      return checkApprovedHandler(contractAddress[connectedNetwork].FamosoStaking)
    else 
    return checkApprovedHandler(contractAddress[connectedNetwork].CifiStaking)
  }

  const checkApprovedHandler = (spender: any) => {
    const tokenContract = new window.web3.eth.Contract(contracts.abis.ERC20, item.id)
    return tokenContract.methods.allowance(walletAddress, spender)
    .call()
    .then((res: any) => {
        const isApproved: boolean = Number(res)/(10**18) >= 500000
        return setApproved(isApproved)
    })
  }

  const clickHarvest = () => {
    if(mySupply > 0){
      const CifiStaking = new window.web3.eth.Contract(contracts.abis.CifiStaking, contractAddress[connectedNetwork].CifiStaking)
      const famosoStaking = new window.web3.eth.Contract(contracts.abis.FamosoStaking, contractAddress[connectedNetwork].FamosoStaking)
      setDoingHarvest(true)
      if(item.single === true)
        return harvestHandler(CifiStaking)
      else return harvestHandler(famosoStaking)
    }else return
  }

  const harvestHandler = (StakingContract: any) => {
    return StakingContract.methods.reward()
      .send({
        from: walletAddress,
        gas: bestGas,
        gasPrice: bestGasPrice
      })
      .then((res: any) => {
        setDoingHarvest(false)
        dispatch(setLiquidityCount(true))
        return dispatch(openNotification(res, "Harvest success"))
      })
      .catch((err: any)  => {
        setDoingHarvest(false)
      })
  }

  const clickWithdraw = () => {
    if(mySupply > 0){
      const CifiStaking = new window.web3.eth.Contract(contracts.abis.CifiStaking, contractAddress[connectedNetwork].CifiStaking)
      const famosoStaking = new window.web3.eth.Contract(contracts.abis.FamosoStaking, contractAddress[connectedNetwork].FamosoStaking)
      setDoingWithdraw(true)
      if(item.single === true)
        return withdrawHandler(CifiStaking)
      else return withdrawHandler(famosoStaking) 
    }else return
  }

  const withdrawHandler = (StakingContract: any) => {
    return StakingContract.methods.withdraw()
    .send({
      from: walletAddress,
      gas: bestGas,
      gasPrice: bestGasPrice
    })
    .then((res: any) => {
      setDoingWithdraw(false)
      setMySupply(0)
      dispatch(setLiquidityCount(true))
      return dispatch(openNotification(res, "Withdraw from staking pool"))
    })
    .catch((err: any)  => {
      console.log("withdraw err", err)
      setDoingWithdraw(false)
    })
  }

  return (
    <div className={cn(className, styles.pool_row, { [styles.active]: visible })}>
      <div className={styles.head} onClick={() => setVisible(!visible)}>
        <div className={styles.title}>
          <div className={cn(styles.logoImg, {[styles.single]:item.single})}>
              <img src={item.token0.logoURI} alt="" />
              <img src={item.token1.logoURI} hidden={item.single} alt="" />
          </div>
          <span className={styles.poolName}>
            {item.token0.symbol + (item.single ? "" : "-" + item.token1.symbol)}
          </span>
        </div>
        <div className={styles.cols}>
            {
                cols.map((col_item: any, col_index: any) => 
                    <div className={styles.col} key={col_index}>
                      {
                        col_index === 1 ?
                        rounded(apr, 2) + " CIFI" :
                        col_index === 2 ?
                        rounded(Number(liquidityTotal), 5) //+ " " + item.token0.symbol + "-" + item.token1.symbol
                        : col_item.desc
                      }
                    </div>
                )
            }
            <div className={styles.detail}>
              <Icon name="arrow-bottom" className={styles.downIcon} size="16" />
            </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.links}>
            <a href="https://dapp.santafeapp.io/swap" hidden={item.single} className={styles.link_item}>
              <span>Get {item.token0.symbol}-{item.token1.symbol} LP</span>
              <Icon name="link" size="16" viewBox="0 0 24 24" />
            </a>
            <a href="https://dapp.santafeapp.io/swap" className={styles.link_item}>
              <span>View Contract</span>
              <Icon name="link" size="16" viewBox="0 0 24 24" />
            </a>
            {/* <a href="https://dapp.santafeapp.io/swap" className={styles.link_item}>
              <span>See Pair Info</span>
              <Icon name="link" size="16" viewBox="0 0 24 24" />
            </a> */}
        </div>
        <div className={styles.actions}>
            <div className={styles.act_item}>
              <div className={styles.title}>
                <span className={styles.rewardToken}>CIFI</span>
                <span>Earned</span>
              </div>
              <div className={styles.contents}>
                <span className={styles.amount}>{rounded(rewarded, 5)}</span>
                <div onClick={() => clickHarvest()} className={cn(styles.btn, "btn-hover", {[styles.active]: mySupply > 0}, {[styles.disabled]: doingHarvest})}>
                  <span hidden={doingHarvest}>Harvest</span>
                  <img hidden={!doingHarvest} src="/assets/images/EllipsisSpinner3.svg" alt="" />
                </div>
                <div onClick={() => clickWithdraw()} className={cn("ml-2", styles.btn, "btn-hover", {[styles.active]: mySupply > 0}, {[styles.disabled]: doingWithdraw})}>
                  <span hidden={doingWithdraw}>Withdraw</span>
                  <img hidden={!doingWithdraw} src="/assets/images/EllipsisSpinner3.svg" alt="" />
                </div>
              </div>
            </div>
            <div className={styles.act_item}>
              <div className={styles.title}>
                <span>Start Farming</span>
              </div>
              <div className={styles.contents}>
                <div 
                  onClick={() => dispatch(connectToMetamask(onConnectWallet))}
                  hidden={isConnected} 
                  className={cn(styles.btn, styles.one, "btn-back-gradient")}>
                  Connect Wallet
                </div>
                <div 
                  onClick={() => clickEnableStake()}
                  hidden={!isConnected} 
                  className={cn(styles.btn, styles.one, styles.enable)}>
                  <span hidden={doingApprove}>{approved === true ? "Supply" : "Approve"}</span>
                  <img hidden={!doingApprove} src="/assets/images/EllipsisSpinner3.svg" alt="" />
                </div>
              </div>
            </div>
        </div>
      </div>
      <SupplyStake 
        isModalOpen={showStakeModal}
        onHide={() => setShowStakeModal(false)}
        pair={item}
      />
    </div>
  );
};

export default PoolRow;
