import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Web3 from "web3";
import AOS from 'aos';
import 'aos/dist/aos.css';


import "./assets/vendor/bootstrap/css/bootstrap.min.css";
import "./assets/vendor/icofont/icofont.min.css";
import "./assets/vendor/boxicons/css/boxicons.min.css";
import "./assets/vendor/remixicon/remixicon.css";
// import "./assets/vendor/aos/aos.css";

import "./assets/flickity/flickity.css"

import "./assets/playerx/framework/lib/icons-pack/font-awesome/css/fontawesome-all.min.css?ver=5.6";

import "./components/common/sass/common.scss"
import "./components/common/sass/light.scss"

import "./components/common/fonts/fonts.css"

// import '../node_modules/alertifyjs/build/css/alertify.min.css';

import Header from "./components/pages/Home/Header"
import Footer from "./components/pages/Home/Footer";
import Notification from "./components/parts/Notification";
import Pool from "./components/pages/Pool"
import Swap from "./components/pages/Swap"
import KainuStaking from "./components/pages/Pool/Kainu";
import OldKainuStaking from "./components/pages/Pool/OldKainu";
import OlympicStaking from "./components/pages/Pool/Olympic";
import Forge from "./components/pages/Oaxaca/Forge"
import BlindFi from "./components/pages/Oaxaca/BlindFi";
import Market from "./components/pages/Market";
import Nft from "./components/pages/Nft";
import Portfolio from "./components/pages/Portfolio";
import ManageCifiPanel from "./components/pages/Manage/CifiPanel";
import ManageBlindFiPanel from "./components/pages/Manage/BlindFiPanel";
import FamosoBlackList from "./components/pages/Manage/FamosoBlackList";

import { AppContext } from "./components/common/libs/context";
import { changeStorage, getBalanceStr, validateWalletAddres } from "./components/common/libs/functions";
import { networks, chains } from "./components/common/libs/data";
import { contractAddress } from "./contracts";

import contracts from "./contracts";

import darkImg from "./assets/img/icons/dark.jpg"
import 'alertifyjs/build/css/alertify.css';
import jQuery from "jquery";
import i18n from "./i18n";
import withClearCache from "./ClearCache";

import { useAppDispatch, useAppSelector } from './app/hook'
import { RootState } from './app/store'
import { NETWORK_TYPES } from "./components/common/libs/constant";
import { setCurTimestamp } from "./app/reducers/appSlice";

var alertify = require('alertifyjs')
alertify.set('notifier', 'position', 'bottom-center');

const ClearCacheComponent = withClearCache(MainApp);

function App() {
  return <ClearCacheComponent />;
}

function MainApp() {

  const dispatch = useAppDispatch()

  const swapCount = useAppSelector((state: RootState) => state.swapSlice.swapCount)
  const liquidityCount = useAppSelector((state: RootState) => state.swapSlice.liquidityCount)

  const [isInit, setIsInit] = useState<boolean>(false)

  const [showConnectWallet, setShowConnectWallet] = useState<boolean>(false)

  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isCorrectNet, setIsCorrectNet] = useState<boolean>(false)
  const [networkId, setNetWorkId] = useState<number>(-1)
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [balance, setBalance] = useState<string>("0")
  const [cifiBalance, setCifiBalance] = useState<string>("0")
  const [symbol, setSymbol] = useState<string>("")
  const [networkName, setNetworkName] = useState<string>("Wrong Network")
  const [chainIcon, setChainIcon] = useState<any>(darkImg)
  const [appSetting, setAppSetting] = useState<any>()
  const [checkedConnection, setCheckedConnection] = useState<boolean>(false)
  const [appWeb3, setAppWeb3] = useState<Web3>(new Web3(chains[0].rpc))
  const [connectedNetwork, setConnectedNetwork] = useState<NETWORK_TYPES>(NETWORK_TYPES.MATIC_MAIN)

  const [rpcUrl, setRpcUrl] = useState<any>(chains[0].rpc)

  useEffect(() => {
    updateBalance()
  }, [swapCount, liquidityCount])

  init()
  function init() {
    if (isInit) return
    setIsInit(true)
    AOS.init()
    initSettting()
    updateCurTime()
  }

  function updateCurTime(){
    let curTimestamp: any  = new Date().getTime() + (new Date().getTimezoneOffset() * 60000)
    dispatch(setCurTimestamp(curTimestamp))
    setTimeout(() => {
      updateCurTime()
    }, 1000)
  }

  function initSettting() {
    const setting: any = JSON.parse(localStorage.getItem('setting-data') || "{}");
    console.log("setting", setting)
    const defaultSetting: any = {
      theme: true,
      language: setting.language || "en",
      swap: {
        speed: 0,
        tolerance: 0,
        deadline: 0,
        expert: false,
        multishops: false,
        sound: true
      }
    }

    if (i18n.language === 'en-US') i18n.changeLanguage("en")

    if (setting.theme === false) defaultSetting.theme = false
    if (i18n.language === 'en-US') defaultSetting.language = "en"
    else defaultSetting.language = i18n.language

    if (defaultSetting.theme === false) {
      jQuery("body").addClass("light")
    } else {
      jQuery("body").removeClass("light")
    }
    setAppSetting(defaultSetting)
  }

  function onConnectWallet(account: any, networkId: any) {
    setNetWorkId(networkId)
    if(networkId === 137)   setConnectedNetwork(NETWORK_TYPES.MATIC_MAIN)
    if(networkId === 56)    setConnectedNetwork(NETWORK_TYPES.BSC_MAIN)
    if(networkId === 80001) setConnectedNetwork(NETWORK_TYPES.MATIC_TEST)
    if(networkId === 97)    setConnectedNetwork(NETWORK_TYPES.BSC_TEST)
    setWalletAddress(account)
    if (!validateWalletAddres(walletAddress)) return

    updateBalance()

    setIsConnected(true)
    if (networks.indexOf(networkId) > -1) {
      let index: any = networks.indexOf(networkId)
      setSymbol(chains[index].symbol)
      setNetworkName(chains[index].label)
      setChainIcon(chains[index].icon)
  
      setRpcUrl(chains[index].rpc)
      // setAppWeb3(new Web3(chains[index].rpc))
      setIsCorrectNet(index > -1)
      // if (curNetwork === networkId) setIsCorrectNet(true)
      // else setIsCorrectNet(false)
    }
  }

  function updateBalance() {
    if (isConnected === true) {
      window.web3.eth.getBalance(walletAddress)
        .then((bal: any) => {
          // console.log('update ETH balance', bal)
          setBalance(getBalanceStr(bal, 18))
        })
      let cifiContract: any = new window.web3.eth.Contract(contracts.abis.Cifi_Token, contractAddress[connectedNetwork].Cifi_Token)
      cifiContract.methods.balanceOf(walletAddress)
      .call()
      .then((cifiBal: any) => {
        setCifiBalance(getBalanceStr(cifiBal, 18))
        // console.log('update cifi balance', cifiBal)
      })
    }
    setTimeout(() => {
      updateBalance()
    }, 1000 * 3);
  }

  const changeTheme = (key: any, value: any) => {
    let data: any = appSetting;
    data[key] = value
    changeStorage("setting-data", data)
    initSettting()
  }

  return (
    <div>
      <BrowserRouter>
        <Switch>
          <AppContext.Provider
            value={{
              isConnected: isConnected,
              setIsConnected: setIsConnected,
              isCorrectNet: isCorrectNet,
              setIsCorrectNet: setIsCorrectNet,
              connectedNetwork: connectedNetwork,
              rpcUrl: rpcUrl,
              appWeb3 : appWeb3,

              showConnectWallet: showConnectWallet,
              setShowConnectWallet: setShowConnectWallet,
              onConnectWallet: onConnectWallet,
              walletAddress: walletAddress,
              networkId: networkId,
              balance: balance,
              cifiBalance: cifiBalance,
              symbol: symbol,
              networkName: networkName,
              chainIcon: chainIcon,

              contracts: contracts,
              appSetting: appSetting,
              initSettting: initSettting,
              changeTheme: changeTheme,

              checkedConnection: checkedConnection,
              setCheckedConnection: setCheckedConnection
            }}>
            <Header />
            {
              isInit ?
                <>
                  {
                    isConnected&&isCorrectNet ?
                      connectedNetwork === NETWORK_TYPES.MATIC_MAIN?
                            <Switch>
                              <Route exact path={["/kainu", "/kainu/*"]}>
                                <KainuStaking />
                              </Route>
                              <Route exact path={["/old-kainu", "/old-kainu/*"]}>
                                <OldKainuStaking />
                              </Route>
                              <Route exact path={["/olympic", "/olympic/*"]}>
                                <OlympicStaking />
                              </Route>
                              <Route exact path={["/forge", "/forge/*"]}>
                                <Forge />
                              </Route>
                              <Route exact path={["/market", "/market/*"]}>
                                <Market />
                              </Route>
                              <Route exact path={["/nft", "/nft/*"]}>
                                <Nft />
                              </Route>
                              <Route exact path={["/portfolio", "/portfolio/*"]}>
                                <Portfolio />
                              </Route>
                              <Route exact path={["/lootbox"]}>
                                <BlindFi />
                              </Route>
                              <Route exact path={["/"]}>
                                <Pool />
                              </Route>
                            </Switch>
                          :
                          connectedNetwork === NETWORK_TYPES.BSC_MAIN?
                            <Switch>
                              <Route exact path={["/"]}>
                                <Pool />
                              </Route>
                            </Switch>
                            :
                            connectedNetwork === NETWORK_TYPES.MATIC_TEST?
                            <Switch>
                              {/* <Route exact path={["/kainu", "/kainu/*"]}>
                                <KainuStaking />
                              </Route>
                              <Route exact path={["/olympic", "/olympic/*"]}>
                                <OlympicStaking />
                              </Route> */}
                              <Route exact path={["/lootbox"]}>
                                <BlindFi />
                              </Route>
                              {/* <Route exact path={["/cifipanel"]}>
                                <ManageCifiPanel />
                              </Route>
                              <Route exact path={["/blindfipanel"]}>
                                <ManageBlindFiPanel />
                              </Route> */}
                              <Route exact path={["/market", "/market/*"]}>
                                <Market />
                              </Route>
                              <Route exact path={["/forge", "/forge/*"]}>
                                <Forge />
                              </Route>
                              <Route exact path={["/famosoblacklist"]}>
                                <FamosoBlackList />
                              </Route>
                              <Route exact path={["/swap", "/swap/*"]}>
                                <Swap />
                              </Route>
                              <Route exact path={["/nft", "/nft/*"]}>
                                <Nft />
                              </Route>
                              <Route exact path={["/portfolio", "/portfolio/*"]}>
                                <Portfolio />
                              </Route>
                              <Route exact path={["/"]}>
                                <Pool />
                              </Route>
                            </Switch>
                            :
                            connectedNetwork === NETWORK_TYPES.BSC_TEST?
                            <Switch>
                              {/* <Route exact path={["/cifipanel"]}>
                                <ManageCifiPanel />
                              </Route>
                              <Route exact path={["/blindfipanel"]}>
                                <ManageBlindFiPanel />
                              </Route>
                              <Route exact path={["/famosoblacklist"]}>
                                <FamosoBlackList />
                              </Route>
                              <Route exact path={["/lootbox"]}>
                                <BlindFi />
                              </Route> */}
                              <Route exact path={["/swap", "/swap/*"]}>
                                <Swap />
                              </Route>
                            </Switch>
                            :
                            <div className="w-100 flex text-center mn-h-70vh">
                              <div className="m-auto text-center flex w-fit">
                                <div className="loader-animation m-auto-v"></div>
                              </div>
                            </div>
                      :
                      <div className="w-100 flex text-center mn-h-70vh">
                        <div className="m-auto text-center flex w-fit">
                          <div className="loader-animation m-auto-v"></div>
                        </div>
                      </div>
                  }
                </>
                :
                <div className="w-100 flex text-center mn-h-70vh">
                  <div className="m-auto text-center flex w-fit">
                    <div className="loader-animation m-auto-v"></div>
                  </div>
                </div>
            }
            <Notification />
          </AppContext.Provider>
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default App;
