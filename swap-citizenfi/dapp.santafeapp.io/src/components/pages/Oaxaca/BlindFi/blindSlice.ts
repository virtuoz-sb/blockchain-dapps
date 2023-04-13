import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';

import { classImgArr } from "../../../common/libs/image"
import contracts from "../../../../contracts";

export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const blindSlice = createSlice({
    name: 'market',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        BlindBoxContracts: [] as Array<any>,
        selectedContract: -1,
        blindData2Mint: {} as any,
        approvedCifi: false,
        isLoaded: false
    },
    reducers: {
        clearBlindBoxContracts: (state) => {
            state.BlindBoxContracts = []
        },
        addContract2BlindBox: (state, action: PayloadAction<any>) => {
            state.isLoaded = true
            state.BlindBoxContracts = [...state.BlindBoxContracts, action.payload]
        },
        setIsLoaded: (state, action: PayloadAction<boolean>) => {
            state.isLoaded = action.payload
        },
        setApproveProgress2Mint: (state, action: PayloadAction<any>) => {
            if (action.payload.status === 0) {
                if (action.payload.token === 1) state.blindData2Mint.progressCifi = true
                else if (action.payload.token === 2) state.blindData2Mint.progressAccept = true
            } else if (action.payload.status === 1) {
                if (action.payload.token === 1) state.blindData2Mint.progressCifi = false
                else if (action.payload.token === 2) state.blindData2Mint.progressAccept = false
            }
        },
        clickContract: (state, action: PayloadAction<number>) => {
            state.selectedContract = action.payload
            state.blindData2Mint = state.BlindBoxContracts[action.payload]

            // state.blindData2Mint.approveCifi =  state.approveCifi2V2
            // state.blindData2Mint.approveAccept =  state.approveAccept2V2
            // state.blindData2Mint.progressCifi =  false
            // state.blindData2Mint.progressAccept =  false
        },
        setApprovedCifi: (state, action: PayloadAction<boolean>) => {
            state.approvedCifi = action.payload
        }
    },
})

export const { addContract2BlindBox } = blindSlice.actions
export const { setApproveProgress2Mint } = blindSlice.actions
export const { clearBlindBoxContracts } = blindSlice.actions
export const { setIsLoaded, clickContract, setApprovedCifi } = blindSlice.actions

export const getContractData = (walletAddress: any, BlindBoxFactory_Address: any, Cifi_Token_Address: any) => {
    return function (dispatch: Dispatch<any>) {
        if (window.web3 && window.web3.eth) {
            dispatch(clearBlindBoxContracts())
            let BlindBoxFactory: any = new window.web3.eth.Contract(contracts.abis.BlindBoxFactory, BlindBoxFactory_Address)
            let CifiTokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, Cifi_Token_Address)
            BlindBoxFactory.methods.getContractCount().call()
            .then((size: number) => {
                for (let i = 0; i < size; i++) {
                    BlindBoxFactory.methods.getContractNames(i).call()
                    .then((name: string) => {
                        BlindBoxFactory.methods.getContractData(name).call()
                        .then((res: any) => {
                                let data: any = {
                                    name: name,
                                    nftContract: res.nftContract,
                                    maxCount: res.maxCount,
                                    feeAmount: res.feeAmount,
                                    image: classImgArr[(i + 1) % 5 + 1]
                                }
                                dispatch(addContract2BlindBox(data))
                        })
                    })
                }
            })

            CifiTokenContract.methods.allowance(walletAddress, BlindBoxFactory_Address).call()
            .then((allowance: any) => {
                console.log("allowance, feeAmount", allowance)
                dispatch(setApprovedCifi(allowance / (10 ** 18) > 500000))
            })
        }
    }
}


// Other code such as selectors can use the imported `RootState` type

export default blindSlice.reducer
