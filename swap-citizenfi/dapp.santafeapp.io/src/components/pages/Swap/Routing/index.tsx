import React, { useState, useEffect } from "react";
import cn from "classnames";
import scanSvg from "../../../../assets/img/icons/svg/scan.svg"

import maticPng from "../../../../assets/img/icons/networks/polygon-network.jpg"
import cifiPng from "../../../../assets/img/icons/anyswap.png"
import usdtPng from "../../../../assets/img/icons/coins/0xdac17f958d2ee523a2206206994597c13d831ec7.png"
import wethPng from "../../../../assets/img/icons/coins/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"

function Routing() {
    
    return (
        <div className="flex-col p-2">
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
        </div>
    )
}

export default Routing;
