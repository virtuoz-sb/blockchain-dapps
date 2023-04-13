import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { withTranslation } from 'react-i18next'

import i18n from "../../../../i18n"
import logoImg from "../../../../assets/img/logo.png";

import themeSvg from "../../../../assets/img/icons/svg/theme.svg";

import jQuery from "jquery";

import "./header.scss"

import { socialLinks } from "../Footer/socialLinks"
import { cur_langs } from "./langs"

import ConnectWallet from "../../../common/libs/ConnectWallet";
import ChangeWallet from "../../../common/libs/ChangeWallet";
import { useAppContext } from "../../../common/libs/context";
import { shortAddress, changeStorage } from "../../../common/libs/functions";

import { useAppDispatch, useAppSelector } from '../../../../app/hook'
import { RootState } from '../../../../app/store'
import { setActiveHeaderMenu } from "../../../../app/reducers/appSlice";

import { isAdmin } from "../../../common/libs/functions/integrate";
import { net_state } from "../../../../contracts";
import { MENU_LIST } from "../../../common/libs/constant";


function Header() {
    const dispatch = useAppDispatch()
    const activeHeaderMenu = useAppSelector((state: RootState) => state.app.activeHeaderMenu)
    const isConnected = useAppSelector((state: RootState) => state.app.network.isConnected)
    const walletAddress = useAppSelector((state: RootState) => state.app.account.walletAddress)
    const appSetting = useAppSelector((state: RootState) => state.app.appSetting)

    const symbol = useAppSelector((state: RootState) => state.app.network.symbol)
    const networkName = useAppSelector((state: RootState) => state.app.network.networkName)
    const chainIcon = useAppSelector((state: RootState) => state.app.network.chainIcon)
    const isCorrectNet = useAppSelector((state: RootState) => state.app.network.isCorrectNet)

    const [showChangeWallet, setShowChangeWallet] = useState<boolean>(false)
    const { initSettting, showConnectWallet, setShowConnectWallet, balance } = useAppContext()
    const [showSetting, setShowSetting] = useState<boolean>(false)
    const [showLanguageSelect, setShowLanguageSelect] = useState<boolean>(false)

    // const isConnected = useAppSelector((state: RootState) => state.app.network.isConnected)
    // const walletAddress = useAppSelector((state: RootState) => state.app.account.walletAddress)

    const url = window.location.pathname;
    useEffect(() => {
        let tmLoc = new Date();
        let curTime = tmLoc.getTime() + tmLoc.getTimezoneOffset() * 60000;
        console.log("init", curTime, url)
    }, [dispatch, url])

    // console.log("i18n.language", i18n.language)
    // jQuery(document).click(function(event: any) { 
    //     var $target = jQuery(event.target);
    //     if(event.target.id === "hompage-setting-global-header-open" || event.target.id === "settings4") return
    //     if(!$target.closest('#hompage-setting-global-header').length ) {
    //         setShowSetting(false)
    //     }        
    //   });

    function toggleMobileMenu() {
        console.log("toggle")
        jQuery(".mobile-toggle-menu").toggleClass('show');
        jQuery(".mobile-toggle-icon").toggleClass('active');
        jQuery("body").toggleClass("h-full")
    }

    function closeMobile() {
        jQuery(".mobile-toggle-menu").removeClass('show');
        jQuery(".mobile-toggle-icon.close").removeClass('active');
        jQuery(".mobile-toggle-icon.open").addClass('active');
        jQuery("body").removeClass("h-full")
    }

    function selectHeaderMenu(menu: number){
        closeMobile() 
        dispatch(setActiveHeaderMenu(menu))
    }

    function changeNetwork() {
        setShowChangeWallet(true)
    }

    function openSetting() {
        setShowSetting(true)
    }

    const nftDropdown: any = [
        {
            label: "Forge",
            link: net_state === 0 ? "/" : "/forge"
        },
        {
            label: "BlindFi",
            link: net_state === 0 ? "/" : "/blind"
        },
        {
            label: "Bonds",
            link: "/"
        },
        {
            label: "Assets",
            link: "/"
        }
    ]

    function changeTheme() {
        let data: any = appSetting;
        data.theme = (appSetting.theme === true ? false : true)
        changeStorage("setting-data", data)
        initSettting()
    }

    function changeLanguage(lang: any) {
        setShowLanguageSelect(false)
        i18n.changeLanguage(lang);

        let data: any = appSetting;
        data.language = lang
        changeStorage("setting-data", data)
        initSettting()
    }

    function openProfile() {
        closeMobile()
        setShowSetting(false)
        dispatch(setActiveHeaderMenu(100))
    }

    return (
        <>
            <nav className="header header-app m-auto-h p-3 flex white ff-point-cufon b-b-gradient pl-4">
                <div className="flex sp-w-100">
                    <div className="flex sp-w-100">
                        <Link
                            to="/"
                            className="pl-4 text-lg link active m-auto-v"
                            onClick={() => closeMobile()} >
                            <img src={logoImg} alt="" className="w-4vw m-auto-v mobile-fix-l-t light-dark" />
                        </Link>

                        <svg
                            className="w-24px pc-hide right mobile-toggle-icon open m-auto-v active"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                            onClick={() => toggleMobileMenu()}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        </svg>
                        <svg
                            className="w-24px pc-hide right mobile-toggle-icon close m-auto-v white"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                            onClick={() => toggleMobileMenu()}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <div className="toggle-mobile mobile-toggle-menu flex sp-flex-col m-auto-v sp-m-2 mx-4 p-2 sp-h-100vh">
                        <Link to="/" onClick={() => selectHeaderMenu(0)} className={"p-2 text-lg link  m-auto-v sp-my-2 sp-fs-40 sp-my-4 " + (activeHeaderMenu === 0 ? "active" : "")}>{i18n.t("words.pools")}</Link>
                        <div className="dropdown nft flex p-2" >
                            <div
                                className="dropdown-toggle after-none flex m-auto-v pointer"
                                id="dropdownMenuButton"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                                data-hover="dropdown">
                                <span className={"m-auto-v fc-grey text-lg sp-fs-40 "+ ( (activeHeaderMenu >= 10) && (activeHeaderMenu < 20) ?  "active" : "")}>Oaxaca</span>
                                <span className="m-auto-v">
                                    <i className="icofont-thin-down"></i>
                                </span>
                            </div>
                            <div className="dropdown-menu dropdown-menu-right btn-back-dark p-3 rounded" aria-labelledby="dropdownMenuButton" data-hover="dropdown">
                                {
                                    nftDropdown.map((item: any, index: any) =>
                                        <div className="dropdown-item pointer hover-back-dark rounded my-2 py-2 px-3 sp-my-4" key={index}>
                                            <Link onClick={() => selectHeaderMenu(index + 10)} to={item.link} className={"hover-white text-lg sp-fs-40  " + (activeHeaderMenu !== (index + 10) ? "fc-grey" : "white")}>{item.label}</Link>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <Link onClick={() => selectHeaderMenu(20)} to="/swap"     className={"p-2 text-lg link  m-auto-v sp-my-2 sp-fs-40 sp-my-4 " + (activeHeaderMenu === MENU_LIST.SWAP ? "active" : "")}>{i18n.t("words.swap")}</Link>
                        <Link onClick={() => selectHeaderMenu(30)} to={"/market"} className={"p-2 text-lg link  m-auto-v sp-my-2 sp-fs-40 sp-my-4 " + (activeHeaderMenu === MENU_LIST.MARKET ? "active" : "")}>{i18n.t("words.market_place")}</Link>
                        {
                            isConnected && isCorrectNet && isAdmin(walletAddress) ?
                                <>

                                    <div className="dropdown nft flex p-2" >
                                        <div
                                            className="dropdown-toggle after-none flex m-auto-v pointer"
                                            id="dropdownMenuButton"
                                            data-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                            data-hover="dropdown">
                                            <span className={"m-auto-v fc-grey text-lg sp-fs-40 "+ ( (activeHeaderMenu >= 70) && (activeHeaderMenu < 80) ?  "active" : "")}>Manage</span>
                                            <span className="m-auto-v">
                                                <i className="icofont-thin-down"></i>
                                            </span>
                                        </div>
                                        <div className="dropdown-menu dropdown-menu-right btn-back-dark p-3 rounded" aria-labelledby="dropdownMenuButton" data-hover="dropdown">
                                            <div className="dropdown-item pointer hover-back-dark rounded my-2 py-2 px-3 sp-my-4">
                                                <Link onClick={() => selectHeaderMenu(70)} to="/cifipanel" className={"hover-white text-lg sp-fs-40 " + (activeHeaderMenu === MENU_LIST.CIFI_PANEL ? "white" : "")}>CIFI Panel</Link>
                                            </div>
                                            <div className="dropdown-item pointer hover-back-dark rounded my-2 py-2 px-3 sp-my-4">
                                                <Link onClick={() => selectHeaderMenu(71)} to="/blindfipanel" className={"hover-white text-lg sp-fs-40 " + (activeHeaderMenu === MENU_LIST.BLIND_PANEL ? "white" : "")}>BlindFi Panel</Link>
                                            </div>
                                        </div>
                                    </div>
                                </>
                                : <></>
                        }
                        {/* <Link onClick={() => closeMobile()} to="/" className="p-2 text-lg link  m-auto-v sp-my-2 sp-fs-40 sp-my-4">{i18n.t("words.bank") }</Link> */}
                        {/* <Link onClick={() => closeMobile()} to="/portfolio?tab=wallet" className="p-2 text-lg link  m-auto-v sp-my-2 sp-fs-40 sp-my-4">{i18n.t("words.profile") }</Link> */}
                    </div>
                </div>
                <div className="flex right sp-bottom-part py-1">
                    <div className="btn-back-dark br-6 p-2px flex mx-2 xs-hide" hidden={!isConnected}>
                        <div className="back-dark3 br-6 size-full flex pointer py-2 px-3">
                            <img src={chainIcon} alt="" className="size-22px br-6 m-auto-v mr-2" />
                            <span className='m-auto-v'>{networkName}</span>
                        </div>
                    </div>
                    <div className="btn-back-dark br-6 p-1 flex wrap-not m-auto-h pointer">
                        {
                            isConnected === true ?
                                isCorrectNet === true ?
                                    <>
                                        <span className="btn-back-dark mx-2 m-auto-v no-wrap">{balance + " " + symbol}</span>
                                        <div className="back-dark3 br-6 size-full flex pointer p-2" onClick={() => changeNetwork()}>
                                            <span className='m-auto-v'>{shortAddress(walletAddress)}</span>
                                            <img src={chainIcon} alt="" className="size-22px br-6 m-auto-v mx-2" />
                                        </div>
                                    </>
                                    :
                                    <div className="btn-back-dar text-center item-center px-4 py-2 flex" onClick={() => changeNetwork()}>
                                        <span className="m-auto">{i18n.t("words.wrong_network")}</span>
                                    </div>
                                :
                                <div className="btn-back-dar text-center item-center px-4 py-2 flex" onClick={() => setShowConnectWallet(true)}>
                                    <span className="m-auto">Connect wallet</span>
                                </div>
                        }
                    </div>
                    <div className="flex mx-2">
                        <div className="dropdown flex" >
                            <div className="dropdown-toggle after-none flex pointer m-auto-v" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="m-auto">
                                    <svg width="16px" height="16px" className="inline-flex items-center w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                </span>
                            </div>
                            <div className="dropdown-menu dropdown-menu-right btn-back-dark rounded p-3" aria-labelledby="dropdownMenuButton">
                                {
                                    socialLinks.map((item: any, index: any) =>
                                        <a onClick={() => closeMobile()} href={item.link} key={index} className="dropdown-item flex-col rounded p-3 hover-back-dark">
                                            <p className="white mb-0 text-capitalize">{item.label}</p>
                                            <p className="fc-grey mb-0">Documentation for users of SantaFe</p>
                                        </a>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div className="flex mx-2 pointer relative">
                        <span className="m-auto mx-2 size-24px pointer" id="hompage-setting-global-header-open" onClick={() => openSetting()}>
                            <svg xmlns="http://www.w3.org/2000/svg" id="settings4" viewBox="0 0 25 24" fill="none">
                                <path d="M17.1871 17.2321L16.6871 18.0981L16.6871 18.0981L17.1871 17.2321ZM19.9191 16.5L19.0531 16H19.0531L19.9191 16.5ZM19.1871 13.768L19.6871 12.9019L19.1871 13.768ZM19.1871 10.2321L19.6871 11.0981L19.1871 10.2321ZM19.9191 7.50003L19.0531 8.00003L19.0531 8.00003L19.9191 7.50003ZM17.1871 6.76797L16.6871 5.90195L17.1871 6.76797ZM7.06271 6.76797L7.56271 5.90195L7.06271 6.76797ZM4.33066 7.50003L5.19669 8.00003H5.19669L4.33066 7.50003ZM5.06271 10.2321L5.56271 9.36605H5.56271L5.06271 10.2321ZM5.06271 13.768L4.56271 12.9019H4.56271L5.06271 13.768ZM4.33066 16.5L5.19669 16L4.33066 16.5ZM7.06271 17.2321L7.56271 18.0981L7.56271 18.0981L7.06271 17.2321ZM5.61325 10.5499L5.11325 11.416L5.61325 10.5499ZM6.13777 11.6036L5.13989 11.5385L6.13777 11.6036ZM8.78903 7.01205L9.3457 7.84278L8.78903 7.01205ZM7.6131 7.08574L7.1131 7.95177L7.6131 7.08574ZM18.112 11.6036L19.1099 11.5385L18.112 11.6036ZM18.6365 10.5499L19.1365 11.416L18.6365 10.5499ZM14.7761 17.3839L14.3337 16.4872L14.7761 17.3839ZM16.6367 7.08575L16.1367 6.21972L16.6367 7.08575ZM15.4607 7.01206L14.9041 7.84279L15.4607 7.01206ZM14.7761 6.61605L15.2186 5.71926L14.7761 6.61605ZM15.4607 16.988L14.904 16.1572L15.4607 16.988ZM16.6366 16.9143L17.1366 16.0483L16.6366 16.9143ZM7.61314 16.9143L7.11314 16.0483L7.61314 16.9143ZM8.78906 16.988L9.34573 16.1572L8.78906 16.988ZM18.6365 13.4501L18.1365 14.3161L18.6365 13.4501ZM18.112 12.3965L17.1141 12.3314L18.112 12.3965ZM12.1249 20C11.5726 20 11.1249 19.5523 11.1249 19H9.12491C9.12491 20.6569 10.4681 22 12.1249 22V20ZM13.1249 19C13.1249 19.5523 12.6772 20 12.1249 20V22C13.7818 22 15.1249 20.6569 15.1249 19H13.1249ZM13.1249 18.3657V19H15.1249V18.3657H13.1249ZM14.904 16.1572C14.7219 16.2793 14.5314 16.3896 14.3337 16.4872L15.2186 18.2807C15.4958 18.144 15.7626 17.9894 16.0174 17.8187L14.904 16.1572ZM17.6871 16.3661L17.1366 16.0483L16.1366 17.7803L16.6871 18.0981L17.6871 16.3661ZM19.0531 16C18.777 16.4783 18.1654 16.6422 17.6871 16.3661L16.6871 18.0981C18.1219 18.9265 19.9567 18.4349 20.7851 17L19.0531 16ZM18.6871 14.634C19.1654 14.9101 19.3292 15.5217 19.0531 16L20.7851 17C21.6136 15.5651 21.1219 13.7304 19.6871 12.9019L18.6871 14.634ZM18.1365 14.3161L18.6871 14.634L19.6871 12.9019L19.1365 12.5841L18.1365 14.3161ZM17.1249 12C17.1249 12.1115 17.1212 12.222 17.1141 12.3314L19.1099 12.4616C19.1198 12.3089 19.1249 12.1549 19.1249 12H17.1249ZM17.1141 11.6687C17.1212 11.7781 17.1249 11.8885 17.1249 12H19.1249C19.1249 11.8451 19.1198 11.6912 19.1099 11.5385L17.1141 11.6687ZM18.6871 9.36605L18.1365 9.68392L19.1365 11.416L19.6871 11.0981L18.6871 9.36605ZM19.0531 8.00003C19.3292 8.47832 19.1654 9.08991 18.6871 9.36605L19.6871 11.0981C21.1219 10.2697 21.6136 8.4349 20.7851 7.00003L19.0531 8.00003ZM17.6871 7.634C18.1654 7.35786 18.777 7.52173 19.0531 8.00003L20.7851 7.00003C19.9567 5.56515 18.1219 5.07352 16.6871 5.90195L17.6871 7.634ZM17.1367 7.95178L17.6871 7.634L16.6871 5.90195L16.1367 6.21972L17.1367 7.95178ZM14.3337 7.51284C14.5314 7.61041 14.7219 7.72074 14.9041 7.84279L16.0174 6.18133C15.7626 6.01058 15.4958 5.85605 15.2186 5.71926L14.3337 7.51284ZM13.1249 5V5.63425H15.1249V5H13.1249ZM12.1249 4C12.6772 4 13.1249 4.44772 13.1249 5H15.1249C15.1249 3.34315 13.7818 2 12.1249 2V4ZM11.1249 5C11.1249 4.44772 11.5726 4 12.1249 4V2C10.4681 2 9.12491 3.34315 9.12491 5H11.1249ZM11.1249 5.63422V5H9.12491V5.63422H11.1249ZM9.3457 7.84278C9.52785 7.72073 9.71835 7.61039 9.91612 7.51282L9.03123 5.71923C8.75397 5.85602 8.48718 6.01056 8.23235 6.18133L9.3457 7.84278ZM6.56271 7.634L7.1131 7.95177L8.1131 6.21972L7.56271 5.90195L6.56271 7.634ZM5.19669 8.00003C5.47283 7.52173 6.08442 7.35786 6.56271 7.634L7.56271 5.90195C6.12783 5.07352 4.29306 5.56515 3.46464 7.00003L5.19669 8.00003ZM5.56271 9.36605C5.08442 9.08991 4.92054 8.47832 5.19669 8.00003L3.46464 7.00003C2.63621 8.4349 3.12783 10.2697 4.56271 11.0981L5.56271 9.36605ZM6.11325 9.6839L5.56271 9.36605L4.56271 11.0981L5.11325 11.416L6.11325 9.6839ZM7.12488 12C7.12488 11.8885 7.12851 11.778 7.13565 11.6687L5.13989 11.5385C5.12993 11.6912 5.12488 11.8451 5.12488 12H7.12488ZM7.13565 12.3314C7.12851 12.222 7.12488 12.1115 7.12488 12H5.12488C5.12488 12.155 5.12993 12.3089 5.13989 12.4616L7.13565 12.3314ZM5.56271 14.634L6.11325 14.3161L5.11325 12.5841L4.56271 12.9019L5.56271 14.634ZM5.19669 16C4.92054 15.5217 5.08442 14.9101 5.56271 14.634L4.56271 12.9019C3.12783 13.7304 2.63621 15.5651 3.46464 17L5.19669 16ZM6.56271 16.3661C6.08442 16.6422 5.47283 16.4783 5.19669 16L3.46464 17C4.29306 18.4349 6.12783 18.9265 7.56271 18.0981L6.56271 16.3661ZM7.11314 16.0483L6.56271 16.3661L7.56271 18.0981L8.11314 17.7803L7.11314 16.0483ZM9.91612 16.4872C9.71836 16.3896 9.52787 16.2793 9.34573 16.1572L8.23239 17.8187C8.48721 17.9895 8.75398 18.144 9.03123 18.2808L9.91612 16.4872ZM11.1249 19V18.3658H9.12491V19H11.1249ZM5.11325 11.416C5.10783 11.4128 5.11324 11.4126 5.1225 11.4318C5.13306 11.4538 5.14296 11.4914 5.13989 11.5385L7.13565 11.6687C7.18355 10.9342 6.86464 10.1177 6.11325 9.6839L5.11325 11.416ZM8.23235 6.18133C8.19308 6.20764 8.15557 6.2179 8.13133 6.21974C8.11011 6.22134 8.10764 6.21657 8.1131 6.21972L7.1131 7.95177C7.86564 8.38624 8.73348 8.25304 9.3457 7.84278L8.23235 6.18133ZM19.1099 11.5385C19.1068 11.4914 19.1167 11.4538 19.1273 11.4319C19.1365 11.4126 19.1419 11.4128 19.1365 11.416L18.1365 9.68392C17.3851 10.1177 17.0662 10.9342 17.1141 11.6687L19.1099 11.5385ZM5.13989 12.4616C5.14296 12.5087 5.13307 12.5463 5.1225 12.5682C5.11324 12.5874 5.10783 12.5872 5.11325 12.5841L6.11325 14.3161C6.86464 13.8823 7.18356 13.0658 7.13565 12.3314L5.13989 12.4616ZM15.1249 18.3657C15.1249 18.3721 15.122 18.3675 15.1341 18.3497C15.1479 18.3295 15.1758 18.3018 15.2186 18.2807L14.3337 16.4872C13.6739 16.8127 13.1249 17.497 13.1249 18.3657H15.1249ZM16.1367 6.21972C16.1421 6.21657 16.1397 6.22135 16.1184 6.21974C16.0942 6.21791 16.0567 6.20765 16.0174 6.18133L14.9041 7.84279C15.5163 8.25305 16.3841 8.38625 17.1367 7.95178L16.1367 6.21972ZM15.2186 5.71926C15.1758 5.69816 15.1479 5.67054 15.1341 5.65027C15.122 5.6325 15.1249 5.6279 15.1249 5.63425H13.1249C13.1249 6.503 13.6739 7.18732 14.3337 7.51284L15.2186 5.71926ZM16.0174 17.8187C16.0566 17.7924 16.0942 17.7821 16.1184 17.7803C16.1396 17.7787 16.1421 17.7835 16.1366 17.7803L17.1366 16.0483C16.3841 15.6138 15.5163 15.747 14.904 16.1572L16.0174 17.8187ZM8.11314 17.7803C8.10768 17.7835 8.11015 17.7787 8.13137 17.7803C8.15561 17.7821 8.19312 17.7924 8.23239 17.8187L9.34573 16.1572C8.73351 15.747 7.86567 15.6138 7.11314 16.0483L8.11314 17.7803ZM9.12491 5.63422C9.12491 5.62787 9.12783 5.63247 9.11571 5.65023C9.10187 5.67051 9.07399 5.69813 9.03123 5.71923L9.91612 7.51282C10.5759 7.1873 11.1249 6.50298 11.1249 5.63422H9.12491ZM9.03123 18.2808C9.07399 18.3019 9.10187 18.3295 9.11571 18.3498C9.12783 18.3675 9.12491 18.3721 9.12491 18.3658H11.1249C11.1249 17.497 10.5759 16.8127 9.91612 16.4872L9.03123 18.2808ZM19.1365 12.5841C19.1419 12.5872 19.1365 12.5874 19.1273 12.5682C19.1167 12.5463 19.1068 12.5087 19.1099 12.4616L17.1141 12.3314C17.0662 13.0658 17.3851 13.8823 18.1365 14.3161L19.1365 12.5841Z" fill="currentColor"></path>
                                <circle cx="12.125" cy="12" r="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></circle>
                            </svg>
                        </span>
                        <div className={"flex abs-bottom " + (showSetting === true ? "show" : "")} id="hompage-setting-global-header">
                            <div className="rounded-nb-sp b-dark bd-shiny active  rounded-x btn-back-dark px-3 py-4 flex-col w-100">
                                <div className="flex flex-no-wrap my-2 w-100" hidden={showLanguageSelect}>
                                    <span className="no-wrap left">Global Setting</span>
                                    <span className="right pointer" onClick={() => setShowSetting(false)}>
                                        <i className="fa remix ri-close-fill fs-20"></i>
                                    </span>
                                </div>
                                <div className="grid2 white" hidden={showLanguageSelect}>
                                    <div className="flex-col back-dark7-8 rounded-x p-3">
                                        <div className="flex flex-no-wrap">
                                            <img src={themeSvg} className="m-auto-v left light-dark" alt="" />
                                            <div className="custom-control custom-switch pointer m-auto-v right">
                                                <input type="checkbox" checked={appSetting.theme === true} onChange={() => { }} className="custom-control-input" id="customSwitch1" />
                                                <label className="custom-control-label pointer" htmlFor="customSwitch1" onClick={() => changeTheme()}></label>
                                            </div>
                                        </div>
                                        <span className="no-wrap mt-3">
                                            {appSetting.theme === true ? "Dark Mode" : "Light Mode"}
                                        </span>
                                    </div>
                                    <div className="flex-col back-dark7-8 rounded-x p-3" onClick={() => setShowLanguageSelect(true)}>
                                        <div className="flex flex-no-wrap">
                                            <img src={cur_langs[i18n.language] ? cur_langs[i18n.language].img : cur_langs["en"].img} className="m-auto-v left size-24px" alt="" />
                                            <span className="bold">
                                                <i className="icofont-thin-right"></i>
                                            </span>
                                        </div>
                                        <span className="no-wrap mt-3">{cur_langs[i18n.language] ? cur_langs[i18n.language].label : cur_langs["en"].label}</span>
                                    </div>
                                    <Link onClick={() => openProfile()} to="/portfolio?tab=wallet" className="flex-col back-dark7-8 rounded-x p-3">
                                        <div className="flex flex-no-wrap">
                                            <i className="icofont-user m-auto-v left"></i>
                                            <span className="bold">
                                                <i className="icofont-thin-right"></i>
                                            </span>
                                        </div>
                                        <span className="no-wrap mt-3">{i18n.t("words.profile")}</span>
                                    </Link>
                                </div>
                                <div className="w-100 flex mt-1 mb-4 pointer" hidden={!showLanguageSelect} onClick={() => setShowLanguageSelect(false)}>
                                    <span className="bold mr-2">
                                        <i className="icofont-thin-left"></i>
                                    </span>
                                    <span className="w-fll text-center m-auto">Language</span>
                                </div>
                                <div className="grid2" hidden={!showLanguageSelect}>
                                    {
                                        Object.values(cur_langs).map((flag, index) =>
                                            <div className="flex back-dark7-8 rounded p-3" key={index} onClick={() => changeLanguage(flag.lang)}>
                                                <img src={flag.img} className="m-auto-v left size-24px" alt="" />
                                                <span className="no-wrap m-auto-v right">{flag.label}</span>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <ConnectWallet
                isModalOpen={showConnectWallet}
                onClose={() => setShowConnectWallet(false)}
            />
            <ChangeWallet
                isModalOpen={showChangeWallet}
                onClose={() => setShowChangeWallet(false)}
            />
        </>
    )
}

export default withTranslation('common')(Header)
