import React from "react";
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
// import { withTranslation } from 'react-i18next'
import Web3 from "web3"
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

// import imgLogo   from "../../../../assets/img/icons/SantaFe2.png"
// import walletSvg from "./img/wallet.svg"


import binanceNetworkImg from "../../../../assets/img/icons/bsc.svg"
import polygonNetworkImg from "../../../../assets/img/icons/polygon.svg"
import metamaskSvg       from "../../../../assets/img/icons/metamask.svg"
import walletConnectSvg  from "../../../../assets/img/icons/wallet-connect.svg"

import mathImg     from "./img/math.png"
// import binanceImg  from "./img/binance.png"

import "./connect-wallet.scss"
import { useAppContext } from "../context";

import { RootState } from '../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../app/hook'
import { onConnectWallet1 } from '../../../../app/reducers/appSlice'
import { getReadTerms, setReadTerms, setNetwork, setWallet, connectToMetamask } from "./connectWalletSlice"
declare global {
    interface Window {
        ethereum:any;
        BinanceChain:any;
        web3:any;
    }
}

function ConnectWallet(props: any) {

    const dispatch  = useAppDispatch()
    const readTerms = useAppSelector((state: RootState) => state.connectWallet.readTerms)
    const network   = useAppSelector((state: RootState) => state.connectWallet.network)
    const wallet    = useAppSelector((state: RootState) => state.connectWallet.wallet)

    const { onConnectWallet, setCheckedConnection } = useAppContext();

    async function connectToMetamask_(){
        dispatch(setWallet(0))
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            window.ethereum.on('accountsChanged', function (accounts: any){
                reloadPage()
            })
            if(accounts.length){
                const account = accounts[0];
                onConnectWallet(account, window.ethereum.chainId, "metamask")
            }
            props.onClose()
        }else{
            props.onClose()
            return
        }
    }

    async function connectToMath(){
        dispatch(setWallet(2))
        if (typeof window.ethereum !== 'undefined') {
            await window.ethereum.enable()
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            window.ethereum.on('accountsChanged', function (accounts: any){
                reloadPage()
            })
            if(accounts.length){
                const account = accounts[0];
                onConnectWallet(account, window.ethereum.chainId, "math")
            }
            props.onClose()
        }else{
            props.onClose()
            return
        }
    }

    async function connectToTrust(){
        dispatch(setWallet(1))
        const connector = new WalletConnect({
            bridge: "https://bridge.walletconnect.org", // Required
            qrcodeModal: QRCodeModal,
          });
          
          // Check if connection is already established
          if (!connector.connected) {
            // create new session
            connector.createSession();
          }
          
          // Subscribe to connection events
          connector.on("connect", (error: any, payload: any) => {
            if (error) {
              throw error;
            }
          
            // Get provided accounts and chainId
            const { accounts, chainId } = payload.params[0];
            onConnectWallet(accounts[0], chainId, "trust")
          });
          
          connector.on("session_update", (error: any, payload: any) => {
            if (error) {
              throw error;
            }
          
            // Get updated accounts and chainId
            const { accounts, chainId } = payload.params[0];
            onConnectWallet(accounts[0], chainId, "trust")
            reloadPage()
          });
          
          connector.on("disconnect", (error: any, payload: any) => {
            if (error) {
              throw error;
            }
            props.onDisconnected()
          });
    }
    
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
    let walletType: string;
    let account: string;
    let chainId : number

    function reloadPage(){
        window.location.reload()
    }
    
    const checkConnection = async () => {
        if(window.ethereum){
            window.web3 = new Web3(window.ethereum);
            walletType = "metamask"
            await window.web3.eth.getAccounts()
            .then(async (accounts: Array<string>) => {
                setCheckedConnection(true)
                if(accounts.length === 0)return
                let addr: string = accounts[0]
                if(addr === "" || String(addr).trim().length === 0 || addr === undefined) return;
                else {
                    account = addr
                    window.web3.eth.getChainId().then(async (chainID: number) => {
                        chainId = chainID
                        onConnectWallet(account, chainId, walletType)
                        dispatch(onConnectWallet1({
                            account: account,
                            chainId: window.ethereum.chainId,
                            connectedWallet: "metamask"
                        }))
                    })
                }
            });
            window.ethereum.on('accountsChanged', function (accounts: any){
                reloadPage()
            })
            window.ethereum.on('chainChanged', function (chainId: string){
                reloadPage()
            });
        }
        else if(window.BinanceChain) {
            const eth: any = await window.BinanceChain.enable()
            setCheckedConnection(true)
            window.BinanceChain.on('accountsChanged', (accounts: any) => {
                reloadPage()
            });

            if(window.BinanceChain.isConnected()){
                if(eth.length > 0)onConnectWallet(eth[0], window.BinanceChain.chainId, "binance")
            }
        }else{
            setCheckedConnection(true)
        }
    };

    React.useEffect(() => {
        checkConnection();
    });

    React.useEffect(() => {
        dispatch(connectToMetamask(onConnectWallet, props.onClose))
        dispatch(getReadTerms())
    }, [dispatch]);

    const clickNetwork = (id: number) => {
        return dispatch(setNetwork(id))
    }

    return (
        <>
        <Modal onHide={() => props.onClose()} show={props.isModalOpen} centered className="modal-dialog-wallet-connect p-2"> 
            <ModalBody className=" btn-back-dark rounded p-4 white">
                <div className="row flex p-4">
                    <p className="text-3xl left m-auto-v bold">
                        Connect Wallet
                    </p>
                    <div className="close-window pointer right" onClick={props.onClose}>
                        <i className="fa remix ri-close-line text-3xl"></i>
                    </div>
                </div>
                {/* <div className="modalContent flex text-center">
                    <div className="flex my-2 back-black rounded-50 p-3 m-4 pointer" onClick={connectToMetamask}>
                        <img src={metaMaskImg} className="w-40px m-auto-v" alt=""/>
                    </div>
                    <div className="flex my-2 back-black rounded-50 p-3 m-4 pointer" onClick={connectToTrust}>
                        <img src={trustImg} className="w-40px m-auto-v" alt=""/>
                    </div>
                    <div className="connect-item meta-mask" onClick={connectToMetamask}>
                        <img src={mathImg} alt=""/>
                        <div className="text">Mathwallet</div>
                        {(props.isConnected && props.connectType === "math") ? props.isCorrectNet ? <i className="remix connect ri-wifi-fill" title="Disconnect"></i> : <i className="remix connect ri-wifi-off-fill" title="Disconnect"></i> : <></>}
                    </div>
                </div> */}
                <div className="flex-col">
                    <div className="flex-col my-2">
                        <div className="flex">
                            <span className="back-dark rounded-50 flex text-center size-24px mr-2">
                                <span className="m-auto c-blue">1</span>
                            </span>
                            <div className="flex-col">
                                <p className="text-lg">Accept <a href="/" target="_blank" rel="noreferrer" className="c-blue hover-blue hover-underline">Terms of Service</a> and <a href="/" target="_blank" rel="noreferrer" className="c-blue hover-blue hover-underline">Privacy Policy</a></p>
                            </div>
                        </div>
                        <div className="form-check ml-4 pl-4">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                onChange={() => dispatch(setReadTerms(!readTerms))}
                                checked={readTerms}
                                value="" 
                                id="flexCheckDefault"/>
                            <label className="form-check-label pointer" htmlFor="flexCheckDefault">
                                &nbsp;I read and accept
                            </label>
                        </div>
                    </div>
                    <div className="flex-col my-2">
                        <div className="flex">
                            <span className="back-dark rounded-50 flex text-center size-24px mr-2">
                                <span className="m-auto c-blue">2</span>
                            </span>
                            <p className="text-lg">Choose Network</p>
                        </div>
                        <div className="flex ml-4 pl-2">
                            <div className="flex-col text-center pointer py-3 px-4 hover-back-dark rounded" onClick={() => clickNetwork(0)}>
                                <div className={"relative " + (network === 0 ? 'checked-svg' : '')}>
                                    <img className="size-60px m-auto-h" src={polygonNetworkImg} alt="" />
                                </div>
                                <p className="my-2 text-sm">Polygon</p>
                            </div>
                            <div className="flex-col text-center pointer py-3 px-4 hover-back-dark rounded" onClick={() => clickNetwork(1)}>
                                <div className={"relative " + (network === 1 ? 'checked-svg' : '')}>
                                    <img className="size-60px m-auto-h" src={binanceNetworkImg} alt="" />
                                </div>
                                <p className="my-2 text-sm">Binance</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-col my-2">
                        <div className="flex">
                            <span className="back-dark rounded-50 flex text-center size-24px mr-2">
                                <span className="m-auto c-blue">3</span>
                            </span>
                            <p className="text-lg">Choose Wallet</p>
                        </div>
                        <div className="flex ml-4 pl-2">
                            <div className="flex-col text-center pointer py-3 px-4 hover-back-dark rounded" onClick={() => dispatch(connectToMetamask(onConnectWallet, props.onClose))}>
                                <div className={"relative " + (wallet === 0 ? 'checked-svg' : '')}>
                                    <img className="size-60px m-auto-h" src={metamaskSvg} alt="" />
                                </div>
                                <p className="my-2 text-sm">Metamask</p>
                            </div>
                            <div className="flex-col text-center pointer py-3 px-4 hover-back-dark rounded" onClick={connectToMath}>
                                <div className={"relative " + (wallet === 2 ? 'checked-svg' : '')}>
                                    <img className="size-60px m-auto-h back-white rounded-50 p-1" src={mathImg} alt="" />
                                </div>
                                <p className="my-2 text-sm">Math Wallet</p>
                            </div>
                            <div className="flex-col text-center pointer py-3 px-4 hover-back-dark rounded" onClick={connectToTrust}>
                                <div className={"relative " + (wallet === 1 ? 'checked-svg' : '')}>
                                    <img className="size-60px m-auto-h" src={walletConnectSvg} alt="" />
                                </div>
                                <p className="my-2 text-sm">Wallet Connect</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="m-auto-h text-center">
                    <div className="text-lg">
                        Read and agree to <i className="icofont-curved-double-left"></i>SantaFe User Agreement<i className="icofont-curved-double-right"></i>
                    </div>
                    <div className="custom-control custom-radio my-4 fc-grey">
                        <input type="radio" className="custom-control-input" id="customRadio" checked={true} onChange={() => {}} name="example1" value="customEx" />
                        <label className="custom-control-label" htmlFor="customRadio">I have read and agreed</label>
                    </div>
                </div>
                <div className="flex btn-back-dark text-center p-4">
                    <p className="fc-grey">
                        You are requested to complete your own risk survey, and your use and access to this website is at your own risk
                    </p>
                </div> */}
            </ModalBody>
        </Modal>
        </>
    );
}

// export default withTranslation('common')(ConnectWallet)
export default ConnectWallet

