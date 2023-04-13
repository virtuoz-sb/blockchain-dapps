import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { Dispatch } from 'redux';
import class6Img   from "../../../assets/img/dragons/tinified/Foreverwing_6.jpg"
import olympicImg  from "../../../assets/img/icons/Olympic_God.jpg"
import { classImgArr } from "../../common/libs/image"
import contracts, { contractAddress } from "../../../contracts";
import { net_state } from '../../../contracts';
import { graphEndPoint } from '../../common/libs/data';
import { santaClassMap, santaMetaData } from '../../common/libs/metadata';
import { dynamicSort, isSameAddress, validateWalletAddres } from '../../common/libs/functions';
import { getAllJSDocTagsOfKind } from 'typescript';
export const STATE = {
    START: 0,
    SUCC: 1,
    ERR: 2
}

const pageLimit = Number(window.innerWidth) > 1280 ? 10 : 12

console.log("window.width = ", )

const defaultQuery = {
    query: `
        query existOrderTransactions($limit: Int!) {
            existOrderTransactions(first: $limit, orderBy: timestamp, orderDirection: desc) {
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
        limit: pageLimit
    },
}

const sortKey = [
    ["timestamp", 1],
    ["timestamp", 0],
    ["priceInWei", 1],
    ["priceInWei", 0],
]

export const marketSlice = createSlice({
    name: 'market',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: {
        loadingMore: false,
        isLoaded: false,
        saleList: [] as Array<any>,
        pageId: 0,
        activeTab: 0,
        pageLimit: pageLimit,
        searchQuery: defaultQuery,
        tabs:[] as Array<any>, 
        sortOrder : 0
    },
    reducers: {
        setActiveTab: (state, action: PayloadAction<number>) => {
            state.activeTab = action.payload
        },
        setLoadingMore: (state, action: PayloadAction<boolean>) => {
            state.loadingMore = action.payload
        },
        setIsLoaded: (state, action: PayloadAction<boolean>) => {
            state.isLoaded = action.payload
        },
        setSaleList: (state, action: PayloadAction<Array<any>>) => {
            state.saleList = action.payload
        },
        setSortOrder: (state, action: PayloadAction<number>) => {
            state.sortOrder = action.payload
        },
        addSaleList: (state, action: PayloadAction<Array<any>>) => {
            state.saleList = [...state.saleList, ...action.payload]
            state.isLoaded = true
            state.loadingMore = false
        },
        setPageId: (state, action: PayloadAction<number>) => {
            state.pageId = action.payload
        },
        nextPageId: (state) => {
            state.pageId = state.pageId + 1
        },
        setTabs: (state, action: PayloadAction<Array<any>>) => {
            state.tabs = action.payload
        },
        clearTabs: (state, action: PayloadAction<Array<any>>) => {
            state.tabs = [...action.payload]
        },
        addTabs: (state, action: PayloadAction<any>) => {
            state.tabs = [...state.tabs, action.payload]
            console.log("state.tabs", state.tabs)
        },
    },
})

export const { setActiveTab, setLoadingMore, setIsLoaded, setSaleList, addSaleList, setPageId, nextPageId } = marketSlice.actions
export const { setTabs, clearTabs, addTabs } = marketSlice.actions
export const { setSortOrder } = marketSlice.actions
export const getTabs = (SantaFactoryV3_Address: any, clrTabs: Array<any>) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(clearTabs(clrTabs))
        console.log("here get tabs here --------------")
        if (window.web3 && window.web3.eth) {
            console.log("here get tabs here")
            let SantaFactoryV3: any = new window.web3.eth.Contract(contracts.abis.SantaFactoryV3, SantaFactoryV3_Address)
            SantaFactoryV3.methods.getContractCount().call()
            .then((size: number) => {
                for (let i = 0; i < size; i++) {
                    SantaFactoryV3.methods.getContractNames(i).call()
                        .then((name: string) => {
                            SantaFactoryV3.methods.getContractData(name).call()
                                .then((res: any) => {
                                    let data: any = {
                                        label: name,
                                        acceptedToken: res.acceptedToken,
                                        maxCount: res.maxCount,
                                        addr: res.santa,
                                        img: classImgArr[(i + 1) % 5 + 1],
                                        icon: true
                                    }
                                    dispatch(addTabs(data))
                                })
                        })
                }
            })
        }
    }
}


export const clickSort = (order: number, holder: any, connectedNetwork: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setSortOrder(order))
        dispatch(setSaleList([]))
        dispatch(setIsLoaded(false))
        dispatch(setPageId(0))

        
        let query: any = {
            query: `
                query existOrderTransactions($nftAddress: String!, $limit: Int!, $field: String!, $order: String!) {
                    existOrderTransactions(first: $limit, where: {nftAddress: $nftAddress}, orderBy: $field, orderDirection: $order) {
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
                limit: pageLimit,
                nftAddress: holder,
                field: sortKey[order][0], 
                order: sortKey[order][1] === 1 ? "desc" : "asc"
            },
        }

        if(validateWalletAddres(holder)){
            dispatch(getSaleData(query, connectedNetwork))
        }else {            
            let tmpQuery: any = {
                query: `
                    query existOrderTransactions($limit: Int!, $field: String!, $order: String!) {
                        existOrderTransactions(first: $limit, orderBy: $field, orderDirection: $order) {
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
                    limit: pageLimit,
                    field: sortKey[order][0], 
                    order: sortKey[order][1] === 1 ? "desc" : "asc"
                },
            }
            dispatch(getSaleData(tmpQuery, connectedNetwork))
        }
    }
}


export const initPage = (connectedNetwork: any, tbsArr: Array<any>) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setIsLoaded(false))
        dispatch(setSaleList([]))
        setPageId(0)
        if(net_state !== 0)dispatch(getTabs(contractAddress[connectedNetwork].SantaFactoryV3, tbsArr))
        dispatch(getSaleData(defaultQuery, connectedNetwork))
    }
}

export const clickTab = (tabIndex: any, holder: any, order: number, connectedNetwork: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setSaleList([]))
        dispatch(setActiveTab(tabIndex))
        dispatch(setIsLoaded(false))
        dispatch(setPageId(0))

        
        let query: any = {
            query: `
                query existOrderTransactions($nftAddress: String!, $limit: Int!, $field: String!, $order: String!) {
                    existOrderTransactions(first: $limit, where: {nftAddress: $nftAddress}, orderBy: $field, orderDirection: $order) {
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
                limit: pageLimit,
                nftAddress: holder,
                field: sortKey[order][0], 
                order: sortKey[order][1] === 1 ? "desc" : "asc"
            },
        }
        if(validateWalletAddres(holder)){
            dispatch(getSaleData(query, connectedNetwork))
        }else{            
            let tmpQuery: any = {
                query: `
                    query existOrderTransactions($limit: Int!, $field: String!, $order: String!) {
                        existOrderTransactions(first: $limit, orderBy: $field, orderDirection: $order) {
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
                    limit: pageLimit,
                    field: sortKey[order][0], 
                    order: sortKey[order][1] === 1 ? "desc" : "asc"
                },
            }
            dispatch(getSaleData(tmpQuery, connectedNetwork))
        }
    }
}


export const loadMore = (curPage: number, nftAddress: any, order: number, connectedNetwork: any) => {
    return function (dispatch: Dispatch<any>) {
        dispatch(setLoadingMore(true))

        
        let query: any = {
            query: `
                query existOrderTransactions($nftAddress: String!, $limit: Int!, $skip: Int!, $field: String!, $order: String!) {
                    existOrderTransactions(first: $limit, skip: $skip, where: {nftAddress: $nftAddress}, orderBy: $field, orderDirection: $order) {
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
                limit: pageLimit,
                nftAddress: nftAddress,
                skip: pageLimit*curPage,
                field: sortKey[order][0], 
                order: sortKey[order][1] === 1 ? "desc" : "asc"
            },
        }         
        if(!validateWalletAddres(nftAddress)){
            query = {
                query: `
                    query existOrderTransactions($limit: Int!, $skip: Int!, $field: String!, $order: String!) {
                        existOrderTransactions(first: $limit, skip: $skip, orderBy: $field, orderDirection: $order) {
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
                    limit: pageLimit,
                    skip: pageLimit*curPage,
                    field: sortKey[order][0], 
                    order: sortKey[order][1] === 1 ? "desc" : "asc"
                },
            }  
        }
        dispatch(getSaleData(query, connectedNetwork))
    }
}

export const getSaleData = (query: any, connectedNetwork: any) => {
    console.log("get sale data market")
    return function (dispatch: Dispatch<any>) {
        fetch(graphEndPoint[connectedNetwork], {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(query),
        })
        .then((res) => res.json())
        .then((result) => {
            if(result.data && result.data.existOrderTransactions && (result.data.existOrderTransactions.length > 0)){
                console.log("here finished", result.data.existOrderTransactions)
                let data: Array<any> = result.data.existOrderTransactions
                // data = data.sort(dynamicSort("assetId"))
                // console.log("data", data.sort(dynamicSort("assetId")))
                // console.log("data[0][assetId]", data[0]["assetId"])
                dispatch(nextPageId())
                for(let i = 0 ; i < data.length ; i ++) dispatch(getAndAddSaleItem(data[i], connectedNetwork))
            }else{
                dispatch(setIsLoaded(true))
                dispatch(setLoadingMore(false))
            }
        })
        .catch((err: any) => {
            return dispatch(getSaleData(query, connectedNetwork))
        })
    }
}

export const getAndAddSaleItem = (item: any, connectedNetwork: any) => {
    return function (dispatch: Dispatch<any>) {
        let tmpItem = item
        let classId: number = santaClassMap[item.assetId]
        if(isSameAddress(item.nftAddress, contractAddress[connectedNetwork].SantaV1)){
            tmpItem.name  = santaMetaData[0][classId].name
            tmpItem.image = santaMetaData[0][classId].image
        }else if(isSameAddress(item.nftAddress, contractAddress[connectedNetwork].SantaV2)){
            tmpItem.name  = santaMetaData[1][classId].name
            tmpItem.image = santaMetaData[1][classId].image
        }else if(isSameAddress(item.nftAddress, contractAddress[connectedNetwork].LootBox)){
            let token_3_arr = [4668, 5467, 4333, 4335, 7653]
            if(token_3_arr.indexOf(item.assetId) > -1){
                classId = 3
            }
            tmpItem.name  = santaMetaData[2][classId].name
            tmpItem.image = santaMetaData[2][classId].image
        }
        dispatch(addSaleList([tmpItem]))
    }
}

// Other code such as selectors can use the imported `RootState` type

export default marketSlice.reducer
