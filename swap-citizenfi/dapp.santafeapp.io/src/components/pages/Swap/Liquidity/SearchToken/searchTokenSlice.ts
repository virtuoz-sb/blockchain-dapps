import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';
import { net_state } from '../../../../../contracts';
import commonToken  from "../../../../../helpers/tokenLists/famoso-common.tokenlist.json"
import defaultToken from "../../../../../helpers/tokenLists/famoso-default.tokenlist.json"
import { zeroAddr } from '../../../../common/libs/constant';
import { balanceOfWallet } from '../../../../common/libs/functions/integrate';

export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const searchTokenSlice = createSlice({
    name: 'searchToken',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        commonBaseList: [] as Array<any>,
        tokenList: [] as Array<any>,
        addressList: [] as Array<string>,
        isLoadedCommonBaseList: false,
        isLoadedTokenList: false,
        isFirstToken: true
    },
    reducers: {
        setCommonBaseList: (state, action: PayloadAction<Array<any>>) => {
            state.commonBaseList = [...action.payload]
        },
        addCommonBaseList: (state, action: PayloadAction<any>) => {
            state.commonBaseList = [...state.commonBaseList, action.payload]
            state.isLoadedCommonBaseList = true
        },
        setTokenList: (state, action: PayloadAction<Array<any>>) => {
            state.tokenList = [...action.payload]
        },
        addTokenList: (state, action: PayloadAction<any>) => {
            state.tokenList = [...state.tokenList, action.payload]
            state.isLoadedTokenList = true
        },
        setAddressList: (state, action: PayloadAction<Array<any>>) => {
            state.addressList = [...action.payload]
        },
        addAddressList: (state, action: PayloadAction<any>) => {
            state.addressList = [...state.addressList, action.payload]
        },
        setIsLoadedCommonBaseList: (state, action: PayloadAction<boolean>) => {
            state.isLoadedCommonBaseList = action.payload
        },
        setIsLoadedTokenList: (state, action: PayloadAction<boolean>) => {
            state.isLoadedTokenList = action.payload
        },
        setIsFirstToken: (state, action: PayloadAction<boolean>) => {
            state.isFirstToken = action.payload
        },
    },
})

export const { setCommonBaseList, setTokenList } = searchTokenSlice.actions
export const { addCommonBaseList, addTokenList } = searchTokenSlice.actions
export const { setIsLoadedCommonBaseList, setIsLoadedTokenList } = searchTokenSlice.actions
export const { setIsFirstToken } = searchTokenSlice.actions
export const { setAddressList, addAddressList } = searchTokenSlice.actions

// Other code such as selectors can use the imported `RootState` type

export default searchTokenSlice.reducer


export const getCommonBaseList = (networkNo: any) => {
    return function (dispatch: Dispatch<any>) {
        let tokenObject: any = commonToken
        let tokens = tokenObject['tokens' + networkNo]
        console.log("getCommonBaseList", networkNo, tokens)
        return tokens.map((token: any) => {
            return dispatch(addCommonBaseList({...token, isCoin: token.address === zeroAddr}))
        })
    }
}

export const getTokenList = (networkNo: any, walletAddress: any) => {
    return function (dispatch: Dispatch<any>) {
      let tokenObject: any = defaultToken
      console.log("=========>Network: ", networkNo, defaultToken);
      let tokens = tokenObject['tokens' + networkNo]
      return tokens.map((token: any) => {
            dispatch(addAddressList(String(token.address).toLowerCase()))
            console.log("----------~~", token);
            return balanceOfWallet(token.address, walletAddress)
            .then((res: any) => {
                console.log("balance", token.symbol, res)
                return dispatch(addTokenList({...token, isCoin: token.address === zeroAddr, balance: res}))
            })
            .catch((err: any) => {
                console.log("#1===>", err);
            })
      })
    }
}


