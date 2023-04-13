import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Dispatch } from 'redux';
import class6Img  from "../../../../assets/img/dragons/tinified/Foreverwing_6.jpg"
import { classImgArr } from "../../../common/libs/image"
import contracts from "../../../../contracts";
export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const cifipanelSlice = createSlice({
    name: 'market',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        Projects: [] as Array<any>
    },
    reducers: {
        setActiveTab: (state, action: PayloadAction<number>) => {
            // state.activeTab = action.payload
        },
        clearProjects: (state) => {
            state.Projects = []
        },
        addProject2BlindBoxProject: (state, action: PayloadAction<any>) => {
            state.Projects = [action.payload, ...state.Projects]
        },
        
    },
})

// export const { setActiveTab, setLoadingMore, setIsLoaded, setSaleList, addSaleList, setCurId } = cifipanelSlice.actions
export const { clearProjects, addProject2BlindBoxProject } = cifipanelSlice.actions

export const getContractData = (walletAddress: any, BlindBoxFactory_Address: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(clearProjects())
        if (window.web3 && window.web3.eth) {
            let BlindBoxFactory: any = new window.web3.eth.Contract(contracts.abis.BlindBoxFactory, BlindBoxFactory_Address)
            BlindBoxFactory.methods.getContractCount().call()
            .then((size: number) => {
                for (let i = 0; i < size; i++) {
                    BlindBoxFactory.methods.getContractNames(i).call()
                        .then((name: string) => {
                            BlindBoxFactory.methods.getContractData(name).call()
                                .then((res: any) => {
                                    let data: any = {
                                        name: name,
                                        feeAmount: res.feeAmount,
                                        maxCount: res.maxCount,
                                        nftContract: res.nftContract,
                                        image: classImgArr[(i + 1) % 5 + 1]
                                    }
                                    dispatch(addProject2BlindBoxProject(data))
                                })
                        })
                }
            })
        }
    }
}

// Other code such as selectors can use the imported `RootState` type

export default cifipanelSlice.reducer