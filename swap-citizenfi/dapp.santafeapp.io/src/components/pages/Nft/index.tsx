import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";

// import logoImg from "../../../assets/img/icons/logo_large.png"
// import ethereumImg from "../../../assets/img/icons/networks/ethereum-network.jpg";
import anySwapImg from "../../../assets/img/icons/anyswap.png"
// import santaFeImg from "../../../assets/img/icons/SantaFe2.png"
// import changeSvg from "../../../assets/img/icons/svg/change.svg"
// import exitSvg from "../../../assets/img/icons/svg/exit.svg"

import jQuery from "jquery"
import { isSameAddress, humanize, shortAddress, getBalanceStr, copyText } from "../../common/libs/functions"
import { useAppContext } from "../../common/libs/context";
import PutOnSale from "./PutOnSale";
import { cancelOrder, buyItem } from "../../common/libs/functions/market"
import SantaV2Api from "../../common/apiSantaMeta/SantaV2";
import { graphEndPoint } from "../../common/libs/data";

import Gift from "./Gift";
import { bestGas, bestGasPrice } from "../../common/libs/constant";

import { useAppDispatch } from '../../../app/hook'
import { openNotification, setActiveHeaderMenu } from "../../../app/reducers/appSlice";
import { contractAddress, net_state } from "../../../contracts";
import Retrieve from "./Retrieve";

const alertify = require("alertifyjs")

function Nft() {
    const dispatch = useAppDispatch()

    const { cifiBalance, connectedNetwork } = useAppContext()
    const pathName = window.location.pathname.substring(1)
    const arr = pathName.split("/")
    let address = ""
    let tokenId = 0

    if ((arr.length === 3) && (arr[0] === "nft")) {
        address = arr[1]
        tokenId = Number(arr[2])
    } else if ((arr.length === 4) && (arr[0] === "nft")) {
        address = arr[1]
        tokenId = Number(arr[2])
    }

    const [showPutOnSale, setShowPutOnSale] = useState<boolean>(false)
    const [isInit, setIsInit] = useState<boolean>(false)
    const { isConnected, walletAddress, isCorrectNet } = useAppContext()
    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const { contracts } = useAppContext()
    const [itemData, setItemData] = useState<any>({})
    const [isOwner, setIsOwner] = useState<boolean>(false)
    const [isSale, setIsSale] = useState<boolean>(false)
    const [saleData, setSaleData] = useState<any>({})
    const [isSeller, setIsSeller] = useState<boolean>(false)
    const [showGiftModal, setShowGiftModal] = useState<boolean>(false)

    const [isProcess, setIsProcess] = useState<boolean>(false)
    const [isRetrieve, setIsRetrieve] = useState<boolean>(false)

    const [showRetrieveModal, setShowRetrieveModal] = useState<boolean>(false)

    const [retrieveEndTime, setRetrieveEndTime] = useState<any>(new Date().getTime())

    const [isRetrieveClicked, setIsRetrieveClicked] = useState<boolean>(false)

    const url = window.location.pathname;
    useEffect(() => {
        init()
        dispatch(setActiveHeaderMenu(-1))
    }, [walletAddress, isCorrectNet, isConnected, url])

    function init() {
        if (isInit) return
        getInitData()
    }

    function getInitData() {

        if (window.web3 && window.web3.eth) {
            setIsInit(true)
            console.log("here call contract")
            let ERC721_Contract: any = new window.web3.eth.Contract(contracts.abis.ERC721, address)

            ERC721_Contract.methods.baseURI().call({
                from: walletAddress
            })
                .then((baseUri: any) => {
                    ERC721_Contract.methods.ownerOf(tokenId).call()
                        .then((ownerRes: any) => {
                            console.log("ownerRes", ownerRes, baseUri)
                            setIsOwner(isSameAddress(ownerRes, walletAddress))
                            // if(isSameAddress(ownerRes, walletAddress)){
                            //     SantaV2Api.getRetrieve({
                            //         tokenId: tokenId,
                            //         contractAddress: address,
                            //         user: walletAddress,
                            //         create: false
                            //     })
                            //     .then((res: any) =>  {
                            //         console.log("get Retirieve Data", res.data)
                            //         let resData: any = res.data
                            //         if(resData.exist === true){
                            //             setIsRetrieveClicked(true)
                            //         }
                            //     })
                            // }
                            if(baseUri.substring(baseUri.length - 1) !== "/") baseUri = baseUri + "/"
                            jQuery.get(baseUri + tokenId + "/")
                                .then((metaData: any) => {
                                    console.log("metadata ", metaData)
                                    if(typeof metaData === "string")metaData = JSON.parse(metaData)
                                    metaData.contractAddress = address
                                    metaData.owner = ownerRes
                                    if (isSameAddress(address, contractAddress[connectedNetwork].SantaV1)) metaData.type = "sNFTV1"
                                    else if (isSameAddress(address, contractAddress[connectedNetwork].SantaV2)) metaData.type = "sNFTV2"
                                    else if (isSameAddress(address, contractAddress[connectedNetwork].LootBox)) metaData.type = "META"
                                    else metaData.type = "sNFTV3"
                                    console.log(tokenId, "metadata", metaData)

                                    let defaultQuery: any = {
                                        query: `
                                            query existOrderTransactions($nftAddress: String!, $assetId: Int!) {
                                                existOrderTransactions(where: {nftAddress: $nftAddress, assetId: $assetId}) {
                                                    id
                                                    seller
                                                    nftAddress
                                                    tokenSymbol
                                                    assetId
                                                    priceInWei
                                                    expiresAt
                                                    timestamp
                                                    __typename
                                                }
                                            }
                                        `,
                                        variables: {
                                            nftAddress: address,
                                            assetId: tokenId
                                        },
                                    }
                                    fetch(graphEndPoint[connectedNetwork], {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(defaultQuery),
                                    })
                                        .then((res) => res.json())
                                        .then((result) => {
                                            if (result.data && result.data.existOrderTransactions && (result.data.existOrderTransactions.length > 0)) {
                                                console.log("this item is on sale", result.data.existOrderTransactions[0])
                                                setIsSale(true)
                                                setSaleData(result.data.existOrderTransactions[0])
                                                setIsSeller(isSameAddress(walletAddress, result.data.existOrderTransactions[0].seller))
                                            }
                                        });

                                    // SaleApi.getSaleData({
                                    //     contractAddress: address.toLocaleLowerCase(),
                                    //     tokenId: tokenId
                                    // }).then((saleRes: any) => {
                                    //     if (saleRes.data && saleRes.data.length > 0) {
                                    //         setIsSale(true)
                                    //         setSaleData(saleRes.data[0])
                                    //         setIsSeller(isSameAddress(walletAddress, saleRes.data[0].seller))
                                    //     }
                                    // })

                                    setItemData(metaData)
                                    setTimeout(() => {
                                        setIsLoaded(true)
                                    }, 500);
                                })
                        })

                })
        }
    }

    function clickCancelOrder() {
        setIsProcess(true)
        cancelOrder(saleData.nftAddress, saleData.assetId, saleData.id, contractAddress[connectedNetwork].Fixed_Marketplace)
            .then((res: any) => {
                setIsProcess(false)
            })
            .catch((err: any) => {
                setIsProcess(false)
            })
    }

    function clickBuyItem() {
        if (!(isConnected)) {
            alertify.dismissAll();
            alertify.error("Please connect wallet")
            return
        }
        if (!isCorrectNet) {
            alertify.dismissAll();
            alertify.error("Please connect correct network")
            return
        }
        
        let x = new Date()
        let xT: any = (x.getTime() + x.getTimezoneOffset() * 60 * 1000) / 1000
        // console.log("now : ", (x.getTime() + x.getTimezoneOffset()*60*1000)/1000)
        if (xT > saleData.expiresAt) {
            console.log(x, saleData.expiresAt)
            alertify.dismissAll();
            alertify.error("This item has been expired")
            return
        } else if (window.ethereum) {

            setIsProcess(true)

            buyItem(saleData.nftAddress, saleData.assetId, saleData.tokenSymbol, saleData.priceInWei / (10 ** 18), walletAddress, cifiBalance, contractAddress[connectedNetwork].Fixed_Marketplace)
                .then((res: any) => {
                    if (res && res.succ && (res.succ === true)) {
                        saleData.owner = walletAddress
                        saleData.isSold = true
                        saleData.onSale = false;
                        alertify.dismissAll();
                        alertify.success("Success")
                        setIsProcess(false)
                        setTimeout(() => {
                            window.location.href = "/portfolio?tab=wallet"
                        }, 300);
                    } else {
                        setIsProcess(false)
                    }
                })
                .catch((err: any) => {
                    setIsProcess(false)
                    console.log("Buying err", err)
                })

        }
    }

    function retrieve() {
        // if(net_state === 0) return
        if (window.web3 && window.web3.eth) {
            setIsRetrieve(true)
            if (isSameAddress(address, contractAddress[connectedNetwork].SantaV2)) {
                setIsProcess(true)
                let ERC721_Contract: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV2, contractAddress[connectedNetwork].SantaFactoryV2)
                return ERC721_Contract.methods.retrieveToken(tokenId)
                .send({ 
                    from: walletAddress, 
                    gas: bestGas, 
                    gasPrice: bestGasPrice 
                })
                .then((resRetrieve: any) => {
                    dispatch(openNotification(resRetrieve, "Retrieve"))
                    SantaV2Api.successRetrieve({
                        tokenId: tokenId,
                        contractAddress: address,
                        user: walletAddress
                    })
                    .then((sucRes: any) => {
                        alertify.success("Token Retrieved Successfully")
                        runRetrieveContract()
                        setIsProcess(false)
                    })
                })
                .catch((err: any) => {
                    setIsProcess(false)
                })
                
                // SantaV2Api.getRetrieve({
                //     tokenId: tokenId,
                //     contractAddress: address,
                //     user: walletAddress,
                //     create: true
                // })
                // .then((res: any) =>  {
                //     console.log("get Retirieve Data", res.data)
                //     let resData: any = res.data
                //     if(resData.exist === true || resData.created){
                //         let curTime = new Date().getTime() + (new Date().getTimezoneOffset()) * 60000
                //         let endTime = Number(resData.attackTime) + 24*3600*14*1000
                //             setRetrieveEndTime(endTime)
                //             setShowRetrieveModal(true)
                //             setIsRetrieve(false)
                //             setIsRetrieveClicked(true)
                //     }
                // })
            } 
        }
    }

    const runRetrieveContract = () => {
        let tmpData: any = itemData
        tmpData.attributes.face_value = 0
        setItemData(tmpData)
        setIsRetrieve(false)
        // setIsRetrieveClicked(false)
    }

    function gift() {
        // if(isRetrieveClicked) return
        setShowGiftModal(true)
    }

    function clickPutOnSale() {
        // if(isRetrieveClicked) return
        setShowPutOnSale(true)
    }

    return (
        <>
            <div hidden={!isLoaded} className="swap-page mn-h-80 mx-1250 p-4 my-4 row">
                <div className="col-md-4 flex-col">
                    <div className="flex-col my-4">
                        <img src={itemData.image} alt="" className="bd-shiny rounded mx-h-100vw-30 w-mx-100" />
                    </div>
                </div>
                <div className="col-md-8 px-8 py-3 flex-col">
                    <p className="white fs-20 bold">
                        #{tokenId} {itemData.name}
                    </p>
                    <div className="flex">
                        <img src={anySwapImg} alt="" className="bd-shiny on rounded-50 size-32px m-auto-v" />
                        <div className="flex-col mx-2 m-auto-v left">
                            <div className="flex">
                                <a href="/" className="text-base flex">
                                    {shortAddress(isSale ? saleData.seller : itemData.owner || "")}
                                </a>
                                <i
                                    onClick={() => copyText(isSale ? saleData.seller : itemData.owner, "Contract address copied to clipboard.")}
                                    className="icofont-ui-copy pointer c-blue my-auto mx-1"></i>
                            </div>
                            <span className="fc-grey text-base">Owner</span>
                        </div>
                        <div className="flex flex-no-wrap m-auto-v sp-flex-col right">
                            <div hidden={isOwner} className="flex m-auto-v mx-2 white sp-m-auto-h">
                                {saleData.priceInWei ? getBalanceStr(saleData.priceInWei, 18) : ""}&nbsp;{saleData.tokenSymbol || ""}
                            </div>
                            <div
                                hidden={isOwner || isSeller || isProcess || !isSale}
                                onClick={() => clickBuyItem()}
                                className="m-auto-v rounded-btn-x btn-hover pointer w-fit text-center c-white text-lg bold py-2 px-4 mx-2 btn-back-gradient sp-m-auto-h">
                                BUY ITEM
                            </div>
                            <div
                                hidden={!isOwner || isRetrieve || itemData.type !== 'sNFTV2'}
                                className={"bd-shiny on m-auto-v rounded-btn-x btn-hover pointer w-fit c-white mn-w-120px text-center text-lg bold py-2 px-4 mx-2 sp-my-2 btn-back-gradient sp-m-auto-h"}
                                onClick={() => retrieve()}
                            >
                                Retrieve
                            </div>
                            <div className="flex m-auto">
                                <div hidden={!isProcess && !isRetrieve} className="loader-animation-sm mx-2"></div>
                            </div>
                            <div
                                hidden={!isOwner}
                                className={"bd-shiny on m-auto-v rounded-btn-x btn-hover pointer c-white w-fit mn-w-120px text-center text-lg bold py-2 px-4 mx-2 sp-my-2 btn-back-gradient sp-m-auto-h " + (isRetrieveClicked ? "disabled" : "")}
                                onClick={() => gift()}
                            >
                                Gift
                            </div>
                            <div
                                hidden={!isOwner || isProcess}
                                className={"bd-shiny on m-auto-v rounded-btn-x btn-hover pointer w-fit c-white mn-w-120px text-center text-lg bold py-2 px-4 mx-2 btn-back-gradient sp-m-auto-h " + ((isRetrieveClicked) ? "disabled" : "")}
                                onClick={() => clickPutOnSale()}
                            >
                                Put On Sale
                            </div>
                            <div
                                hidden={!isSeller || isProcess || isOwner}
                                className="m-auto-v rounded-btn-x pointer w-fit btn-hover c-white text-center text-lg bold py-2 px-4 mx-2 btn-back-gradient sp-m-auto-h"
                                onClick={() => clickCancelOrder()}
                            >
                                <span>Cancel Sale</span>
                            </div>
                        </div>
                    </div>
                    <div className="fc-grey text-base py-2 my-2">
                        {itemData.description}
                    </div>
                    <div className="py-1 b-b-gradient w-100"></div>
                    <div className="flex-col fc-grey">
                        <div className="flex my-2">
                            <span className="left">TOKEN ID</span>
                            <span className="right">#{tokenId}</span>
                        </div>
                        {
                            itemData.attributes ?
                                Object.keys(itemData.attributes).map((attr: any, index) =>
                                    <div className="flex my-2" key={index}>
                                        <span className="left">{humanize(attr)}</span>
                                        <span className="right">{itemData.attributes[attr]}</span>
                                    </div>
                                )
                                :
                                <></>
                        }
                    </div>
                    {/* <div className="flex-col mt-4 pt-4">
                    <div className="flex fs-20">
                        <img src={changeSvg} alt="" className="img-white size-24px" />
                        <span className="white bold mx-2 m-auto-v">
                            Lastest Transactions
                        </span>
                    </div>
                    <div className="p-2">
                    {
                        tmpArr.map((item: any, index: any) =>
                            <div className="flex text-base mt-4 w-100">
                                <i className="icofont-exit rot-270 fs-20"></i>
                                <img src={santaFeImg} alt="" className="mx-2 size-32px rounded-s" />
                                <img src={anySwapImg} alt="" className="mx-2 rounded-50 size-32px" />
                                <div className="flex-col mx-2 left">
                                    <Link to="/">0x0DDd…64cb</Link>
                                    <span className="fc-grey">SELL</span>
                                </div>
                                <div className="right flex-col">
                                    <span className="white right">0.1 BNB</span>
                                    <span className="fc-grey right">3 days ago</span>
                                </div>
                            </div>
                        )
                    }
                    </div>
                </div> */}
                </div>
            </div>
            <div hidden={isLoaded} className="mn-h-80 m-auto-h flex">
                {/* <img src={loadingSvg} alt="" /> */}
                <div className="flex m-auto">
                    <div className="loader-animation my-4"></div>
                </div>
            </div>
            <PutOnSale
                isModalOpen={showPutOnSale}
                onClose={() => setShowPutOnSale(false)}
                onHide={() => setShowPutOnSale(false)}
                contractAddress={address}
                tokenId={tokenId}
            />
            <Gift
                isModalOpen={showGiftModal}
                onHide={() => setShowGiftModal(false)}
                contractAddress={address}
                tokenId={tokenId}
            />
            {/* <Retrieve
                isModalOpen={showRetrieveModal}
                endTime={retrieveEndTime}
                onHide={() => setShowRetrieveModal(false)}
                runRetrieveContract={runRetrieveContract}
                contractAddress={address}
                tokenId={tokenId}
            /> */}
        </>
    )
}

export default Nft;
