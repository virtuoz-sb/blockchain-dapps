import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";

import { useAppContext } from "../../../../common/libs/context";
import { RootState } from '../../../../../app/store'
import { useAppSelector, useAppDispatch } from '../../../../../app/hook'
import { getBalanceStr, isSameAddress, validateWalletAddres } from "../../../../common/libs/functions"
import { getCommonBaseList, getTokenList } from "./searchTokenSlice";

import cn from "classnames"
import styles from "./SearchToken.module.sass"

function SearchToken({ isModalOpen, tokenSelected, tokenA, tokenB, isSwap, onHide }: any) {
	const dispatch = useAppDispatch()
	const { connectedNetwork, walletAddress } = useAppContext()
	const commonBaseList = useAppSelector((state: RootState) => state.searchTokenSlice.commonBaseList)
	const tokenList = useAppSelector((state: RootState) => state.searchTokenSlice.tokenList)
	const isLoadedCommonBaseList = useAppSelector((state: RootState) => state.searchTokenSlice.isLoadedCommonBaseList)
	const isLoadedTokenList = useAppSelector((state: RootState) => state.searchTokenSlice.isLoadedTokenList)
	const tokenAddressList = useAppSelector((state: RootState) => state.searchTokenSlice.addressList)
	const [searchKey, setSearchKey] = useState<any>('')

	useEffect(() => {
		console.log("here is use effect")
		if (!isModalOpen) return
		console.log("here opened modal - connected Network", connectedNetwork)
		if (!isLoadedCommonBaseList) dispatch(getCommonBaseList(connectedNetwork))
		if (!isLoadedTokenList && validateWalletAddres(walletAddress)) dispatch(getTokenList(connectedNetwork, walletAddress))
	}, [dispatch, isModalOpen])

	const clickToken = (item: any) => {
		// if(isSameAddress(item.address, tokenB.address) || isSameAddress(item.address, tokenA.address)) {

		// }
		tokenSelected(item)
		return onHide()
	}

	const inputKey = (key: string) => {
		setSearchKey(key.toLowerCase())
		if (validateWalletAddres(key) && (tokenAddressList.indexOf(key) < 0)) {
			const defaultQuery = {
				query: `
					query ethereum($token: String!){
						ethereum(network: bsc) {
							address(address: {is: $token}) {
								smartContract {
									currency {
										symbol
										name
										decimals
										tokenType
									}
								}
							}
						}
					}                  
			`,
				variables: {
					token: key
				},
			}
			console.log("here is get custom token from bitquery")
			return fetch('https://graphql.bitquery.io/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(defaultQuery),
			})
				.then((res) => res.json())
				.then((result) => {
					console.log("get token data Data", result.data.ethereum.address)
				})
				.catch((err: any) => { })
		}
	}

	const ableShow = (item: any) => {
		let textString: string = item.name + "&" + item.symbol + "&" + item.address
		textString = textString.toLowerCase()
		return textString.includes(searchKey)
	}

	const clickClose = () => {
		onHide()
		setSearchKey('')
	}

	return (
		<>
			<Modal show={isModalOpen} onHide={() => clickClose()} centered className="modal-dialog-wallet-connect p-2">
				<ModalBody className=" btn-back-gradient-reverse rounded-x p-4">
					<div className="row flex px-4 pt-3 c-white">
						<p className="text-3xl bold">
							Select a Token
						</p>
						<div className="close-window pointer right" onClick={() => clickClose()}>
							<i className="fa remix ri-close-fill fs-32"></i>
						</div>
					</div>
					<div className="flex w-100 relative">
						<input
							type="text"
							className="bd-show-hover on rounded w-100 p-3 my-2 border-gradient reverse p-1 btn-back-dark white"
							placeholder="Search by name, symbol, address"
							onChange={(e: any) => inputKey(e.target.value)}
						/>
						<i className="icofont-search search-after mr-4"></i>
					</div>
					<div className="flex-col mb-4 c-white" hidden={isSwap}>
						<p className="mt-2">Common bases</p>
						<div className="flex space-around">
							{
								commonBaseList.map((item: any, index: any) =>
									<div className={cn("flex pointer btn-hover", styles.commonToken)} key={index} onClick={() => clickToken(item)}>
										<img src={item.logoURI} className="size-24px my-auto" alt="" />
										<span className="my-auto mx-2">{item.symbol}</span>
									</div>
								)
							}
						</div>
					</div>
					<div className={cn("flex-col scroll-v-1 c-white", styles.tokenList)}>
						{
							tokenList.map((item: any, index: any) =>
								<div
									className={cn("flex pointer btn-hover", styles.tokenRow)}
									key={index} onClick={() => clickToken(item)}
									hidden={!ableShow(item)}
								>
									<img src={item.logoURI} className="size-24px my-auto mr-2" alt="" />
									<div className="flex-col">
										<span className={cn(styles.symbol, 'text-xl')}>{item.symbol}</span>
										<span className={cn(styles.name, 'text-sm')}>{item.name}</span>
									</div>
									<span className="right">
										{getBalanceStr(item.balance, 18)}
									</span>
								</div>
							)
						}
					</div>
					<div className="flex mt-4">
						<div
							onClick={() => onHide()}
							className="bd-shiny rounded-btn-x btn-hover back-dark py-2 px-8 pointer bold text-lg c-white rounded m-auto">
							<span className="px-8">Close</span>
						</div>
						{/* <div hidden={!isProcess} className="loader-animation-sm m-auto"></div> */}
					</div>
				</ModalBody>
			</Modal>
			<Link to="/portfolio?tab=wallet" id="goto_portfolio" hidden={true}>Go to portfolio</Link>
		</>
	);
}

export default SearchToken

