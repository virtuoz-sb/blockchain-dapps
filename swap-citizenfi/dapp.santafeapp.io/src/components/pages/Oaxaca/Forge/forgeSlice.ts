import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';

import { approveErc20 } from "../../../common/libs/functions/integrate";
import { classImgArr } from "../../../common/libs/image"
import olympicImg  from "../../../../assets/img/icons/Olympic_God.jpg"
import contracts from "../../../../contracts";
import { isSameAddress } from '../../../common/libs/functions';
const alertify = require("alertifyjs")

export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const forgeSlice = createSlice({
    name: 'market',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        SantaV3Galleries: [] as Array<any>,

        approveCifi2V2: false,
        approveAccept2V2: false,
        approveCifi2V3: false,
        approveAccept2V3: false,

        selectedV2: false,
        selectedV3: false,
        selectedV3No: -1,
        galleryData2Mint: {} as any
    },
    reducers: {
        clearSantaV3Galleries: (state) => {
            state.SantaV3Galleries = []
        },
        addGallery2SantaV3: (state, action: PayloadAction<any>) => {
            state.SantaV3Galleries = [...state.SantaV3Galleries, action.payload]
        },
        setApproveCifi2V2: (state, action: PayloadAction<boolean>) => {
            state.approveCifi2V2 = action.payload
        },
        setApproveCifi2V3: (state, action: PayloadAction<boolean>) => {
            state.approveCifi2V3 = action.payload
        },
        setApproveAccept2V2: (state, action: PayloadAction<boolean>) => {
            state.approveAccept2V2 = action.payload
        },
        setApproveAccept2V3: (state, action: PayloadAction<boolean>) => {
            state.approveAccept2V3 = action.payload
        },
        approveCifi2Mint: (state, action: PayloadAction<any>) => {
            state.galleryData2Mint.approveCifi = true
            if (state.selectedV2) state.approveCifi2V2 = true
            else if (state.selectedV3) state.approveCifi2V3 = true
            state.galleryData2Mint.progressCifi = false
        },
        approveAccept2Mint: (state, action: PayloadAction<any>) => {
            state.galleryData2Mint.approveAccept = true
            if (state.selectedV2) state.approveAccept2V2 = true
            else if (state.selectedV3) state.approveAccept2V3 = true
            state.galleryData2Mint.progressAccept = false
        },
        setApproveProgress2Mint: (state, action: PayloadAction<any>) => {
            console.log("here set approving cifi")
            if (action.payload.status === 0) {
                console.log("I am here")
                if (action.payload.token === 1) state.galleryData2Mint.progressCifi = true
                else if (action.payload.token === 2) state.galleryData2Mint.progressAccept = true
            } else if (action.payload.status === 1) {
                if (action.payload.token === 1) state.galleryData2Mint.progressCifi = false
                else if (action.payload.token === 2) state.galleryData2Mint.progressAccept = false
            }
        },
        clickSantaV2: (state, action: PayloadAction<any>) => {
            state.selectedV2 = true
            state.selectedV3 = false
            state.selectedV3No = -1

            
            let data: any = {
                acceptedToken: action.payload.AcceptedToken,
                maxCount: "10000",
                name: "Olympics2020",
                santa: action.payload.SantaV2,
                image: olympicImg,
                approveCifi: state.approveCifi2V2,
                approveAccept: state.approveAccept2V2,
                progressCifi: false,
                progressAccept: false
            }

            state.galleryData2Mint = data
        },
        clickGallery: (state, action: PayloadAction<number>) => {
            state.selectedV2 = false
            state.selectedV3 = true
            state.selectedV3No = action.payload
            state.galleryData2Mint = state.SantaV3Galleries[action.payload]
            
            state.galleryData2Mint.approveCifi =  state.approveCifi2V2
            state.galleryData2Mint.approveAccept =  state.approveAccept2V2
            state.galleryData2Mint.progressCifi =  false
            state.galleryData2Mint.progressAccept =  false
        },
        // clickApproveCifi: (state, action: PayloadAction<any>) => {
        //     alertify.dismissAll();
        //     if (state.galleryData2Mint.approveCifi === true) {
        //         alertify.error("You have already approved CIFI")
        //         return
        //     } else {
        //         if (state.selectedV2 === true) {
        //             console.log("here approved")
        //             approveToken(contracts.address.Cifi_Token, contracts.address.SantaFactoryV2, action.payload)
        //         }
        //         else if (state.selectedV3 === true) {
        //             approveToken(contracts.address.Cifi_Token, contracts.address.SantaFactoryV3, action.payload)
        //         }
        //     }
        // },
        // clickApproveTest: (state, action: PayloadAction<any>) => {
        //     alertify.dismissAll();
        //     if (state.galleryData2Mint.approveAccept === true) {
        //         alertify.error("You have already approved accepted token")
        //         return
        //     } else {
        //         if (state.selectedV3 === true) approveToken(contracts.address.AcceptedToken, contracts.address.SantaFactoryV3, action.payload)
        //     }
        // }
    },
})

export const { addGallery2SantaV3, setApproveCifi2V2, setApproveCifi2V3, setApproveAccept2V2, setApproveAccept2V3 } = forgeSlice.actions
export const { approveCifi2Mint, approveAccept2Mint, setApproveProgress2Mint } = forgeSlice.actions
export const { clearSantaV3Galleries } = forgeSlice.actions
export const { clickSantaV2, clickGallery } = forgeSlice.actions

export const getContractData = (walletAddress: any, SantaFactoryV3_Addr: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(clearSantaV3Galleries())
        if (window.web3 && window.web3.eth) {
            let SantaFactoryV3: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV3, SantaFactoryV3_Addr)
            SantaFactoryV3.methods.getContractCount().call()
            .then((size: number) => {
                for (let i = 0; i < size; i++) {
                    SantaFactoryV3.methods.getContractNames(i).call()
                        .then((name: string) => {
                            SantaFactoryV3.methods.getContractData(name).call()
                                .then((res: any) => {
                                    let data: any = {
                                        name: "TestNFT",
                                        acceptedToken: res.acceptedToken,
                                        maxCount: res.maxCount,
                                        santa: res.santa,
                                        image: classImgArr[(i + 1) % 5 + 1]
                                    }
                                    dispatch(addGallery2SantaV3(data))
                                })
                        })
                }
            })
        }
    }
}

export const getInitApproveData = (walletAddress: any, Cifi_Token_Addr: any, AcceptedToken_Addr: any, SantaFactoryV2_Addr: any) => {
    return function (dispatch: Dispatch<any>) {
        let CifiTokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, Cifi_Token_Addr)

        // CifiTokenContract.methods.allowance(walletAddress, contracts.address.SantaFactoryV3).call()
        //     .then((allowance: any) => {
        //         dispatch(setApproveCifi2V3(allowance > 10 ** 18))
        //     })
        CifiTokenContract.methods.allowance(walletAddress, SantaFactoryV2_Addr).call()
            .then((allowance: any) => {
                console.log("allowanece cifi", allowance)
                dispatch(setApproveCifi2V2(allowance/(10**18) > 500000 ))
            })


        let AcceptedTokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, AcceptedToken_Addr)

        // AcceptedTokenContract.methods.allowance(walletAddress, contracts.address.SantaFactoryV3).call()
        //     .then((allowance: any) => {
        //         dispatch(setApproveAccept2V3(allowance > 10 ** 18))
        //     })
        AcceptedTokenContract.methods.allowance(walletAddress, SantaFactoryV2_Addr).call()
            .then((allowance: any) => {
                dispatch(setApproveAccept2V2(allowance > 10 ** 18))
            })
    }
}


export const approveToken = (tokenAddress: any, spender: any, walletAddress: any, Cifi_Token_Addr: any, AcceptedToken_Addr: any) => {
    return function (dispatch: Dispatch<any>) {
        console.log("here approved", Cifi_Token_Addr)
        if (isSameAddress(tokenAddress , Cifi_Token_Addr)) dispatch(setApproveProgress2Mint({ token: 1, status: 0 }))
        else if (isSameAddress(tokenAddress ,AcceptedToken_Addr)) dispatch(setApproveProgress2Mint({ token: 2, status: 0 }))
        approveErc20(tokenAddress, spender, walletAddress)
            .then((approveRes: any) => {
                if (isSameAddress(tokenAddress , Cifi_Token_Addr)) dispatch(approveCifi2Mint(true))
                else if (isSameAddress(tokenAddress , AcceptedToken_Addr)) dispatch(approveAccept2Mint(true))
            })
            .catch((err: any) => {
                if (isSameAddress(tokenAddress , Cifi_Token_Addr)) dispatch(setApproveProgress2Mint({ token: 1, status: 1 }))
                else if (isSameAddress(tokenAddress , AcceptedToken_Addr)) dispatch(setApproveProgress2Mint({ token: 2, status: 1 }))
            })
    }
}

// Other code such as selectors can use the imported `RootState` type

export default forgeSlice.reducer
