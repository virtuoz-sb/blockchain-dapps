import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';
import contract from '../../../../contracts';
import { polygonWeb3 } from '../../../common/libs/data';
import { validateWalletAddres } from '../../../common/libs/functions';
import { getMiningPowaValueV1 } from '../../../common/libs/functions/integrate';
import { santaClassMap, santaMetaData, santaMetaUrls, santaStakingpowaMap } from '../../../common/libs/metadata';

const alertify = require("alertifyjs")
export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const olympicStakingSlice = createSlice({
    name: 'NftStakingV2',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        activeHarvest: false,
        isLoaded: false,
        isLoadedStake: false,
        displayItems: [] as Array<any>,
        myStakes: [] as Array<any>,
        stakeProgress: [],
        isLoadedMyStakes: false,
        isHarvest: 0,
        stakeData: {
            totalPowa: 0.0,
            earned: "0.0000",
            time: 0
        }
    },
    reducers: {
        setStakeData: (state, action: PayloadAction<any>) => {
            state.stakeData = {
                totalPowa: action.payload.totalPowa,
                earned: action.payload.earned,
                time: action.payload.time
            }
            state.isLoadedStake = true
        },
        setDisplayItems: (state, action: PayloadAction<Array<any>>) => {
            state.displayItems = [...action.payload]
            state.isLoaded = true
        },
        addDisplayItems: (state, action: PayloadAction<any>) => {
            console.log("add display items => ", state.isLoaded)
            state.isLoaded = true
            state.displayItems = [...state.displayItems, action.payload]
        },
        setMyStakes: (state, action: PayloadAction<Array<any>>) => {
            state.myStakes = action.payload
            state.isLoadedMyStakes = true
        },
        addMyStakes: (state, action: PayloadAction<any>) => {
            state.myStakes = [...state.myStakes, action.payload]
            state.isLoadedMyStakes = true
            console.log("add stake item")
        },
        stakeNft: (state, action: PayloadAction<any>) => {
            alertify.dismissAll();
            if (action.payload.type === STATE.START) {
                if(!action.payload.approve && !state.displayItems[action.payload.index].isApproved){
                    alertify.error("Please approve before stake")
                }else{
                    state.displayItems[action.payload.index].isProgress = true
                }
            } else if (action.payload.type === STATE.SUCC) {
                state.displayItems[action.payload.index].isProgress = false
                if(action.payload.approve === true){
                    state.displayItems[action.payload.index].isApproved = true
                }else{
                    state.myStakes = [...state.myStakes, state.displayItems[action.payload.index]]
                    state.displayItems = [...state.displayItems.slice(0, action.payload.index), ...state.displayItems.slice(action.payload.index + 1)]
                }
                alertify.success("Success.")
            } else if (action.payload.type === STATE.ERR) {
                // alertify.error("Sorry, something went wrong")
                state.displayItems[action.payload.index].isProgress = false
            }
        },
        withdrawNft: (state, action: PayloadAction<any>) => {
            console.log("withdrawNft", action.payload)
            state.myStakes[action.payload.index].isProgress = true
            if (action.payload.type === STATE.START) {
                state.myStakes[action.payload.index].isProgress = true
            } else if (action.payload.type === STATE.SUCC) {
                state.displayItems = [...state.displayItems, state.myStakes[action.payload.index]]
                state.myStakes[action.payload.index].isProgress = false
                state.myStakes = [...state.myStakes.slice(0, action.payload.index), ...state.myStakes.slice(action.payload.index + 1)]
                alertify.dismissAll();
                alertify.success("Success.")
            } else if (action.payload.type === STATE.ERR) {
                alertify.dismissAll();
                // alertify.error("Sorry, something went wrong")
                state.myStakes[action.payload.index].isProgress = false
            }
        },
        withdrawAll: (state, action: PayloadAction<any>) => {
            // console.log("withdrawNft", action.payload)
            // state.myStakes[action.payload.index].isProgress = true
            // if (action.payload.type === STATE.START) {
            //     state.myStakes[action.payload.index].isProgress = true
            // } else if (action.payload.type === STATE.SUCC) {
                state.displayItems = [...state.displayItems, ...state.myStakes]
                state.myStakes = []
                alertify.dismissAll();
                alertify.success("Success.")
            // } else if (action.payload.type === STATE.ERR) {
            //     alertify.dismissAll();
            //     alertify.error("Sorry, something went wrong")
            //     state.myStakes[action.payload.index].isProgress = false
            // }
        },
        setIsHarvest: (state, action: PayloadAction<number>) => {
            state.isHarvest = action.payload
        }
    },
})

export const { setStakeData, setDisplayItems, addDisplayItems, addMyStakes, stakeNft, withdrawNft } = olympicStakingSlice.actions
export const { setMyStakes } = olympicStakingSlice.actions 
export const { withdrawAll, setIsHarvest } = olympicStakingSlice.actions
// Other code such as selectors can use the imported `RootState` type

export const getMyNfts = (walletAddress: any) => {
    return function (dispatch: Dispatch<any>) {
        if (validateWalletAddres(walletAddress)) {
            let SantaFactory_ContractV2: any = new polygonWeb3.eth.Contract(contract.abis.SantaFactoryV2, contract.address.SantaFactoryV2)
            let SantaV2: any = new polygonWeb3.eth.Contract(contract.abis.SantaV2, contract.address.SantaV2)
            return SantaV2.methods.tokensOfOwner(walletAddress).call({from: walletAddress})
            .then((tokens: any) => {
                if (tokens.length > 0){
                    console.log("tokens in snft", tokens)
                    SantaV2.methods.isApprovedForAll(walletAddress, contract.address.NftStakingV2).call({
                        from: walletAddress
                    })
                    .then((approveRes: any) => {
                        
                        tokens.map((tokenIdStr: any) => {
                            let tokenId = Number(tokenIdStr)
                            
                            return SantaFactory_ContractV2.methods.getFaceValue(tokenId).call()
                            .then((faceValueRes: any) => {
                                console.log("faceValue", faceValueRes)
                                faceValueRes = Number(faceValueRes)/(10**18)
                                let metaData: any = {
                                    name: santaMetaData[1][santaClassMap[tokenId]].name,
                                    image: santaMetaData[1][santaClassMap[tokenId]].image,
                                    isApproved: approveRes,
                                    isProgress: false,
                                    stake_powa: santaStakingpowaMap[tokenId],
                                    class: santaClassMap[tokenId],
                                    mining_powa: faceValueRes*getMiningPowaValueV1(santaClassMap[tokenId], santaStakingpowaMap[tokenId]),
                                    face_value: faceValueRes,
                                    contractAddress: contract.address.SantaV2,
                                    id: tokenId
                                }
                                return dispatch(addDisplayItems(metaData))
                            })
                        })
                    })
                }
                else return dispatch(setDisplayItems([]))
            })
            
        }
    }
}

export const getStakeNfts = (walletAddress: any) => {
    return function (dispatch: Dispatch<any>) {
        if (validateWalletAddres(walletAddress)) {
            let NftStakingV2: any = new polygonWeb3.eth.Contract(contract.abis.NftStakingV2, contract.address.NftStakingV2)
            return NftStakingV2.methods.getNftIds(walletAddress).call({
                from: walletAddress
            })
            .then((tokens: any) => {
                console.log("stake Nfts : ", tokens)
                if (tokens.length > 0)
                tokens.map((tokenId: any) => {
                    return dispatch(getAndAddStakeNft(Number(tokenId)))
                })
                else dispatch(setMyStakes([]))
            })
        }
    }
}

export const getStakeData = (walletAddress: any) => {
    return function (dispatch: Dispatch<any>) {
        if (validateWalletAddres(walletAddress)) {
            
            let NftStakingV2: any = new polygonWeb3.eth.Contract(contract.abis.NftStakingV2, contract.address.NftStakingV2)
            return NftStakingV2.methods._powaBalances(walletAddress).call()
            .then((_powaBalancesRes: any) => {
                    return NftStakingV2.methods.earned(walletAddress).call()
                    .then((earnedRes: any) => {
                        return NftStakingV2.methods.getRemainTime().call()
                        .then((_remainTime: any) => {
                            let tmp: any = {
                                totalPowa: Number(_powaBalancesRes / (10 ** 18)).toFixed(2),
                                earned: earnedRes > 0 ? Number(Number(earnedRes) / (10 ** 18)).toFixed(4) : "0.00",
                                time: Number(_remainTime)*1000 + new Date().getTime() // + Number(_punishTimeRes),
                            }
                            console.log("olympic remain time", _remainTime)
                            dispatch(updateStakeData(walletAddress, tmp))
                            return dispatch(setStakeData(tmp))
                        })
                    })
            })
        }
    }
}


export const updateStakeData = (walletAddress: any, oldData: any) => {
    return function (dispatch: Dispatch<any>) {
        if (validateWalletAddres(walletAddress)) {
            let NftStakingV2: any = new polygonWeb3.eth.Contract(contract.abis.NftStakingV2, contract.address.NftStakingV2)
            return NftStakingV2.methods._powaBalances(walletAddress).call()
            .then((_powaBalancesRes: any) => {
                    return NftStakingV2.methods.earned(walletAddress).call()
                    .then((earnedRes: any) => {
                        return NftStakingV2.methods.getRemainTime().call()
                        .then((_remainTime: any) => {
                            let tmp: any = {
                                totalPowa: Number(_powaBalancesRes / (10 ** 18)).toFixed(2),
                                earned: earnedRes > 0 ? Number(Number(earnedRes) / (10 ** 18)).toFixed(4) : "0.00",
                                time: Number(_remainTime)*1000 + new Date().getTime() // + Number(_punishTimeRes),
                            }
                            if(tmp.totalPowa !== oldData.totalPowa || tmp.earned !== oldData.earned) dispatch(setStakeData(tmp))
                            setTimeout(() => {
                                updateStakeData(walletAddress, tmp)
                            }, 5*1000);
                        })
                    })
            })
        }
    }
}

export const getAndAddStakeNft = (tokenId: number) => {
    return function (dispatch: Dispatch<any>) {
        let SantaFactory_ContractV2: any = new polygonWeb3.eth.Contract(contract.abis.SantaFactoryV2, contract.address.SantaFactoryV2)
        return SantaFactory_ContractV2.methods.getFaceValue(tokenId).call()
        .then((faceValueRes: any) => {
            faceValueRes = Number(faceValueRes) / (10**18)
            let metaData: any = {
                name: santaMetaData[1][santaClassMap[tokenId]].name,
                image: santaMetaData[1][santaClassMap[tokenId]].image,
                isApproved: true,
                isProgress: false,
                contractAddress: contract.address.SantaV2,
                stake_powa: santaStakingpowaMap[tokenId],
                class: santaClassMap[tokenId],
                mining_powa: getMiningPowaValueV1(santaClassMap[tokenId], santaStakingpowaMap[tokenId])*faceValueRes,
                face_value: Number(faceValueRes),
                id: tokenId
            }
            return dispatch(addMyStakes(metaData))
        })
    }
}

export default olympicStakingSlice.reducer