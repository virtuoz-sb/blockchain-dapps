import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';
import contract, { net_state } from '../../../../../contracts';
import { famostoGraph } from '../../../../common/libs/data';
import commonToken  from "../../../../../helpers/tokenLists/famoso-common.tokenlist.json"
import { maxSupply, zeroAddr } from '../../../../common/libs/constant';

export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

let tokenObject: any = commonToken

export const addLiquiditySlice = createSlice({
    name: 'Add Liquidity',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        tokenA: null as any, // {...tokenObject['tokens' + net_state][0], isCoin: tokenObject['tokens' + net_state][0].address === zeroAddr} as any,
        tokenB: null as any, // {...tokenObject['tokens' + net_state][2], isCoin: tokenObject['tokens' + net_state][2].address === zeroAddr} as any,
        approvedA: false,
        approvedB: false
    },
    reducers: {
        setTokenA: (state, action: PayloadAction<any>) => {
            state.tokenA = action.payload
        },
        setTokenB: (state, action: PayloadAction<any>) => {
            state.tokenB = action.payload
        },
        setApprovedA: (state, action: PayloadAction<boolean>) => {
            state.approvedA = action.payload
        },
        setApprovedB: (state, action: PayloadAction<boolean>) => {
            state.approvedB = action.payload
        },
    },
})

export const { setTokenA, setTokenB } = addLiquiditySlice.actions
export const { setApprovedA, setApprovedB } = addLiquiditySlice.actions

// Other code such as selectors can use the imported `RootState` type

export default addLiquiditySlice.reducer

export const getFamosoToken = () => {
    return function (dispatch: Dispatch<any>) {
        const defaultQuery = {
            query: `
                query createFamosoTansactions($limit: Int!) {
                    createFamosoTansactions{
                        id
                        count
                        tokenA
                        tokenB
                    }
                    createFamosoCoinTansactions{
                        id
                        count
                        token
                        coin
                    }
                }
            `,
            variables: {
                limit: 1000,
            },
        }

        fetch(famostoGraph, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(defaultQuery),
        })
        .then((res) => res.json())
        .then((result) => {
            // console.log("res from famoso graph", result)
        });
    }
}

export const checkApproved = (tokenAddress: any, isTokenA: boolean, owner: any, spender: any) => {
    return function (dispatch: Dispatch<any>) {
        if(tokenAddress === zeroAddr)
            return isTokenA ? dispatch(setApprovedA(true)) : dispatch(setApprovedB(true))
        else{
            const tokenContract = new window.web3.eth.Contract(contract.abis.ERC20, tokenAddress)
            return tokenContract.methods.allowance(owner, spender)
            .call()
            .then((res: any) => {
                const isApproved: boolean = Number(res) >= maxSupply
                return isTokenA ? 
                dispatch(setApprovedA(isApproved))
                :
                dispatch(setApprovedB(isApproved))
            })
        }
    }
}
