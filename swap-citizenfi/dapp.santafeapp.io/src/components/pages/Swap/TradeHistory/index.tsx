import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./TradeHistory.module.sass"

import famoso_pro   from "../../../../assets/img/icons/providers/famoso.png"

import { convertSecond2DateTime, convertSecond2DateTimeSwapHistory, isInteger, isSameAddress } from "../../../common/libs/functions"

import { useAppContext } from "../../../common/libs/context";

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { getTradeData } from "../swapSlice";

import { wethAddr } from "../../../common/libs/constant";

function TradeHistory() {
    const dispatch = useAppDispatch()
    const { connectedNetwork } = useAppContext()
    const tradeHistory = useAppSelector((state: RootState) => state.swapSlice.tradeHistory)
    const tokenPay = useAppSelector((state: RootState) => state.swapSlice.tokenPay)
    const tokenBuy = useAppSelector((state: RootState) => state.swapSlice.tokenBuy)
    const curTimeStamp = useAppSelector((state: RootState) => state.app.curTimeStamp)
    
    useEffect(() => {
        dispatch(getTradeData())
    }, [])
 
    const openScan = (tx: any) => {
        window.open('https://mumbai.polygonscan.com/tx/' + String(tx).substring(0, 66))
    }

    return (
        <div className={styles.trade_history}>
            <div className="flex text-lg mb-4">
                {/* <div className="white pointer mr-2">
                    Exchanges
                </div> */}
                <div className="pointer white">
                    Swap History ({tokenPay.symbol + "/" + tokenBuy.symbol})
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Market</th>
                        <th>Trade Price</th>
                        <th>Sold</th>
                        <th>Bought</th>
                        <th>Age</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tradeHistory.map((item: any, index: any) => 
                            <tr
                                className={cn("py-2 pointer", styles.tradeRow)}
                                key={index}
                                onClick={() => openScan(item.id)}
                                >
                                <td className="flex fc-dark" title="Famoso Swap">
                                    <span className={"buy_sel " + ((isSameAddress(item.pay.id, tokenPay.address) || (isSameAddress(item.pay.id, wethAddr[connectedNetwork])&&tokenPay.isCoin)) ?"sel" : "buy")}></span>
                                    <img src={famoso_pro} alt="" className="size-32px m-auto-v mr-2" />
                                    <div className="flex sp-flex-col flex-wrap">
                                        {/* <span className="m-auto-v mx-2 no-wrap white">
                                            Famoso
                                        </span> */}
                                        <span className="pc-hide mx-2">
                                            -----
                                        </span>
                                    </div>
                                </td>
                                <td className="fc-dark">
                                    <span className="my-auto">
                                        {
                                            Number(item.price).toFixed(2) + " " + item.pay.symbol + "/" + item.buy.symbol
                                        }
                                    </span>
                                </td>
                                <td className="fc-dark">
                                    <span className="my-auto">
                                    {Number(item.payAmount).toFixed(3) + " " + item.pay.symbol}
                                    </span>
                                </td>
                                <td className="fc-dark">
                                    <span className="my-auto">
                                    {Number(item.buyAmount).toFixed(3) + " " + item.buy.symbol}
                                    </span>
                                </td>
                                <td className="fc-dark">
                                    <span className="my-auto">
                                    {convertSecond2DateTimeSwapHistory(curTimeStamp/1000.0 - item.timestamp)}
                                    </span>
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default TradeHistory;
