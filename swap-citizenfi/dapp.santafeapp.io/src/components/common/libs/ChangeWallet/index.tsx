import React from "react";
// import WalletConnect from "@walletconnect/client";
// import QRCodeModal from "@walletconnect/qrcode-modal";
// import { withTranslation } from 'react-i18next'
import Web3 from "web3"
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
// import ModalHeader from "react-bootstrap/ModalHeader";
// import ModalFooter from "react-bootstrap/ModalFooter";
// import ModalTitle from "react-bootstrap/ModalTitle";

// import imgLogo from "../../../../assets/img/icons/SantaFe2.png"
// import walletSvg from "./img/wallet.svg"

// import metaMaskImg from "../ConnectWallet/img/meta-mask.png"
// import trustImg from "../ConnectWallet/img/wallet-connect.svg"
// import mathImg from "../ConnectWallet/img/math.png"
// import binanceImg from "../ConnectWallet/img/binance.png"

import polygonImg from "../../../../assets/img/icons/networks/polygon-network.jpg"
import bscImg from "../../../../assets/img/icons/networks/bsc-network.jpg"
import solanaImg from "../../../../assets/img/icons/networks/solana-network.png"
import polkadotImg from "../../../../assets/img/icons/networks/polkadot-network.png"

import cn from "classnames"

import { useAppContext } from "../context";
import { NetworkArray } from "../constant";

declare global {
    interface Window {
        ethereum: any;
        BinanceChain: any;
        web3: any;
    }
}

function ChangeWallet(props: any) {

    const { networkId, isCorrectNet, connectedNetwork } = useAppContext();

    const networks = [
        {
            icon: polygonImg,
            label: "Polygon",
            networkId: 137
        },
        {
            icon: bscImg,
            label: "BSC",
            networkId: 56
        },
        {
            icon: solanaImg,
            label: "Solana"
        },
        {
            icon: polkadotImg,
            label: "Polkadot"
        }
    ]


    // async function connectToBinance() {
    //     try {
    //         if (typeof window.BinanceChain !== 'undefined') {
    //             const eth: any = await window.BinanceChain.enable()
    //             window.BinanceChain.on('accountsChanged', (accounts: any) => {
    //                 reloadPage()
    //             });
    //             if(window.BinanceChain.isConnected()){
    //                 onConnectWallet(eth, window.BinanceChain.chainId, "binance")
    //             }
    //             props.onClose()
    //         }else{
    //             props.onClose()
    //             return;
    //         }
    //     } catch (error) {
    //         // console.log(error)
    //     }
    // }

    // let web3: any;
    // let walletType: string;
    // const FALLBACK_WEB3_PROVIDER = 'https://rpc-mainnet.maticvigil.com';
    // const FALLBACK_WEB3_PROVIDER = 'wss://rpc-mainnet.matic.network';
    // const FALLBACK_WEB3_PROVIDER = 'http://127.0.0.1:7545';

    const getWeb3 = () => {
        return new Promise(async (resolve, reject) => {
            // Wait for loading completion to avoid race conditions with web3 injection timing.
            window.addEventListener("load", async () => {
                
                // const provider = new Web3.providers.HttpProvider(
                //     FALLBACK_WEB3_PROVIDER
                // );
                // const web3 = new Web3(provider);
                // console.log("No web3 instance injected, using Infura/Local web3.");
                // // const accounts = await web3.eth.request({ method: 'eth_requestAccounts' });
                // resolve(web3);
                // Modern dapp browsers...
                if (window.ethereum) {
                    // web3.setProvider(provider)
                    window.web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mainnet.maticvigil.com'));
                    await window.ethereum.enable();
                    window.ethereum._handleChainChanged({
                        chainId: 137,
                        networkVersion: 1,
                    });
                    resolve(window.web3);
                    // try {
                    //     // Request account access if needed
                    //     await window.ethereum.enable();
                    //     resolve(web3);
                    //     console.log("getWeb3")
                    //     // Acccounts now exposed
                    // } catch (error) {
                    //     reject(error);
                    // }
                }
                // // Legacy dapp browsers...
                // else if (window.web3) {
                //     // Use Mist/MetaMask's provider.
                //     const web3 = window.web3;
                //     console.log("Injected web3 detected.");
                //     resolve(web3);
                // }
                // // Fallback to localhost; use dev console port by default...
                // else {
                //     const provider = new Web3.providers.HttpProvider(
                //         FALLBACK_WEB3_PROVIDER
                //     );
                //     const web3 = new Web3(provider);
                //     console.log("No web3 instance injected, using Infura/Local web3.");
                //     resolve(web3);
                // }
            });
        });
    }

    const detectEthereumNetwork = async () => {
        console.log("click change network")
        const web3: any = await getWeb3();

        web3.eth.net.getNetworkType()
        .then(async (netId: any) => {
            // Do something based on which network ID the user is connected to
        });
    }

    function changeNetwork(id: number){
        detectEthereumNetwork();

        let network_data: any = NetworkArray[id]
        network_data[0].chainId_dec = undefined
        console.log(network_data)
        if (window.ethereum) {
            window.ethereum.request({ method: 'wallet_addEthereumChain', params: network_data })
            .catch()
        }
    }

    return (
        <>
            <Modal onHide={() => props.onClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect p-2">
                <ModalBody className=" btn-back-dark rounded p-4 border-gradient border-show white">
                    <div className="row flex p-4">
                        <p className="text-3xl text-center m-auto-h bold">
                            Select a network
                        </p>
                        <div className="close-window pointer" onClick={props.onClose}>
                            <i className="fa remix ri-close-fill fs-32"></i>
                        </div>
                    </div>
                    <p>
                        You are currently browsing 
                        <span className="fc-orange text-lg bold"> SantaFe</span><br />
                         on the&nbsp;&nbsp;
                         <span className="c-blue text-lg bold">
                            {
                                isCorrectNet === true ? 
                                NetworkArray[connectedNetwork][0].chainName + " (" + NetworkArray[connectedNetwork][0].nativeCurrency.name + ")"
                                : 
                                " Wrong"
                            }
                        </span> network
                    </p>
                    <div className="modalContent flex text-center">
                        {
                            networks.map((item: any, index: any) =>
                                <div 
                                className={cn("flex col-md-6 my-2 pointer btn-hover", {"disabled":index>1})} key={index} aria-disabled={true}>
                                    <div 
                                    className={"p-2 flex w-100 back-dark3 rounded mr-2 " + (((networkId === item.networkId) && (isCorrectNet === true)) ? "border-gradient border-show" : "")} 
                                    onClick={() => changeNetwork(index)}>
                                        <img src={item.icon} className="size-32px rounded m-auto-v" alt="" />
                                        <p className="m-auto-v mx-3">
                                            {item.label}
                                        </p>
                                    </div>
                                    <p className="fc-grey left px-3 mb-0" hidden={index < 2} >{index < 2 ? <br /> : "Coming soon"}</p>
                                </div>
                            )
                        }
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default ChangeWallet

