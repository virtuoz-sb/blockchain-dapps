import React, { useState, useEffect } from "react";
import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'

import maticPng from "../../../assets/img/icons/networks/polygon-network.jpg"
import cifiPng from "../../../assets/img/icons/anyswap.png"
import wethPng from "../../../assets/img/icons/coins/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"

import chartImg from "./chart.svg"
import chartAreaImg from "./chart-area-animate.svg"
import loadSvg from "../../../assets/img/icons/svg/rotate.svg"
import refreshSvg from "../../../assets/img/icons/svg/refresh.svg"
import plusSvg from "../../../assets/img/icons/svg/plus.svg"
import settingSvg from "../../../assets/img/icons/svg/setting.svg"
import changeSvg from "../../../assets/img/icons/svg/change.svg"


import Icon from "../../../parts/Icon";
import { coins } from "../coins";

import ChartDetail from "./chartDetail"
import { getRandomArbitrary } from "../../../common/libs/functions";
import { wethAddr } from "../../../common/libs/constant";

let initData:any = [
    {
        x: new Date(1538778600000),
        y: [6629.81, 6650.5, 6623.04, 6633.33]
    },
    {
        x: new Date(1538780400000),
        y: [6632.01, 6643.59, 6620, 6630.11]
    },
    {
        x: new Date(1538782200000),
        y: [6630.71, 6648.95, 6623.34, 6635.65]
    },
    {
        x: new Date(1538784000000),
        y: [6635.65, 6651, 6629.67, 6638.24]
    },
    {
        x: new Date(1538785800000),
        y: [6638.24, 6640, 6620, 6624.47]
    },
    {
        x: new Date(1538787600000),
        y: [6624.53, 6636.03, 6621.68, 6624.31]
    },
    {
        x: new Date(1538789400000),
        y: [6624.61, 6632.2, 6617, 6626.02]
    },
    {
        x: new Date(1538791200000),
        y: [6627, 6627.62, 6584.22, 6603.02]
    },
    {
        x: new Date(1538793000000),
        y: [6605, 6608.03, 6598.95, 6604.01]
    },
    {
        x: new Date(1538794800000),
        y: [6604.5, 6614.4, 6602.26, 6608.02]
    },
    {
        x: new Date(1538796600000),
        y: [6608.02, 6610.68, 6601.99, 6608.91]
    },
    {
        x: new Date(1538798400000),
        y: [6608.91, 6618.99, 6608.01, 6612]
    },
    {
        x: new Date(1538800200000),
        y: [6612, 6615.13, 6605.09, 6612]
    },
    {
        x: new Date(1538802000000),
        y: [6612, 6624.12, 6608.43, 6622.95]
    },
    {
        x: new Date(1538803800000),
        y: [6623.91, 6623.91, 6615, 6615.67]
    },
    {
        x: new Date(1538805600000),
        y: [6618.69, 6618.74, 6610, 6610.4]
    },
    {
        x: new Date(1538807400000),
        y: [6611, 6622.78, 6610.4, 6614.9]
    },
    {
        x: new Date(1538809200000),
        y: [6614.9, 6626.2, 6613.33, 6623.45]
    },
    {
        x: new Date(1538811000000),
        y: [6623.48, 6627, 6618.38, 6620.35]
    },
    {
        x: new Date(1538812800000),
        y: [6619.43, 6620.35, 6610.05, 6615.53]
    },
    {
        x: new Date(1538814600000),
        y: [6615.53, 6617.93, 6610, 6615.19]
    },
    {
        x: new Date(1538816400000),
        y: [6615.19, 6621.6, 6608.2, 6620]
    },
    {
        x: new Date(1538818200000),
        y: [6619.54, 6625.17, 6614.15, 6620]
    },
    {
        x: new Date(1538820000000),
        y: [6620.33, 6634.15, 6617.24, 6624.61]
    },
    {
        x: new Date(1538821800000),
        y: [6625.95, 6626, 6611.66, 6617.58]
    },
    {
        x: new Date(1538823600000),
        y: [6619, 6625.97, 6595.27, 6598.86]
    },
    {
        x: new Date(1538825400000),
        y: [6598.86, 6598.88, 6570, 6587.16]
    },
    {
        x: new Date(1538827200000),
        y: [6588.86, 6600, 6580, 6593.4]
    },
    {
        x: new Date(1538829000000),
        y: [6593.99, 6598.89, 6585, 6587.81]
    },
    {
        x: new Date(1538830800000),
        y: [6587.81, 6592.73, 6567.14, 6578]
    },
    {
        x: new Date(1538832600000),
        y: [6578.35, 6581.72, 6567.39, 6579]
    },
    {
        x: new Date(1538834400000),
        y: [6579.38, 6580.92, 6566.77, 6575.96]
    },
    {
        x: new Date(1538836200000),
        y: [6575.96, 6589, 6571.77, 6588.92]
    },
    {
        x: new Date(1538838000000),
        y: [6588.92, 6594, 6577.55, 6589.22]
    },
    {
        x: new Date(1538839800000),
        y: [6589.3, 6598.89, 6589.1, 6596.08]
    },
    {
        x: new Date(1538841600000),
        y: [6597.5, 6600, 6588.39, 6596.25]
    },
    {
        x: new Date(1538843400000),
        y: [6598.03, 6600, 6588.73, 6595.97]
    },
    {
        x: new Date(1538845200000),
        y: [6595.97, 6602.01, 6588.17, 6602]
    },
    {
        x: new Date(1538847000000),
        y: [6602, 6607, 6596.51, 6599.95]
    },
    {
        x: new Date(1538848800000),
        y: [6600.63, 6601.21, 6590.39, 6591.02]
    },
    {
        x: new Date(1538850600000),
        y: [6591.02, 6603.08, 6591, 6591]
    },
    {
        x: new Date(1538852400000),
        y: [6591, 6601.32, 6585, 6592]
    },
    {
        x: new Date(1538854200000),
        y: [6593.13, 6596.01, 6590, 6593.34]
    },
    {
        x: new Date(1538856000000),
        y: [6593.34, 6604.76, 6582.63, 6593.86]
    },
    {
        x: new Date(1538857800000),
        y: [6593.86, 6604.28, 6586.57, 6600.01]
    },
    {
        x: new Date(1538859600000),
        y: [6601.81, 6603.21, 6592.78, 6596.25]
    },
    {
        x: new Date(1538861400000),
        y: [6596.25, 6604.2, 6590, 6602.99]
    },
    {
        x: new Date(1538863200000),
        y: [6602.99, 6606, 6584.99, 6587.81]
    },
    {
        x: new Date(1538865000000),
        y: [6587.81, 6595, 6583.27, 6591.96]
    },
    {
        x: new Date(1538866800000),
        y: [6591.97, 6596.07, 6585, 6588.39]
    },
    {
        x: new Date(1538868600000),
        y: [6587.6, 6598.21, 6587.6, 6594.27]
    },
    {
        x: new Date(1538870400000),
        y: [6596.44, 6601, 6590, 6596.55]
    },
    {
        x: new Date(1538872200000),
        y: [6598.91, 6605, 6596.61, 6600.02]
    },
    {
        x: new Date(1538874000000),
        y: [6600.55, 6605, 6589.14, 6593.01]
    },
    {
        x: new Date(1538875800000),
        y: [6593.15, 6605, 6592, 6603.06]
    },
    {
        x: new Date(1538877600000),
        y: [6603.07, 6604.5, 6599.09, 6603.89]
    },
    {
        x: new Date(1538879400000),
        y: [6604.44, 6604.44, 6600, 6603.5]
    },
    {
        x: new Date(1538881200000),
        y: [6603.5, 6603.99, 6597.5, 6603.86]
    },
    {
        x: new Date(1538883000000),
        y: [6603.85, 6605, 6600, 6604.07]
    },
    {
        x: new Date(1538884800000),
        y: [6604.98, 6606, 6604.07, 6606]
    },
]

function Chart({receiveCoin, payCoin, reverseExchange } : any) {

    const tokenPay = useAppSelector((state: RootState) => state.swapSlice.tokenPay)
    const tokenBuy = useAppSelector((state: RootState) => state.swapSlice.tokenBuy)

    const timeIntervals = ['5m', '15m', '1H', '4H', '1D', '1W']
    const [showAreaChart, setShowAreaChart] = useState<boolean>(true)

    const [seriesData, setSeriesData] = useState<any>([])

    const [chartLoaded, setChartLoaded] = useState<boolean>(false)
    
    useEffect(() => {
        resetChart()

        setTimeout(() => {
            setChartLoaded(true)
        }, 3000);
      }, []);
    
    const resetChart = () => {
        getPriceData()
        setTimeout(() => {
            resetChart()
        }, 5000);
    }

    const getPriceData = () => {
        const defaultQuery = {
            query: `
                query ethereum($tokenA: String!, $tokenB: String!){
                    ethereum(network: bsc_testnet) {
                        dexTrades(
                        options: {limit: 100000, asc: "timeInterval.minute"}
                        date: {since: "2021-05-23"}
                        baseCurrency: {is: $tokenA}
                        quoteCurrency: {is: $tokenB}
                        ) {
                        timeInterval {
                            minute(count: 5, format: "%Y-%m-%d %H:%M:%S")  
                        }
                        maximum_price: quotePrice(calculate: maximum)
                        minimum_price: quotePrice(calculate: minimum)
                        open_price: minimum(of: block, get: quote_price)
                        close_price: maximum(of: block, get: quote_price)
                        }
                    }
                }                  
            `,
            variables: {
                tokenA : tokenPay.isCoin ? wethAddr : tokenPay.address,
                tokenB : tokenBuy.isCoin ? wethAddr : tokenBuy.address
                // contractAddress: contractAddress[connectedNetwork].FamosoFactory,
            },
        } 
        return fetch(' https://graphql.bitquery.io/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(defaultQuery),
        })
        .then((res) => res.json())
        .then((result) => {
            // console.log("price data", result.data)
            if(result.data && result.data.ethereum && result.data.ethereum.dexTrades){
                let tmpData: any = []
                result.data.ethereum.dexTrades.map((item: any) => {
                    tmpData = [...tmpData, {
                        x: new Date(item.timeInterval.minute),
                        y: [Number(item.open_price).toFixed(2), Number(item.maximum_price).toFixed(2), Number(item.minimum_price).toFixed(2), Number(item.close_price).toFixed(2)]
                    }]
                })
                setSeriesData(tmpData)
            }
        })
        .catch((err: any) => {})
    }

    useEffect(() => {
        getPriceData()
    }, [tokenPay, tokenBuy])

    return (
        <div className="flex-col sp-hide">
            <div className="flex w-100 mb-4 pb-4">
                <div className="m-auto-v">
                    <img src={receiveCoin.logoURI} className="size-40px rounded-50" alt="" />
                    <img src={payCoin.logoURI} className="size-40px rounded-50 coin-icon-child" alt="" />
                </div>
                <div className="dropdown flex mx-2 m-auto-v" id="lang-sel-dropdown">
                    <div className="dropdown-toggle after-none flex m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {receiveCoin.symbol + "/" + payCoin.symbol}
                        <span className="m-auto-v">
                            <i className="icofont-thin-down"></i>
                        </span>
                    </div>
                    <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                        <div
                            onClick={() => reverseExchange()}
                            className="dropdown-item pointer rounded p-2 hover-white hover-back-dark fc-dark">
                            {receiveCoin.symbol + "/" + payCoin.symbol}
                        </div>
                        <div
                            onClick={() => reverseExchange()}
                            className="dropdown-item pointer rounded p-2 hover-white hover-back-dark fc-dark">
                            {payCoin.symbol + "/" + receiveCoin.symbol}
                        </div>
                    </div>
                </div>
                <div className="flex right">
                    <p className="m-auto-v mr-4">Candle Period:</p>
                    <div className="flex item-center">
                        {
                            timeIntervals.map((item: any, index: any) =>
                                <div className="pointer m-2 text-base" key={index}>
                                    {item}
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="flex">
                    <Icon 
                        name="candle-chart" 
                        onClick={() => setShowAreaChart(false)}
                        fill="#fff" 
                        className="m-auto-v mx-2 pointer" 
                        size="24" 
                        viewBox="0 0 24 24" />
                    <Icon 
                        name="linear-chart" 
                        onClick={() => setShowAreaChart(true)}
                        fill="#fff" 
                        className="m-auto-v mx-2 pointer" 
                        size="24" 
                        viewBox="0 0 24 24" />
                </div>
            </div>
            <div className="flex mb-4 pb-4" hidden={true}>
                <p className="fs-32 m-auto-v">1894.2598019791124</p>
                <p className="btn-success rounded m-auto-v px-1 mx-2">1.77%</p>
            </div>
            <div className="my-4 py-4">
                <div className="mt-4 pt-4 over-hide" hidden={chartLoaded}>
                    <img src={showAreaChart === true ? chartAreaImg : chartImg} style={{ height: "300px" }} alt="" className="mt-4 light-svg-dark" />
                </div>
                <div className="over-hide" hidden={!chartLoaded}>
                    <ChartDetail data={seriesData} chartType={showAreaChart ? "area" : "candlestick"}/>
                </div>
            </div>

        </div>
    )
}

export default Chart;
