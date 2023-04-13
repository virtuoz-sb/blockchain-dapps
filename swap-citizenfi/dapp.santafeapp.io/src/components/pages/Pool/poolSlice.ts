import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export enum LEFT_MENU { ALL, NFT_POOL, FARM } 

export const poolSlice = createSlice({
    name: 'pool',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        showClaimed: false,
        isLoaded: false,
        isProcess: false,
        activePool: true,
        activeMenu: LEFT_MENU.ALL,
        sNFT_V1_data: {
            totalPowa : "0.00",
            reward: "0.0000",
            time: "0:00:00:00"
        },
        sNFT_V2_data: {
            totalPowa : "0.00",
            reward: "0.0000",
            time: "0:00:00:00"
        }
    },
    reducers: {
        setShowClaimed: (state, action: PayloadAction<boolean>) => {
            state.showClaimed = action.payload
        },
        setActiveMenu: (state, action: PayloadAction<LEFT_MENU>) => {
            state.activeMenu = action.payload
        },
        setIsLoad: (state, action: PayloadAction<boolean>) => {
            state.isLoaded = action.payload
        },
        setIsProcess: (state, action: PayloadAction<boolean>) => {
            state.isProcess = action.payload
        },
        setActivePool: (state, action: PayloadAction<boolean>) => {
            state.activePool = action.payload
        },
        setSNFT_V1_data: (state, action: PayloadAction<any>) => {
            state.sNFT_V1_data = action.payload
        },
        setSNFT_V2_data: (state, action: PayloadAction<any>) => {
            state.sNFT_V2_data = action.payload
        },
    },
})

export const { setShowClaimed, setIsLoad, setIsProcess, setActivePool, setSNFT_V1_data, setSNFT_V2_data } = poolSlice.actions
export const { setActiveMenu } = poolSlice.actions

// Other code such as selectors can use the imported `RootState` type

export default poolSlice.reducer