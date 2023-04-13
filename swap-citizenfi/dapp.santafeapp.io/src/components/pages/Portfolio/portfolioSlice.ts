import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Dispatch } from 'redux';
import contract from '../../../contracts';
import { isSameAddress } from '../../common/libs/functions';
import { santaClassMap, santaMetaData, santaStakingpowaMap } from '../../common/libs/metadata';
export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

export const portfolioSlice = createSlice({
    name: 'pool',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        displayItems: [] as Array<any>,
        activeMenu: 0,
        activeTab: 0,
        isLoaded: false
    },
    reducers: {
        setDisplayItems: (state, action: PayloadAction<Array<any>>) => {
            state.displayItems = [...action.payload]
        },
        addDisplayItems: (state, action: PayloadAction<Array<any>>) => {
            state.displayItems = [...state.displayItems, ...action.payload]
            state.isLoaded = true
        },
        clearDisplayItems: (state, action: PayloadAction<any>) => {
            state.displayItems = []
        },
        setActiveMenu: (state, action: PayloadAction<number>) => {
            state.activeMenu = action.payload
        },
        setActiveTab: (state, action: PayloadAction<number>) => {
            state.activeTab = action.payload
        },
        setIsLoaded: (state, action: PayloadAction<boolean>) => {
            state.isLoaded = action.payload
        },
    },
})

export const { setDisplayItems, addDisplayItems, clearDisplayItems } = portfolioSlice.actions
export const { setActiveMenu, setActiveTab, setIsLoaded } = portfolioSlice.actions

// Other code such as selectors can use the imported `RootState` type

export default portfolioSlice.reducer

export const getTokensFromContract = (baseUri: any, contractAbi: any, contractAddress: any, walletAddress: any) => {
    return function (dispatch: Dispatch<any>) {
        console.log(baseUri, contractAddress)
        if (window.web3) {
            let Nft_Contract: any = new window.web3.eth.Contract(contractAbi, contractAddress)
            return Nft_Contract.methods.tokensOfOwner(walletAddress)
            .call({
                from: walletAddress
            })
            .then((tokens: any) => {
                if (tokens.length > 0) {
                    return tokens.map((tokenId: any) => {
                        return dispatch(getAndAddItem(baseUri, tokenId, contractAddress))
                    })
                } else {
                    return dispatch(setIsLoaded(true))
                }
            })
            .catch((err: any) => {
                return dispatch(setIsLoaded(true))
            })
        }
    }
}

export const getSaleTokens = (baseUri: any, contractAddress: any, walletAddress: any, graphEndPoint_url: any) => {
    return function (dispatch: Dispatch<any>) {
    const defaultQuery = {
        query: `
            query existOrderTransactions($nftAddress: String!, $seller: String!, $limit: Int!) {
                existOrderTransactions(first: $limit, where: {nftAddress: $nftAddress, seller: $seller}){
                    id
                    seller
                    nftAddress
                    tokenSymbol
                    assetId
                    priceInWei
                    expiresAt
                    timestamp
                    __typename
                }
            }
        `,
        variables: {
            limit: 1000,
            seller: walletAddress,
            nftAddress: contractAddress
        },
    }

    fetch(graphEndPoint_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultQuery),
    })
    .then((res) => res.json())
    .then((result) => {
        if(result.data && result.data.existOrderTransactions && (result.data.existOrderTransactions.length > 0)){
            let totalData: any = result.data.existOrderTransactions
            for(let i = 0 ; i < totalData.length ; i ++) {
                dispatch(getAndAddSaleItem(baseUri, totalData[i]))
            }
        }else{
            dispatch(setIsLoaded(true))
        }
    });
}
}


export const getAndAddItem = (baseUri: any, tokenId: number, contractAddress: any) => {
    return function (dispatch: Dispatch<any>) {
        let classId: number = santaClassMap[tokenId]
        if(isSameAddress(contract.address.SantaV1, contractAddress)){
            let tmpItem: any = {
                name: santaMetaData[0][classId].name,
                contractAddress: contractAddress,
                image: santaMetaData[0][classId].image,
                type: "Kainu",
                token_id : tokenId,
                attributes: {
                    face_value: classId,
                    stakingpowa: santaStakingpowaMap[tokenId]
                }
            }
            return dispatch(addDisplayItems([tmpItem]))
        }
        else{
            fetch(baseUri + tokenId)
            .then((res) => res.json())
            .then((metaData) => {
                metaData.contractAddress = contractAddress
                metaData.type = 
                    isSameAddress(contract.SantaV1, contractAddress) ? "Kainu"  :
                    isSameAddress(contract.SantaV2, contractAddress) ? "Olympics2020" :
                    "META"
                dispatch(addDisplayItems([metaData]))
            })
        }
    }
}
 
export const getAndAddSaleItem = (baseUri: any, item: any) => {
    return function (dispatch: Dispatch<any>) {
        fetch(baseUri + item.assetId)
        .then((res) => res.json())
        .then((metaData) => {
            metaData.contractAddress = item.nftAddress
            metaData.type = isSameAddress(contract.address.SantaV1, item.nftAddress) ? "Kainu" : isSameAddress(contract.address.SantaV2, item.nftAddress) ? "Olympics2020" : "META"

            metaData.token_id = item.assetId
            metaData.seller = item.seller
            metaData.price  = item.price
            metaData.nftAddress  = item.nftAddress
            metaData.tokenSymbol = item.tokenSymbol
            metaData.assetId = item.assetId
            metaData.priceInWei  = item.priceInWei
            metaData.expiresAt   = item.expiresAt

            dispatch(addDisplayItems([metaData]))
        })
    }
}