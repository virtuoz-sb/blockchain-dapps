import React, {useState} from "react";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import darkImg     from "../../../assets/img/icons/anyswap.png"
import { useAppContext } from "../../common/libs/context";
import {putOnSaleItem} from "../../common/libs/functions/market"
import {validateWalletAddres, isInteger, isNumeric, } from "../../common/libs/functions"
import {coins} from "../../common/libs/data"
import { contractAddress } from "../../../contracts";


const alertify  = require("alertifyjs")

const saleTypes = [
    {
        label: "Fixed Sale"
    },
    {
        label: "Auction Sale"
    },
]

function PutOnSale(props: any) {

    const { walletAddress, connectedNetwork } = useAppContext();
    const [selectedSaleType, setSelectedSaleType] = useState<number>(0)
    const {contracts} = useAppContext()
    const [acceptedTokens, setAcceptedTokens] = useState<any>([])
    const [selectedCoin, setSelectedCoin] = useState<any>(coins[0])
    const [selectedTokenType, setSelectedTokenType] = useState<number>(1)
    const [price, setPrice] = useState<any>(0.0)
    const [hours, setHours] = useState<any>("")

    const [isProcess, setIsProcess] = useState<boolean>(false)


    const clickClose = () => {
        props.onClose()
        setAcceptedTokens([])
        setSelectedCoin(coins[0])
        setSelectedTokenType(1)
        setPrice(0.0)
        setHours("")
    }

    function putOnSale(){
        if(!validateInput()) return
        setIsProcess(true)
        putOnSaleItem(selectedSaleType, selectedTokenType, props.contractAddress, props.tokenId, selectedCoin, price, hours, contractAddress[connectedNetwork].Fixed_Marketplace)
        .then((res: any) => {
            if(res && (res.succ === true)) {
                window.location.href = "/portfolio?tab=wallet"
            }
        })
        .catch((err: any) => {
            setIsProcess(false)
        })
    }

    function selectCoin(id: any){
        setSelectedTokenType(id + 1)
        setSelectedCoin(acceptedTokens[id])
    }

    const [isInit, setIsInit] = useState<boolean>(false)
    init()
    function init(){
        if(isInit) return
        setIsInit(true)

        if(window.web3 && window.web3.eth ){
            console.log("here call contract")
            let Fixed_Marketplace : any = new window.web3.eth.Contract(contracts.abis.Fixed_Marketplace , contractAddress[connectedNetwork].Fixed_Marketplace)
            Fixed_Marketplace.methods.getTokenSymbols().call({from: walletAddress})
            .then((symbols: any) => {
                console.log("accepted tokens from contract: ", symbols)
                let tmpCoin: any = {}
                let acceptTokensData: any = []
                if(symbols && symbols.length > 0){
                    for(let i = 0 ; i < symbols.length ; i ++){
                        tmpCoin = {
                            label: symbols[i],
                            symbol: symbols[i]
                        }
                        for(let j = 0 ; j < coins.length ; j ++){
                            if(symbols[i].toLowerCase() === coins[j].label.toLowerCase()){
                                tmpCoin.icon = coins[j].icon
                            }
                        }
                        acceptTokensData.push(tmpCoin)
                    }
                    setAcceptedTokens(acceptTokensData)
                }
            }).catch((err: any) => {
                console.log("err: ", err)
            })
        }
    }

    function validateInput() {
        // alert(tokenId)
        if (selectedSaleType !== 0) {
            alertify.dismissAll();
            alertify.error("Please select sale Type. Fixed sale is available now")
            return false
        }

        if (selectedTokenType === 0) {
            alertify.dismissAll();
            alertify.error("Please select Token Type")
            return false
        }

        if (!validateWalletAddres(props.contractAddress)) {
            alertify.dismissAll();
            alertify.error("Please input correct Token Contract Address")
            return false
        }

        if (!isNumeric(price, true)) {
            alertify.dismissAll();
            alertify.error("Please input correct price value")
            return false
        }

        if (!isInteger(hours, true)) {
            alertify.dismissAll();
            alertify.error("Please input correct time(hours) value. 1~999")
            return false
        }else if(Number(hours) > 999 || Number(hours) < 1){
            alertify.dismissAll();
            alertify.error("Please input correct time(hours) value. 1~999")
            return false
        }
         else {
        }

        return true
    }

    function clickSaleType(index: any){
        if(index > 1)setSelectedSaleType(index)
        else setSelectedSaleType(0)
    }

    return (
        <>
        <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect p-2"> 
            <ModalBody className=" btn-back-gradient-reverse rounded p-4">
                <div className="row flex p-4">
                    <p className="text-4xl text-center m-auto-h bold">
                        Put on sale
                    </p>
                    <div className="close-window pointer" onClick={() => clickClose()}>
                        <i className="fa remix ri-close-fill fs-32"></i>
                    </div>
                </div>
                <div className="my-4">
                    {/* <p className="text-lg">Please select the type of sales you want to create in Marketplace</p> */}
                    <div className="dropdown flex w-100" >
                        <div className="dropdown-toggle white after-none border-gradient border-show rounded p-3 text-lg flex pointer m-auto-v w-100" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span >{saleTypes[selectedSaleType].label}</span>
                            <span  className="m-auto-v right">
                                <i className="icofont-thin-down"></i>
                            </span>
                        </div>
                        <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-2 w-100" aria-labelledby="dropdownMenuButton">
                            {
                                saleTypes.map((item: any, index: any) => 
                                    <div 
                                        key={index} 
                                        onClick={() => clickSaleType(index)}
                                        className={"dropdown-item flex-col rounded py-2 px-3 my-2 hover-back-dark w-100 pointer " + (index > 0 ? "disabled fc-dark-light" : "")} >
                                        <p className="white mb-0 text-capitalize">{item.label}</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
                <div className="flex my-4">
                    <span className="mr-2 c-white text-lg bold m-auto-v">Price</span>
                    <input 
                        type="text" 
                        className="blank-box c-white m-auto-v b-b ta-left"  
                        value={price} 
                        onChange={(e: any) => setPrice(e.target.value)} 
                        placeholder={selectedSaleType === 2 ? "Price" : "Starting Price"} />
                    <div className="dropdown flex w-fit" >
                        <div className="dropdown-toggle after-none white border-gradient border-show rounded px-3 py-2 mx-2 text-lg flex pointer m-auto-v w-fit" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img 
                                src={selectedCoin ?( selectedCoin.icon || darkImg ): darkImg} 
                                className="rounded-50 size-24px m-auto-v mr-2" 
                                alt="" />
                            <span >{selectedCoin ? selectedCoin.label : ""}</span>
                            <span  className="m-auto-v right">
                                <i className="icofont-thin-down"></i>
                            </span>
                        </div>
                        <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-1 w-fit" aria-labelledby="dropdownMenuButton">
                            {
                                acceptedTokens.map((coin: any, index: any) => 
                                    <div 
                                        className={"dropdown-item pointer flex flex-no-wrap hover-back-dark rounded my-2 py-2"} 
                                        key={index}
                                        onClick={() => selectCoin(index)}>
                                        <img 
                                            src={coin.icon ? coin.icon : darkImg} 
                                            className="rounded-50 size-32px m-auto-v mr-2" 
                                            alt="" />
                                        <span className="m-auto-v mx-2 white">{coin.symbol}</span>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
                <input type="text" className="blank-box ta-left m-auto-v b-b my-4 w-100" placeholder="Hours" value={hours} onChange={(e: any) => setHours(e.target.value)} name="" id="" />
                <p className="mt-4">Transaction Fee 2.5%</p>

                <div className="flex">
                    <div 
                        onClick={() => putOnSale()}
                        hidden={isProcess}
                        className="btn-back-gradient py-2 px-8 pointer btn-hover bold text-lg c-white rounded m-auto">
                        Launch
                    </div>
                    <div hidden={!isProcess} className="loader-animation-sm m-auto"></div>
                </div>
            </ModalBody>
        </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default PutOnSale

