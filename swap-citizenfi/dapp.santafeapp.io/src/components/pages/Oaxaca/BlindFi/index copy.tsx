import React, { useEffect, useState } from "react";

import ethereumImg from "../../../../assets/img/icons/SantaFe2.png";
import { useAppContext } from "../../../common/libs/context";
import { shortAddress, copyText } from "../../../common/libs/functions"
import { approveErc20 } from "../../../common/libs/functions/integrate";

import { clickContract } from "./blindSlice"
import { getContractData, setApprovedCifi } from "./blindSlice"

import Minting from "./Minting";
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { RootState } from '../../../../app/store'
import { balanceErc20 } from "../../../common/libs/functions/integrate";
import { classImgArr } from "../../../common/libs/image"
import itemBackImg from "../../../../assets/img/back/item-back.jpg";
import contracts, { contractAddress } from "../../../../contracts";
import { bestGas, bestGasPrice } from "../../../common/libs/constant";
import { setActiveHeaderMenu } from "../../../../app/reducers/appSlice";

const alertify = require("alertifyjs")
function BlindFi() {
    const dispatch = useAppDispatch()
    const BlindBoxContracts = useAppSelector((state: RootState) => state.blind.BlindBoxContracts)
    const selectedContract = useAppSelector((state: RootState) => state.blind.selectedContract)
    const blindData2Mint = useAppSelector((state: RootState) => state.blind.blindData2Mint)
    const approvedCifi   = useAppSelector((state: RootState) => state.blind.approvedCifi)

    const { walletAddress, connectedNetwork } = useAppContext()
    const [isMint, setIsMint] = useState<boolean>(false)
    const [isMinted, setIsMinted] = useState<boolean>(false)
    const [isInit, setIsInit] = useState<boolean>(false)

    const isLoaded = useAppSelector((state: RootState) => state.blind.isLoaded)


    const url = window.location.pathname;
    useEffect(() => {
        dispatch(setActiveHeaderMenu(11))
        if (isLoaded) return
        init()
    }, [dispatch, walletAddress, url])

    function init() {
        if (isInit) return
        if (window.web3 && window.web3.eth) {
            setIsInit(true)
            dispatch(getContractData(walletAddress, contractAddress[connectedNetwork].BlindBoxFactory, contractAddress[connectedNetwork].Cifi_Token))
        }
    }

    function clickMint() {
        alertify.dismissAll();
        if ((selectedContract < 0)) {
            alertify.error("Please select contract to mint")
            return
        }
        console.log("click mint", blindData2Mint)
        if (window.web3 && window.web3.eth) {
            setIsMint(true)
            let BlindBoxFactory: any = new window.web3.eth.Contract(contracts.abis.BlindBoxFactory, contractAddress[connectedNetwork].BlindBoxFactory)
            BlindBoxFactory.methods.ableClaim(blindData2Mint.nftContract).call({ from: walletAddress })
                .then((ableClaim: any) => {
                    console.log("ableClaim", ableClaim)
                    if (ableClaim === false) {
                        alertify.error("You already claimed three times")
                        setIsMint(false)
                        return
                    } else {
                        balanceErc20(contractAddress[connectedNetwork].Cifi_Token, walletAddress)
                        .then((balance: any) => {
                            balance = balance / (10 ** 18)
                            if (blindData2Mint.feeAmount / (10 ** 18) > balance) {
                                alertify.error("Your CIFI balance is smaller than fee amount")
                                setIsMint(false)
                                return
                            } else {
                                if (approvedCifi) {
                                    mint()
                                } else {
                                    let max_amount: any = window.web3.utils.toWei(String(2 ** 64 - 1))
                                    approveErc20(contractAddress[connectedNetwork].Cifi_Token, contractAddress[connectedNetwork].BlindBoxFactory, walletAddress, max_amount)
                                        .then((approveRes: any) => {
                                            console.log("approveRes", approveRes)
                                            dispatch(setApprovedCifi(true))
                                            mint()
                                        })
                                        .catch((err: any) => {
                                            // alertify.error("Sorry, something went wrong on the network")
                                            setIsMint(false)
                                            return
                                        })
                                }
                            }
                        })
                        .catch((err: any) => {
                            // alertify.error("Sorry, something went wrong on the network")
                            setIsMint(false)
                            return
                        })
                    }
                })
                .catch((err: any) => {
                    // alertify.error("Sorry, something went wrong on the network")
                    setIsMint(false)
                    return
                })
        }
    }

    function mint() {
        let BlindBoxFactory: any = new window.web3.eth.Contract(contracts.abis.BlindBoxFactory, contractAddress[connectedNetwork].BlindBoxFactory)
        BlindBoxFactory.methods.mint(blindData2Mint.nftContract).send({ from: walletAddress, gas: bestGas, gasPrice: bestGasPrice })
            .then((mintRes: any) => {
                console.log("mintRes", mintRes)
                alertify.success("NFT has been minted successfuly.")
                setTimeout(() => {
                    setIsMinted(true)
                }, 2000);
            })
            .catch((err: any) => {
                console.log("mintRes err", err)
                alertify.error("Error on mint")
                setIsMint(false)
            })
    }

    function closeMintModal() {
        setIsMint(false)
        setIsMinted(false)
    }

    return (
        <>
            <div className="swap-page">
                <div className="flex my-4">
                    <div className="col-md-3 flex-col pb-4">
                        <div className="bd-shiny on rounded btn-back-dark p-4 h-100">
                            <p className="font-baron fs-32 white">BLIND FI</p>
                            <p className="text-lg p-4 white">
                                Earn fungible tokens by staking non-fungible tokens
                            </p>
                            <p className="fc-grey text-lg px-4">
                                Stake related NFTs to earn fungible token. Recover your locked assets after staking ends
                            </p>
                        </div>
                    </div>
                    <div className="col-md-6 flex-col pb-4">
                        <div className="bd-shiny on rounded btn-back-dark h-100">
                            <div className="flex btn-back-gradient-reverse rounded-top p-4 b-b-blue">
                                <img src={ethereumImg} className="size-40px rounded mx-2 m-auto-v" alt="" />
                                <div className="flex-col m-auto-v">
                                    <p className="mb-0 fs-20 font-baron c-white">BLINDFI</p>
                                    <p className="mb-0"><span className="fc-grey">Draw</span> <span className="c-white">tokens</span> <span className="fc-grey">Stake</span> <span className="c-white">Earn</span></p>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex w-100">
                                    <div className="m-auto">
                                        <div className="loader-animation my-4" hidden={isLoaded}></div>
                                    </div>
                                </div>
                                <div className="grid3">
                                    {/* <div className={"bd-shiny on rounded flex relative pointer p-4 border-gradient active"} onClick={() => dispatch(clickBlindBox(true))} >
                                        <span className="text-base abs white">
                                            Blind Box
                                        </span>
                                        <div className="p-4">
                                            <img src={classImgArr[6]} className="w-mx-100p rounded" alt="" />
                                        </div>
                                        <span className="abs bottom right p-2" hidden={!selectedBlindBox}>
                                            <i className="icofont-check-circled c-green bold fs-32"></i>
                                        </span>
                                    </div> */}
                                    {
                                        BlindBoxContracts.map((item: any, index: any) =>
                                            <div
                                                className={"bd-shiny on rounded flex relative pointer p-4 border-gradient active"}
                                                key={index}
                                                onClick={() => dispatch(clickContract(index))}>
                                                <span className="text-base abs white">
                                                    {item.name}
                                                </span>
                                                <div className="p-4">
                                                    <img src={item.image} className="w-mx-100p rounded" alt="" />
                                                </div>
                                                <span className="abs bottom right p-2" hidden={index !== selectedContract}>
                                                    <i className="icofont-check-circled c-green bold fs-32"></i>
                                                </span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 flex-col h-fit pb-4">
                        <div className="bd-shiny on rounded btn-back-dark py-4 px-4 flex-col ">
                            <p className="font-baron fs-32 white">DETAILS</p>
                            <div className="pc-mx-h-70vh pc-mn-h-70vh scroll-v-1 p-2">
                                <div className="mx-2 my-4">
                                    {
                                        (selectedContract > -1) ?
                                            <>
                                                <div className="bd-shiny on rounded flex relative pointer border-gradient active">
                                                    <span className="text-base abs m-4 bold">
                                                        {blindData2Mint.name}
                                                    </span>
                                                    <div className="p-4">
                                                        <div className="p-4">
                                                            <img src={blindData2Mint.image} className="w-mx-100p rounded" alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex">
                                                    <span className="mn-w-100px">Contract</span>:&nbsp;
                                                    <span>{shortAddress(blindData2Mint.nftContract)}</span>
                                                    <i
                                                        onClick={() => copyText(blindData2Mint.nftContract, "Contract address copied to clipboard.")}
                                                        className="icofont-ui-copy pointer c-blue my-auto mx-1"></i>
                                                </div>
                                                <div className="flex">
                                                    <span className="mn-w-100px">Max Count</span>:&nbsp;
                                                    <span>{blindData2Mint.maxCount}</span>
                                                </div>
                                                <div className="flex">
                                                    <span className="mn-w-100px">Fee Amount</span>
                                                    <span >:&nbsp;{Number(blindData2Mint.feeAmount / (10 ** 18)).toFixed(2)} CIFI</span>&nbsp;
                                                </div>
                                            </>
                                            :
                                            <>
                                                <div className="bd-shiny on rounded flex relative pointer border-gradient active">
                                                    <span className="text-base abs m-4 bold">
                                                        - - - - -
                                                    </span>
                                                    <div className="p-4 w-100">
                                                        <div className="p-4">
                                                            <img src={itemBackImg} className="w-mx-100p w-100 rounded" alt="" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex">
                                                    <span className="mn-w-100px">Contract</span>:&nbsp;
                                                    <span>0x...</span>
                                                    <i
                                                        className="icofont-ui-copy pointer c-blue my-auto mx-1"></i>
                                                </div>
                                                <div className="flex">
                                                    <span className="mn-w-100px">Max Count</span>:&nbsp;
                                                    <span></span>
                                                </div>
                                                <div className="flex">
                                                    <span className="mn-w-100px">Fee Amount</span>
                                                    <span >:&nbsp; </span>&nbsp;
                                                </div>
                                            </>
                                    }
                                </div>
                                {/* <p className="fc-grey mb-0 text-lg">Minimum: 1</p>
                                <div className="fc-grey flex mb-0 text-lg btn-back-blue1 p-2">
                                    <input type="text" onChange={(e) => setFaceValue(e.target.value)} className="right m-auto-v ta-left blank-box w-fill white" placeholder="Face value" />
                                </div>
                                <div className={"flex btn-back-gradient rounded p-1 space-center my-2 " + (selectedBlindBox ? "w-50 " : " w-100")}>
                                    <div 
                                        onClick={() => dispatch(clickApproveCifi(walletAddress))} 
                                        className={"text-center approve-toggle rounded p-1 text-lg pointer bold active-bd-or " + (blindData2Mint.approveCifi === false ? "active btn-back-dark white " : "fc-grey ") + (selectedBlindBox ? "w-100" : "w-50")}>
                                        <span className="m-auto no-wrap px-2" hidden={blindData2Mint.progressCifi}>Approve CIFI</span>
                                        <div className="loader-animation-sm m-auto" hidden={!blindData2Mint.progressCifi}></div>
                                    </div>
                                    <div onClick={() => dispatch(clickApproveTest(walletAddress))} hidden={selectedBlindBox} className={"text-center approve-toggle w-50 rounded p-1 text-lg pointer bold active-bd-or " + (blindData2Mint.approveAccept === false ? "active btn-back-dark white" : "fc-grey")}>
                                        <span className="m-auto" hidden={blindData2Mint.progressAccept}>Approve TEST</span>
                                        <div className="loader-animation-sm m-auto" hidden={!blindData2Mint.progressAccept}></div>
                                    </div>
                                </div> */}
                                <div onClick={() => clickMint()} className="bd-shiny on w-100 m-auto-h text-center rounded p-2 my-4 text-2xl pointer fc-whtie btn-back-gradient border border-white bold">
                                    <span hidden={isMint} className="p-2 c-white">Draw</span>
                                    <div className="flex text-center">
                                        <div className="loader-animation-sm m-auto" hidden={!isMint}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Minting
                isModalOpen={isMint}
                isMinted={isMinted}
                mintContract={blindData2Mint}
                onHide={() => closeMintModal()}
            />
        </>
    )
}

export default BlindFi;
