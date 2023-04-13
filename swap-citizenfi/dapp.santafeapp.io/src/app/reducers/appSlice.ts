import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';
import { curNetwork, chains, networks } from '../../components/common/libs/data'
import darkImg from "../../assets/img/icons/dark.jpg"
import { MENU_LIST } from '../../components/common/libs/constant';

// Define a type for the slice state
// interface CounterState {
//   value: number
// }

// Define the initial state using that type
// const initialState = {
//     value: 0,
// } as CounterState

interface ConnectWallet{
  account: string,
  chainId: number,
  connectedWallet: string
}

export const appSlice = createSlice({
  name: 'app',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState :{
    network: {
      isConnected: false,
      isCorrectNet : false,
      networkId : 0,
      symbol : "",
      networkName : "",
      chainIcon : darkImg,
      rpcUrl: chains[1].rpc ,
    },
    account: {
      walletAddress : "",
      balance : "0.0",
      cifiBalance : "0.0"
    },
    appSetting : {} as any,
    curTimeStamp: new Date().getTime() + (new Date().getTimezoneOffset() * 60000),
    isSyncTime: false,
    activeHeaderMenu: MENU_LIST.POOL,
    showNotification: {
      show: false,
      tx: "",
      title: ""
    } as any
  },
  reducers: {
    setNetwork: (state, action: PayloadAction<any>) => {
      state.network = action.payload
    },
    setIsConnected: (state, action: PayloadAction<boolean>) => {
      state.network.isConnected = action.payload
    },
    setIsCorrectNet: (state, action: PayloadAction<boolean>) => {
      state.network.isCorrectNet = action.payload
    },
    setNetworkId: (state, action: PayloadAction<number>) => {
      state.network.networkId = action.payload
    },
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.account.walletAddress = action.payload
    },
    setBalance: (state, action: PayloadAction<string>) => {
      state.account.balance = action.payload
    },
    setCifiBalance: (state, action: PayloadAction<string>) => {
      state.account.cifiBalance = action.payload
    },
    setSymbol: (state, action: PayloadAction<string>) => {
      state.network.symbol = action.payload
    },
    setNetworkName: (state, action: PayloadAction<string>) => {
      state.network.networkName = action.payload
    },
    onConnectWallet1: (state, action: PayloadAction<ConnectWallet>) => {
      let chainId: number = Number(action.payload.chainId)
      state.network.isConnected = true
      state.network.networkId = chainId
      state.account.walletAddress = action.payload.account
      let index: any = networks.indexOf(chainId)
      state.network.isCorrectNet = curNetwork === chainId
      if(index > -1){
        state.network.rpcUrl = chains[index].rpc
        state.network.symbol = chains[index].symbol
        state.network.networkName = chains[index].label
        state.network.chainIcon = chains[index].icon
      }
    },
    setCurTimestamp: (state, action: PayloadAction<number>) => {
      state.curTimeStamp = action.payload
      state.isSyncTime = true
    },
    setActiveHeaderMenu: (state, action: PayloadAction<MENU_LIST>) => {
      state.activeHeaderMenu = action.payload
    },
    setShowNotification: (state, action: PayloadAction<any>) => {
      state.showNotification = action.payload
    },
  },
})

export const { setNetwork, setIsConnected, setIsCorrectNet, setNetworkId, setWalletAddress, setBalance, setCifiBalance, setSymbol, setNetworkName } = appSlice.actions
export const { onConnectWallet1 } = appSlice.actions
export const { setCurTimestamp } = appSlice.actions 
export const { setActiveHeaderMenu } = appSlice.actions
export const { setShowNotification } = appSlice.actions
// Other code such as selectors can use the imported `RootState` type

export default appSlice.reducer


export const openNotification = (tx: any, title: any) => {
  return function (dispatch: Dispatch<any>) {
    return dispatch(setShowNotification({
      show: true,
      tx: tx.transactionHash || "",
      title: title
    }))
  }
}

export const closeNotification = () => {
  return function (dispatch: Dispatch<any>) {
    return dispatch(setShowNotification({
      show: false,
      tx: ""
    }))
  }
}