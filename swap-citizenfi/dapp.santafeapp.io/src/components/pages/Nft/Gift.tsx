import React, {useState} from "react";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import { useAppContext } from "../../common/libs/context";
import {validateWalletAddres} from "../../common/libs/functions"
import { bestGas, bestGasPrice } from "../../common/libs/constant";

import { useAppDispatch } from '../../../app/hook'
import { openNotification } from "../../../app/reducers/appSlice";

const alertify  = require("alertifyjs")


function Gift(props: any) {
    const dispatch = useAppDispatch()

    const { walletAddress } = useAppContext();
    const {contracts} = useAppContext()
    
    const [toAddr, setToAddr] = useState<string>("")
    const [isProcess, setIsProcess] = useState<boolean>(false)


    const clickClose = () => {
        props.onHide()
        setToAddr("")
        setIsProcess(false)
    }

    function validateInput() {
        // alert(tokenId)
       

        if (!validateWalletAddres(toAddr)) {
            alertify.dismissAll();
            alertify.error("Please input correct wallet address")
            return false
        }

       
        return true
    }

    function send(){
        if(!validateInput()) return
        if (window.ethereum) {
            alertify.dismissAll();
            setIsProcess(true)

            let ERC721: any = new window.web3.eth.Contract(contracts.abis.ERC721, props.contractAddress);
            ERC721.methods.transferFrom(walletAddress, toAddr, props.tokenId)
            .send({
                from: walletAddress, 
                gas: bestGas, 
                gasPrice: bestGasPrice
            })
            .then((res: any) => {
                alertify.success("Your NFT has been sent successfully!")
                setIsProcess(false)
                dispatch(openNotification(res, "Transfer NFT"))
                props.onHide()
                setTimeout(() => {
                    window.location.href = "/portfolio?tab=wallet"
                }, 1000);
                
            }).catch((err: any) => {
                // alertify.error("Error on transaction")
                setIsProcess(false)
            })
        }
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect p-2"> 
                <ModalBody className=" btn-back-gradient-reverse rounded p-4">
                    <div className="row flex p-4">
                        <p className="text-4xl text-center m-auto-h bold">
                            Gift your NFT
                        </p>
                        <div className="close-window pointer" onClick={() => clickClose()}>
                            <i className="fa remix ri-close-fill fs-32"></i>
                        </div>
                    </div>
                    <div className="my-4">
                        <p className="text-lg">Recipient address</p>
                        
                        <input 
                            type="text" 
                            className="blank-box w-100 c-white m-auto-v b-b ta-left py-2 text-lg"  
                            value={toAddr}
                            onChange={(e: any) => setToAddr(e.target.value)}
                            placeholder={"0x24D36…"} />
                    </div>
                    <div className="my-4 py-4"></div>
                    <div className="flex">
                        <div 
                            hidden={isProcess}
                            onClick={() => send()}
                            className="bd-shiny rounded-btn-x back-dark btn-hover py-2 px-8 pointer bold text-lg c-white rounded m-auto">
                            Send
                        </div>
                        <div hidden={!isProcess} className="loader-animation-sm m-auto"></div>
                    </div>
                </ModalBody>
            </Modal>
            <Link to="/portfolio?tab=wallet" id="goto_portfolio" hidden={true}>Go to portfolio</Link>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default Gift

