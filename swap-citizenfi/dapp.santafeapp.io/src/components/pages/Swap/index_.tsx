import React, { useState } from "react";
// import { BrowserRouter, Switch, Route, Link } from "react-router-dom";

// import logoImg from "../../../assets/img/icons/logo_large.png"
// import ethereumImg from "../../../assets/img/icons/networks/ethereum-network.jpg";
// import anySwapImg from "../../../assets/img/icons/anyswap.png"
// import santaFeImg from "../../../assets/img/icons/SantaFe2.png"
// import cifiImg from "../../../assets/img/icons/cifipowa.png"

// import ethPng from "../../../assets/img/icons/coins/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"
// import daiPng from "../../../assets/img/icons/coins/0x6b175474e89094c44da98b954eedeac495271d0f.png"
import maticPng from "../../../assets/img/icons/networks/polygon-network.jpg"
import cifiPng from "../../../assets/img/icons/anyswap.png"
import usdtPng from "../../../assets/img/icons/coins/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
import wethPng from "../../../assets/img/icons/coins/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"

import daiPng   from "../../../assets/img/icons/coins/0x6b175474e89094c44da98b954eedeac495271d0f.png"
import busdPng  from "../../../assets/img/icons/coins/0x4fabb145d64652a948d72533023f6e7a623c7c53.png"
import ethPng   from "../../../assets/img/icons/coins/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png"


// import Chart from "./chart"
// import polygonImg from "../../../assets/img/icons/networks/polygon-network.jpg";
import chartImg from "./chart_static.svg"
import chartAreaImg from "./chart-area-static.svg"
import loadSvg from "../../../assets/img/icons/svg/rotate.svg"
import refreshSvg from "../../../assets/img/icons/svg/refresh.svg"
import plusSvg from "../../../assets/img/icons/svg/plus.svg"
import settingSvg from "../../../assets/img/icons/svg/setting.svg"
import changeSvg from "../../../assets/img/icons/svg/change.svg"
// import connectSvg from "../../../assets/img/icons/svg/connect.svg"
// import loadingPng from "../../../assets/img/icons/svg/loading.png"
// import infoSvg from "../../../assets/img/icons/svg/info.svg"
// import scanSvg from "../../../assets/img/icons/svg/scan.svg"

// import referralSvg from "../../../assets/img/icons/svg/referral.svg"
// import charitySvg from "../../../assets/img/icons/svg/charity.svg"

// import x0_pro   from "../../../assets/img/icons/providers/0x_color.svg"
// import uniswap_pro   from "../../../assets/img/icons/providers/uniswap_color.svg"
// import sushiswap_pro   from "../../../assets/img/icons/providers/sushiswap_color.svg"
// import shiba_pro   from "../../../assets/img/icons/providers/shiba_color.svg"
// import defiswap_pro   from "../../../assets/img/icons/providers/defiswap_color.svg"
// import clipper_pro   from "../../../assets/img/icons/providers/clipper_color.svg"
// import inch_pro   from "../../../assets/img/icons/providers/1inch_color.svg"
// import balancer_pro   from "../../../assets/img/icons/providers/balancer_color.svg"


function Swap() {

    const timeIntervals = ['5m', '15m', '1H', '4H', '1D', '1W']
    const [showAreaChart, setShowAreaChart] = useState<boolean>(false)

    const [isFirst, setIsFirst] = useState<number>(0)
    const [payCoin, setPayCoin] = useState<number>(1)
    const [receiveCoin, setReceiveCoin] = useState<number>(0)

    const pair = [
        {
            icon: cifiPng,
            label: "CIFI"
        },
        {
            icon: maticPng,
            label: "MATIC"
        }
    ]

    const coins =[
        {
            icon: cifiPng,
            label: "CIFI"
        },
        {
            icon: maticPng,
            label: "MATIC"
        },
        {
            icon: daiPng,
            label: "DAI"
        },
        {
            icon: busdPng,
            label: "BUSD"
        },
        {
            icon: ethPng,
            label: "ETH"
        },
        {
            icon: wethPng,
            label: "WETH"
        },
        {
            icon: usdtPng,
            label: "USDT"
        }
    ]

    function reverseExchange(){
        const tmp: number = payCoin
        setPayCoin(receiveCoin)
        setReceiveCoin(tmp)
    }

    // const swapsArr: any = [
    //     {
    //         icon: inch_pro,
    //         label: '1inch',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     },
    //     {
    //         icon: uniswap_pro,
    //         label: 'Uniswap V3',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     },
    //     {
    //         icon: sushiswap_pro,
    //         label: 'Sushiswap',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     },
    //     {
    //         icon: shiba_pro,
    //         label: 'Shibaswap',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     },
    //     {
    //         icon: balancer_pro,
    //         label: 'Balancer V2',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     },
    //     {
    //         icon: defiswap_pro,
    //         label: 'DeFi Swap',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     },
    //     {
    //         icon: x0_pro,
    //         label: '0x',
    //         v_1: "1891.2176886924228",
    //         v_2: "0.000512343",
    //         amount: 12,
    //         usd: 1230034034
    //     }
    // ]

    return (
        <div className="swap-page mn-h-80 p-4 mx-1400 ff-point-cufon">
            <div className="text-center">
                <p className="fs-32 my-2 p-2 white">
                    FAMOSO DECENTRALIZED EXCHANGE
                </p>
                <p className="fc-grey fs-20 my-2 p-2">
                    Swap cryptocurrency and trade derivatives easily on multiple chains
                </p>
            </div>
            <div className="row white">
                <div className="flex-col col-md-8 sp-order-2 p-2">
                    <div className="flex-col sp-hide">
                        <div className="flex w-100 mb-4 pb-4">
                            <div className="m-auto-v">
                                <img src={coins[receiveCoin].icon} className="size-40px rounded-50" alt="" />
                                <img src={coins[payCoin].icon} className="size-40px rounded-50 coin-icon-child" alt="" />
                            </div>
                            <div className="dropdown flex mx-2 m-auto-v" id="lang-sel-dropdown">
                                <div className="dropdown-toggle after-none flex m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    {coins[receiveCoin].label + "/" + coins[payCoin].label}
                                    <span className="m-auto-v">
                                        <i className="icofont-thin-down"></i>
                                    </span>
                                </div>
                                <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                                    <div 
                                        onClick={() => reverseExchange()}
                                        className="dropdown-item pointer rounded p-2 hover-white hover-back-dark fc-dark">
                                        {coins[receiveCoin].label + "/" + coins[payCoin].label}
                                    </div>
                                    <div 
                                        onClick={() => reverseExchange()}
                                        className="dropdown-item pointer rounded p-2 hover-white hover-back-dark fc-dark">
                                        {coins[payCoin].label + "/" + coins[receiveCoin].label}
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
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="m-auto-v mx-2 pointer" 
                                    onClick={() => setShowAreaChart(false)}
                                    id="candlestick_chart" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5 1C5 0.447716 5.44771 0 6 0C6.55229 0 7 0.447716 7 1V2C8.65686 2 10 3.34315 10 5V19C10 20.6569 8.65686 22 7 22V23C7 23.5523 6.55229 24 6 24C5.44771 24 5 23.5523 5 23V22C3.34314 22 2 20.6569 2 19V5C2 3.34315 3.34314 2 5 2V1ZM7 20C7.55229 20 8 19.5523 8 19V5C8 4.44772 7.55229 4 7 4H5C4.44771 4 4 4.44772 4 5V19C4 19.5523 4.44771 20 5 20H7Z" fill="currentColor"></path>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M19 6V5C19 4.44772 18.5523 4 18 4C17.4477 4 17 4.44772 17 5V6C15.3431 6 14 7.34315 14 9V15C14 16.6569 15.3431 18 17 18V19C17 19.5523 17.4477 20 18 20C18.5523 20 19 19.5523 19 19V18C20.6569 18 22 16.6569 22 15V9C22 7.34315 20.6569 6 19 6ZM19 8C19.5523 8 20 8.44772 20 9V15C20 15.5523 19.5523 16 19 16H17C16.4477 16 16 15.5523 16 15V9C16 8.44772 16.4477 8 17 8H19Z" fill="currentColor"></path>
                                </svg>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="m-auto-v mx-2 pointer" 
                                    onClick={() => setShowAreaChart(true)}
                                    id="line_chart" 
                                    width="24" 
                                    height="24" 
                                    viewBox="0 0 24 24" 
                                    fill="none">
                                    <path d="M0 21V13H1L6 8L9 11L16 4L19 7L23 3H24V21H0Z" fill="url(#paint0_linear)"></path>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M23.7071 2.29289C23.3166 1.90237 22.6834 1.90237 22.2929 2.29289L19 5.58579L16.7071 3.29289C16.3166 2.90237 15.6834 2.90237 15.2929 3.29289L9 9.58579L6.70711 7.29289C6.31658 6.90237 5.68342 6.90237 5.29289 7.29289L0.292893 12.2929C-0.0976311 12.6834 -0.0976311 13.3166 0.292893 13.7071C0.683418 14.0976 1.31658 14.0976 1.70711 13.7071L6 9.41421L8.29289 11.7071C8.68342 12.0976 9.31658 12.0976 9.70711 11.7071L16 5.41421L18.2929 7.70711C18.6834 8.09763 19.3166 8.09763 19.7071 7.70711L23.7071 3.70711C24.0976 3.31658 24.0976 2.68342 23.7071 2.29289ZM1 20C0.447715 20 1.49012e-08 20.4477 1.49012e-08 21C1.49012e-08 21.5523 0.447716 22 1 22H23C23.5523 22 24 21.5523 24 21C24 20.4477 23.5523 20 23 20H1Z" fill="currentColor"></path>
                                </svg>
                            </div>
                        </div>
                        <div className="flex mb-4 pb-4" hidden={true}>
                            <p className="fs-32 m-auto-v">1894.2598019791124</p>
                            <p className="btn-success rounded m-auto-v px-1 mx-2">1.77%</p>
                        </div>
                        <div className="my-4 py-4">
                            <div className="mt-4 pt-4 over-hide">
                                <img src={showAreaChart === true ? chartAreaImg : chartImg} style={{height: "300px"}} alt="" className="mt-4 light-svg-dark" />
                            </div>
                        </div>

                    </div>

                    {/* <div className="flex-col p-2">
                        <div className="text-base my-2">
                            <span className="white text-lg bold left">Routing</span>
                            <img src={scanSvg} alt="" className="right svg-white pointer f-s" />
                        </div>
                        <div className="flex my-2">
                            <div className="flex w-100">
                                <div className="flex b-r-dark-2 rel">
                                    <img src={maticPng} className="size-32px rounded-50 m-auto-v mr-2" alt="" />
                                </div>
                                <div className="flex fc-dark">
                                    <div className="flex">
                                        <span className="m-auto-v mx-2">
                                            90%
                                        </span>
                                        <span className="m-auto-v">
                                            <i className="icofont-thin-right"></i>
                                        </span>
                                    </div>
                                    <div className="border-dark rounded-m p-2 flex-col mx-2">
                                        <div className="flex my-1">
                                            <img src={wethPng} alt="" className="size-24px rounded-t0 m-auto-v mr-2" />
                                            <span className="m-auto-v">WETH</span>
                                        </div>
                                        <div className="back-blue-light py-1 px-2 fc-dark rounded my-1">
                                            WETH 100%
                                        </div>
                                    </div>
                                    <div className="flex mx-2">
                                        <span className="m-auto-v">
                                            <i className="icofont-thin-right"></i>
                                        </span>
                                    </div>
                                    <div className="border-dark rounded-m p-2 flex-col mx-2">
                                        <div className="flex my-1">
                                            <img src={usdtPng} alt="" className="size-24px rounded-t0 m-auto-v mr-2" />
                                            <span className="m-auto-v">USDT</span>
                                        </div>
                                        <div className="back-blue-light py-1 px-2 fc-dark rounded my-1">
                                            Uniswap v3 66%
                                        </div>
                                        <div className="back-blue-light py-1 px-2 fc-dark rounded my-1">
                                            PMM4 34%
                                        </div>
                                    </div>
                                </div>

                                <div className="flex b-r-dark-1 rel right">
                                    <img src={cifiPng} className="size-32px rounded-50 m-auto-v ml-2" alt="" />
                                </div>
                            </div>
                        </div>
                    </div> */}
                    {/* <div className="flex-col m-2 p-2">
                        <div className="flex text-lg my-4">
                            <div className="white pointer mr-2">
                                Exchanges
                            </div>
                            <div className="pointer fc-grey ml-2">
                                Swap History (MATIC/CIFI)
                            </div>
                        </div>

                        <div className="flex-col">
                            <div className="flex my-2">
                                <div className="fc-dark w-3-1 sp-hide">Name</div>
                                <div className="fc-dark w-3-1 pointer sp-w-3-2">
                                    <span className="white">ETH/DAI</span>
                                    <span className="m-auto-v mx-2">
                                        <i className="icofont-thin-down"></i>
                                    </span>
                                </div>
                                <div className="fc-dark w-3-1">Diff</div>
                            </div>
                            {
                                swapsArr.map((item: any, index: any) => 
                                    <div className="flex my-2 py-2">
                                        <div className="flex flex-no-wrap fc-dark w-3-1 sp-w-3-2">
                                            <img src={item.icon} alt="" className="size-32px m-auto-v mr-2" />
                                            <div className="flex sp-flex-col flex-wrap">
                                                <span className="m-auto-v mx-2 no-wrap white">
                                                    {item.label}
                                                </span>
                                                <span className="pc-hide mx-2">
                                                    -----
                                                </span>
                                            </div>
                                        </div>
                                        <div className="fc-dark w-3-1 sp-hide">
                                            -----
                                        </div>
                                        <div className="fc-dark w-3-1">---</div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                 */}
                </div>
                <div className="flex-col col-md-4 sp-order-1">
                    <div className="flex-col bd-shiny on rounded-x btn-back-gradient p-4">
                        <div className="flex">
                            <div className="flex c-white">
                                <span className="m-auto-v mr-4">Swap</span>
                                <span className="m-auto-v mr-4">Derivatives</span>
                            </div>
                            <div className="flex right">
                                <div className="m-2 p-1 rounded pointer back-dark6 size-32px flex"><img src={loadSvg}    className="img-white m-auto" alt="" /></div>
                                <div className="m-2 p-1 rounded pointer back-dark6 size-32px flex"><img src={refreshSvg} className="img-white m-auto" alt="" /></div>
                                <div className="m-2 p-1 rounded pointer back-dark6 size-32px flex"><img src={plusSvg}    className="img-white m-auto w-mx-100p" alt="" /></div>
                                <div className="m-2 p-1 rounded pointer back-dark6 size-32px flex"><img src={settingSvg} className="img-white m-auto" alt="" /></div>
                            </div>
                        </div>
                        <div className="flex-col">
                            <p className="c-white text-lg bold mb-1">You Pay</p>
                            <div className="back-dark7 flex-col rounded-m p-3">
                                <div className="flex">
                                    <span className="left fc-dark">Polygon</span>
                                    <span className="right fc-dark">
                                        {/* ~$1990 */}
                                        ---
                                    </span>
                                </div>
                                <div className="flex flex-no-wrap white">
                                    {/* <div className="flex flex-no-wrap mr-2">
                                        <img src={maticPng} className="size-32px rounded-50" alt="" />
                                        <span className="m-auto-v mx-1 pointer">MATIC</span>
                                        <span className="m-auto-v">
                                            <i className="icofont-thin-down"></i>
                                        </span>
                                    </div> */}
                                    <div className="dropdown flex mx-2 m-auto-v" id="lang-sel-dropdown">
                                        <div className="dropdown-toggle after-none flex flex-no-wrap  m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <img src={coins[payCoin].icon} className="size-40px rounded-50" alt="" />
                                            <span className="m-auto-v mx-1 pointer">{coins[payCoin].label}</span>
                                            <span className="m-auto-v">
                                                <i className="icofont-thin-down"></i>
                                            </span>
                                        </div>
                                        <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                                            {
                                                coins.map((item: any, index: number) => 
                                                    <div 
                                                        onClick={() => index === receiveCoin ? {} : setPayCoin(index)}
                                                        key={index}
                                                        className="dropdown-item pointer rounded flex flex-no-wrap p-2 hover-white hover-back-dark fc-dark">
                                                        <img src={item.icon} alt="" className="size-24px rounded-50" />
                                                        <span className="m-auto-v mx-2">{item.label}</span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    <input type="text" className="right m-auto-v white blank-box w-fill sp-mx-w-160" placeholder="0.0" />
                                </div>
                            </div>
                        </div>
                        <div className="text-center flex my-2" onClick={() => reverseExchange()}>
                            <img src={changeSvg} alt="" className="m-auto-v img-white pointer" />
                            {/* <img src={loadingPng} alt="" /> */}
                        </div>
                        <div className="flex-col mb-4">
                            <p className=" c-white text-lg bold mb-1">You Receive</p>
                            <div className="back-dark7 flex-col rounded-m p-3">
                                <div className="flex">
                                    <span className="left fc-dark">Citizen Finance</span>
                                    <span className="right fc-dark">
                                        {/* ~$1990 */}
                                        ---
                                    </span>
                                </div>
                                <div className="flex flex-no-wrap">
                                    <div className="dropdown flex mx-2 m-auto-v" id="lang-sel-dropdown">
                                        <div className="dropdown-toggle after-none flex flex-no-wrap  m-auto-v pointer" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <img src={coins[receiveCoin].icon} className="size-40px rounded-50" alt="" />
                                            <span className="m-auto-v mx-1 pointer">{coins[receiveCoin].label}</span>
                                            <span className="m-auto-v">
                                                <i className="icofont-thin-down"></i>
                                            </span>
                                        </div>
                                        <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                                            {
                                                coins.map((item: any, index: number) => 
                                                    <div 
                                                        key={index}
                                                        onClick={() => index === payCoin ? {} : setReceiveCoin(index)}
                                                        className="dropdown-item pointer rounded flex flex-no-wrap p-2 hover-white hover-back-dark fc-dark">
                                                        <img src={item.icon} alt="" className="size-24px rounded-50" />
                                                        <span className="m-auto-v mx-2">{item.label}</span>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <input type="text" className="right m-auto-v blank-box w-fill white sp-mx-w-160" placeholder="0.0" />
                                </div>
                            </div>
                        </div>
                        {/* <div className="flex text-center back-blue1 p-2 my-4 rounded-m pointer">
                            <img className="m-auto-v mx-2" src={connectSvg} alt="" />
                            <span className="m-auto-v">Connect Wallet</span>
                        </div> */}
                        <div className="flex text-center btn-back-gradient-reverse p-2 my-2 rounded-m pointer c-white">
                            {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
                            <span className="m-auto-v">Give permission to swap MATIC</span>
                            <i className="m-auto-v mx-2 icofont-question-circle"></i>
                        </div>
                        <div className="flex text-center back-blue1 p-2 my-2 rounded-m pointer c-white">
                            {/* <img className="m-auto-v mx-2" src={connectSvg} alt="" /> */}
                            <span className="m-auto-v">Insufficient balance</span>
                        </div>
                        <div className="flex-col border-dark p-3 rounded-m my-4">
                            <div className="flex my-1">
                                <span className=" c-white left">
                                    Sell price
                                </span>
                                <div className="fc-dark right">
                                    <div>
                                        <span className="fc-dark">1 MATIC = </span>
                                        <span className=" c-white">--- </span>
                                        <span className="fc-dark">CIFI</span>
                                    </div>
                                    <div className="right text-sm">
                                        <span className="fc-dark">---</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex my-1">
                                <span className=" c-white left">
                                    Buy price
                                </span>
                                <div className="fc-dark right">
                                    <div>
                                        <span className="fc-dark">1 CIFI = </span>
                                        <span className=" c-white">--- </span>
                                        <span className="fc-dark">MATIC</span>
                                    </div>
                                    <div className="right text-sm">
                                        <span className="fc-dark">---</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex my-1">
                                <span className=" c-white left">
                                    Transaction cost
                                </span>
                                <div className="fc-dark right">
                                    <div>
                                        <span className=" c-white">≈ ---</span>
                                    </div>
                                    <div className="right text-sm">
                                        <span className="fc-dark">--- Ξ</span>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="flex my-1 text-base">
                                <span className="fc-dark left flex">
                                    <span>You save</span><span>
                                        <img src={infoSvg} className="m-auto-v mx-1 f-s" alt="" /></span>
                                </span>
                                <div className="fc-dark right">
                                    <div>
                                        <span className="fc-green">≈ ---</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        {/* <div className="flex back-dark7 my-4 p-1 rounded-m">
                            <div className="back-dark8 text-lg pointer rounded p-2 w-3-1 text-center">
                                Max return
                            </div>
                            <div className="back-dark8 text-lg pointer rounded p-2 w-3-1 text-center">
                                Lowest gas
                            </div>
                            <div className="back-dark8 text-lg pointer rounded p-2 w-3-1 text-center">
                                OTC
                            </div>
                        </div> */}
                    </div>
                    {/* <div className="flex-col my-4">
                        <div className="flex flex-no-wrap my-2">
                            <div className="p-2">
                                <img src={cifiImg} className="rounded-50 m-auto w-3vw" alt="" />
                            </div>
                            <div className="p-1 m-auto-v fc-dark">
                                Transactions on dapp.santafeapp.io are up to 42% cheaper because of using CIFI token.  Read more about Citizen Finance's CIFI token innovation.
                            </div>
                        </div>
                        <div className="flex flex-no-wrap my-2">
                            <div className="p-2">
                                <img src={referralSvg} className="m-auto w-3vw" alt="" />
                            </div>
                            <div className="p-1 m-auto-v fc-dark">
                                Connect wallet to generate referral link. How it works? Read more.
                            </div>
                        </div>
                        <div className="flex flex-no-wrap my-2">
                            <div className="p-2">
                                <img src={charitySvg} className="m-auto w-3vw" alt="" />
                            </div>
                            <div className="p-1 m-auto-v fc-dark">
                                Donate Crypto to Charities <br />
                                Thanks to SantaFe’s partnership with The Giving Block, you can donate bitcoin and other cryptocurrencies to a non-profit. View Charities
                            </div>
                        </div>
                    </div>
                */}
                </div>
            </div>
        </div>
    )
}

export default Swap;
