import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Dispatch } from 'redux';
import contracts from "../../../../contracts";
import { bestGas } from '../../../common/libs/constant';
import { showError, showSuccess } from '../../../common/libs/functions';
export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const cifipanelSlice = createSlice({
    name: 'market',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        isProcess: false,
        blackList: []  as Array<any>
    },
    reducers: {
        setActiveTab: (state, action: PayloadAction<number>) => {
            // state.activeTab = action.payload
        },
        setIsProcess: (state, action: PayloadAction<boolean>) => {
            state.isProcess = action.payload
        },
        setBlackList: (state, action: PayloadAction<Array<any>>) => {
            state.blackList = action.payload
        },
        addBlockUser: (state, action: PayloadAction<any>) => {
            state.blackList = [...state.blackList, action.payload]
            state.isProcess = false
        },
        removeBlockUser: (state, action: PayloadAction<any>) => {
            let index: any = state.blackList.indexOf(action.payload)
            state.blackList = [...state.blackList.slice(0, index), ...state.blackList.slice(index + 1)]
            state.isProcess = false
        },
    },
})

// export const { setActiveTab, setLoadingMore, setIsLoaded, setSaleList, addSaleList, setCurId } = cifipanelSlice.actions
export const { setIsProcess, setBlackList } = cifipanelSlice.actions
export const { addBlockUser } = cifipanelSlice.actions

export const getContractData = (admin: any, FBlist_Address: any) => {
    return function (dispatch: Dispatch<any>) {
        let FBlist: any = new window.web3.eth.Contract(contracts.abis.FBlist, FBlist_Address)
        return FBlist.methods.getlist().call({from: admin})
        .then((list: any) => {
            console.log("list", list)
            return dispatch(setBlackList(list))
        })
    }
}

export const addToList = (addr: any, admin: any, FBlist_Address: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setIsProcess(true))
        let FBlist: any = new window.web3.eth.Contract(contracts.abis.FBlist, FBlist_Address)
        FBlist.methods.inlist(addr).call({from: admin})
        .then((isIn: any) => {
            if(Number(isIn) === 1){
                dispatch(setIsProcess(false))
                return showError("This address is already in black list")
            }else{
                return FBlist.methods.addlist(addr)
                .send({from: admin, gas: bestGas})
                .then((res: any) => {
                    showSuccess("Address added")
                    return dispatch(addBlockUser(addr))
                })
                .catch((err: any) => {
                    showError("Please try again")
                    return dispatch(setIsProcess(false))
                })
            }
        })
    }
}

export const removeFromList = (addr: any, admin: any, FBlist_Address: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setIsProcess(true))
        let FBlist: any = new window.web3.eth.Contract(contracts.abis.FBlist, FBlist_Address)
        FBlist.methods.inlist(addr).call()
        .then((isIn: any) => {
            console.log("isIn ", isIn)
            if(Number(isIn) === 0){
                dispatch(setIsProcess(false))
                return showError("This address is not on black list")
            }else{
                FBlist.methods.removelist(addr)
                .send({from: admin, gas: bestGas})
                .then((res: any) => {
                    console.log("list ", res)
                    dispatch(setIsProcess(false))
                    return showSuccess("Removed address from black list")
                })
            }
        })
    }
}

// Other code such as selectors can use the imported `RootState` type

export default cifipanelSlice.reducer