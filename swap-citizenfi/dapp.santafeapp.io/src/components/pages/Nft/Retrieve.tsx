import React, {useState} from "react";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import Countdown from 'react-countdown';

import { useAppContext } from "../../common/libs/context";
import {showError} from "../../common/libs/functions"
import { bestGas, bestGasPrice } from "../../common/libs/constant";

import SantaV2Api from "../../common/apiSantaMeta/SantaV2";
import { contractAddress } from "../../../contracts";
import { useAppDispatch } from '../../../app/hook'
import { openNotification } from "../../../app/reducers/appSlice";
import { setSwapCount } from "../Swap/swapSlice";

const alertify  = require("alertifyjs")


function Retrieve(props: any) {
    const dispatch = useAppDispatch()

    const { walletAddress, connectedNetwork } = useAppContext();
    const {contracts} = useAppContext()
    
    const [isProcess, setIsProcess] = useState<boolean>(false)
    const [isClaimed, setIsClaimed] = useState<boolean>(false)

    
    const Completionist = () => <p className="m-auto flex-item text-center">Ended</p>;

    const renderer = ({ days, hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return <Completionist />;
        } else {
            return (
                days > 0 ?
                <p className="m-auto flex-item text-center">{days + " Days " + hours + "h " + minutes + "m " + seconds + "s"}</p>
                :
                <p className="m-auto flex-item text-center">{hours + "h " + minutes + "m " + seconds + "s"}</p>
            )
        }
    };

    const rendererButton = ({ days, hours, minutes, seconds, completed }: any) => {
        if (completed) {
            return <div 
                        hidden={isProcess}
                        onClick={() => runRetrieve()}
                        className="bd-shiny rounded-btn-x btn-hover back-dark py-2 px-8 pointer bold text-lg c-white rounded m-auto">
                        {isClaimed === true ? "Claimed" : "Claim"}
                    </div>
        } else {
            return <div 
                        hidden={isProcess}
                        onClick={() => props.onHide()}
                        className="bd-shiny rounded-btn-x btn-hover back-dark py-2 px-8 pointer bold text-lg c-white rounded m-auto">
                        Close
                    </div>
        }
    };

    const runRetrieve = () => {
        if(isClaimed === true) return showError("You already retrieved")
        setIsProcess(true)
        let ERC721_Contract: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV2, contractAddress[connectedNetwork].SantaFactoryV2)
        return ERC721_Contract.methods.retrieveToken(props.tokenId)
        .send({ 
            from: walletAddress, 
            gas: bestGas, 
            gasPrice: bestGasPrice 
        })
        .then((resRetrieve: any) => {
            dispatch(setSwapCount(true))
            dispatch(openNotification(resRetrieve, "Retrieve"))
            SantaV2Api.successRetrieve({
                tokenId: props.tokenId,
                contractAddress: props.contractAddress,
                user: walletAddress
            })
            .then((sucRes: any) => {
                alertify.success("Token Retrieved Successfully")
                props.runRetrieveContract()
                setIsProcess(false)
                setIsClaimed(true)
            })
        })
        .catch((err: any) => {
            setIsProcess(false)
        })
    }

    const clickClose = () => {
        props.onHide()
        setIsProcess(false)
        setIsClaimed(false)
    }

    return (
        <>
            <Modal onHide={() => clickClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect p-2"> 
                <ModalBody className=" btn-back-gradient-reverse rounded p-4">
                    <div className="row flex p-4">
                        <p className="text-4xl text-center m-auto-h bold">
                            Time remaining
                        </p>
                        <div className="close-window pointer" onClick={() => clickClose()}>
                            <i className="fa remix ri-close-fill fs-32"></i>
                        </div>
                    </div>
                    <div className="my-4">
                        <p className="text-4xl bold c-blue">
                            <Countdown
                            date={Number(props.endTime)}
                            renderer={renderer} />
                        </p>
                    </div>
                    <div className="my-4 py-4"></div>
                    <div className="flex">
                        <Countdown
                            date={Number(props.endTime)}
                            renderer={rendererButton} />
                        <div hidden={!isProcess} className="loader-animation-sm m-auto"></div>
                    </div>
                </ModalBody>
            </Modal>
            <Link to="/portfolio?tab=wallet" id="goto_portfolio" hidden={true}>Go to portfolio</Link>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default Retrieve

