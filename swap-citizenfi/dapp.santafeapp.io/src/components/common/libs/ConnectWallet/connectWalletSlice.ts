import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';

export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const connectWalletSlice = createSlice({
    name: 'connectWallet',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        readTerms: false,
        network: 0,
        wallet: -1
    },
    reducers: {
        setReadTerms: (state, action: PayloadAction<boolean>) => {
            state.readTerms = action.payload
            if(action.payload === true)localStorage.setItem("read-terms", "1")
            else localStorage.setItem("read-terms", "0")
        },
        getReadTerms: (state) => {
            let read = localStorage.getItem("read-terms")
            state.readTerms = (read === "1")
        },
        setNetwork: (state, action: PayloadAction<number>) => {
            state.network = action.payload
        },
        setWallet: (state, action: PayloadAction<number>) => {
            state.wallet = action.payload
        }
    },
})

export const { getReadTerms, setReadTerms, setNetwork, setWallet } = connectWalletSlice.actions

export default connectWalletSlice.reducer


export const connectToMetamask = (onConnectWallet: any, callback? :any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setWallet(0))
        if (typeof window.ethereum !== 'undefined') {
            const accounts = window.ethereum.request({ method: 'eth_requestAccounts' });
            window.ethereum.on('accountsChanged', function (accounts: any){
                window.location.reload()
            })
            if(accounts.length){
                const account = accounts[0];
                onConnectWallet(account, window.ethereum.chainId, "metamask")
            }
            if( callback ) callback()
        }else{
            if( callback ) callback()
        }
    }
}