import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { classImgArr, loaderSpinnerSvg } from "../../common/libs/image"
import { RootState } from '../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../app/hook'
import { clickTab, setSaleList, initPage, clickSort, loadMore, setTabs } from "./marketSlice"
import { getBalanceStr } from "../../common/libs/functions";
import { setActiveHeaderMenu } from "../../../app/reducers/appSlice";

import cn from "classnames"
import styles from './Market.module.sass'
import ImageObject from "../../../segments/Image/ImageObject";
import { contractAddress } from "../../../contracts";
import { useAppContext } from "../../common/libs/context";

import class6Img   from "../../../assets/img/dragons/tinified/Foreverwing_6.jpg"
import olympicImg  from "../../../assets/img/icons/Olympic_God.jpg"

const holderArr: any = [
    {
        label: "New listing",
        link: ""
    },
    {
        label: "Old listing",
        link: ""
    },
    {
        label: "Highest",
        link: ""
    },
    {
        label: "Lowest",
        link: ""
    },
    {
        label: "Auctions (coming soon)",
        link: ""
    }
]

function Market() {
    const dispatch = useAppDispatch()
    const { connectedNetwork } = useAppContext()
    const activeTab = useAppSelector((state: RootState) => state.market.activeTab)
    const loadingMore = useAppSelector((state: RootState) => state.market.loadingMore)
    const isLoaded = useAppSelector((state: RootState) => state.market.isLoaded)
    const sortOrder = useAppSelector((state: RootState) => state.market.sortOrder)
    const pageId = useAppSelector((state: RootState) => state.market.pageId)
    const saleList = useAppSelector((state: RootState) => state.market.saleList)
    const tabArr = useAppSelector((state: RootState) => state.market.tabs)

    const [defaultTabs, setDefaultTabs]  = useState<Array<any>>([])

    useEffect(() => {
        let tbs: Array<any> = [
            {
                label: 'All',
                icon: false,
                img: classImgArr[6],
                addr: '0x'
            },
            {
                label: 'Kainu',
                icon: true,
                img: class6Img,
                addr: contractAddress[connectedNetwork].SantaV1.toLowerCase()
            },
            {
                label: 'Olympic2020',
                icon: true,
                img: olympicImg,
                addr: contractAddress[connectedNetwork].SantaV2.toLowerCase()
            },
            {
                label: 'META',
                icon: true,
                img: "/assets/img/blindbox/1.jpg",
                addr: contractAddress[connectedNetwork].LootBox.toLowerCase()
            }
        ]
        dispatch(setTabs(tbs))
    }, [connectedNetwork])

    const url = window.location.pathname;
    useEffect(() => {
        if(!isLoaded){
            dispatch(initPage(connectedNetwork, defaultTabs))
            dispatch(setActiveHeaderMenu(30))
        }
    }, [dispatch, url])



    function selectTab(index: any) {
        console.log("select tab index", index)
        dispatch(setSaleList([]))
        dispatch(clickTab(index, tabArr[index].addr, sortOrder, connectedNetwork))
    }

    return (
        <div className="swap-page mn-h-80 mx-1250 py-4 my-4">
            <div className="flex p-3">
                <div className="left white fs-20 ff-point-cufon">
                    <i className="icofont-search-1 mr-2"></i>
                    <span className="bold ">Explore</span>
                </div>
                <div className="dropdown right flex mx-2 m-auto-v" id="lang-sel-dropdown">
                    <div className="dropdown-toggle ff-point-cufon after-none flex m-auto-v pointer white" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {holderArr[sortOrder].label}
                        <span className="m-auto-v">
                            <i className="icofont-thin-down"></i>
                        </span>
                    </div>
                    <div className="dropdown-menu dropdown-menu-right bd-shiny on btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                        {
                            holderArr.map((item: any, index: any) =>
                                <div 
                                    key={index} 
                                    onClick={() => index < 4 ? dispatch(clickSort(index, tabArr[activeTab].addr, connectedNetwork)) : {}} 
                                    className={"dropdown-item pointer rounded p-2 hover-white hover-back-dark fc-dark " + (index < 4 ? "" : "disabled")}>
                                    {item.label}
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="flex p-3">
                <div className="sp-hide flex">
                    {
                        tabArr.map((item: any, index: any) =>
                            <div
                                className={"flex bd-shiny on  btn-hover rounded-btn-x pointer pr-4 m-2 text-base mn-h-40px " + (activeTab === index ? 'btn-back-gradient c-white' : 'btn-back-dark')}
                                onClick={() => selectTab(index)}
                                key={index}
                            >
                                {
                                    item.icon === true ?
                                        <img src={item.img} className="rounded-50 size-40px mr-2" alt="" />
                                        : <></>
                                }
                                <span className={"m-auto pl-4 ff-point-cufon " + (activeTab === index ? '' : 'white')}>{item.label}</span>
                            </div>
                        )
                    }
                </div>
                <div className="pc-hide dropdown right flex mx-2 m-auto-v w-100" id="lang-sel-dropdown">
                    <div className="dropdown-toggle rounded-btn-x after-none flex m-auto-v pointer w-100" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src={tabArr[activeTab] ? tabArr[activeTab].img : classImgArr[6]} className="rounded-50 size-40px mr-2" alt="" />
                        <span className="my-auto mx-2">{tabArr[activeTab] ? tabArr[activeTab].label : "sNFT"}</span>
                        <span className="m-auto-v right">
                            <i className="icofont-thin-down"></i>
                        </span>
                    </div>
                    <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                        {
                            tabArr.map((item: any, index: any) =>
                                <div key={index} onClick={() => selectTab(index)} className="dropdown-item pointer flex-no-wrap hover-back-dark flex rounded-btn-x pr-4 pl-0 my-2 text-base mn-h-40px btn-back-dark">
                                    {
                                        item.icon === true ?
                                            <img src={item.img} className="rounded-50 size-40px mr-2" alt="" />
                                            : <></>
                                    }
                                    <span className="m-auto-v pl-4 left white">{item.label}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>

            {
                (isLoaded === true) ?
                    <div className="grid5 mx-1250 m-auto-h p-3">
                        {
                            saleList.map((item: any, index: any) =>
                                <Link 
                                key={index} 
                                to={"/nft/" + item.nftAddress + "/" + item.assetId} 
                                className={cn("bd-shiny btn-hover on back-dark rounded m-2 pc-col", styles.item)}>
                                    <ImageObject src={item.image} className={cn("w-mx-100p sp-size-133 rounded-t-pc rounded-l-sp", styles.itemImage)} />
                                    {/* <img src={item.image} className="w-mx-100p sp-size-133 rounded-t-pc rounded-l-sp" alt="" /> */}
                                    <div className="flex-col p-3 w-fill">
                                        <span className="white text-lg bold mb-3">
                                            {/* {isSameAddress(item.nftAddress, contractAddress[connectedNetwork].SantaV1) ? "sNFT" : isSameAddress(item.nftAddress, contractAddress[connectedNetwork].SantaV2) ? "sNFTV2 (Kainu)" : "sNFTV3 (Test NFT)"} */}
                                            {item.name}
                                        </span>
                                        <div className="flex">
                                            <span className="left fc-grey ff-point-cufon bold">{item.name}</span>
                                            <span className="right white">#{item.assetId}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="left fc-grey">Price</span>
                                            <span className="right white">{getBalanceStr(item.priceInWei, 18) + " " + item.tokenSymbol}</span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        }
                    </div>
                    :
                    <div className="w-100 flex my-8 py-8">
                        <div className="w-fit m-auto flex">
                            <div className="loader-animation"></div>
                        </div>
                    </div>
            }
            <div className="flex w-100 my-4 mn-h-100 btn-hover">
                <div hidden={loadingMore || !isLoaded} onClick={() => dispatch(loadMore(pageId, tabArr[activeTab].addr, sortOrder, connectedNetwork))} className="bd-shiny on rounded white py-3 px-8 text-base bold pointer m-auto btn-back-dark">
                    Load More
                </div>
                <div hidden={!loadingMore} className="m-auto-h my-8 py-8">
                    <img src={loaderSpinnerSvg} style={{height:"14px"}} alt="" />
                    {/* <div className="loader-animation"></div> */}
                </div>
            </div>
        </div>
    )
}

export default Market;
