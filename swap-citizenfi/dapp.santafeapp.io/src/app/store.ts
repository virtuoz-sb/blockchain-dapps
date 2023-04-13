import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { pokemonApi } from '../services/pokemon'
import appReducer     from "./reducers/appSlice"
import kainuStakingReducer from "../components/pages/Pool/Kainu/kainuStakingSlice"
import oldKainuStakingReducer from '../components/pages/Pool/OldKainu/oldKainuStakingSlice'
import olympicStakingReducer from '../components/pages/Pool/Olympic/olympicStakingSlice'
import poolReducer    from "../components/pages/Pool/poolSlice"
import marketReducer from '../components/pages/Market/marketSlice'
import connectWalletReducer from '../components/common/libs/ConnectWallet/connectWalletSlice'
import forgeReducer from '../components/pages/Oaxaca/Forge/forgeSlice'
import blindReducer from '../components/pages/Oaxaca/BlindFi/blindSlice'
import portfolioReducer from '../components/pages/Portfolio/portfolioSlice'
import blindfiPanelReducer from '../components/pages/Manage/BlindFiPanel/blindfiPanelSlice'
import famosoBlackListReducer from '../components/pages/Manage/FamosoBlackList/famosoBlackListSlice'
import searchTokenReducer from '../components/pages/Swap/Liquidity/SearchToken/searchTokenSlice'
import addLiquidityReducer from '../components/pages/Swap/Liquidity/AddLiquidity/addLiquiditySlice'
import swapReducer from '../components/pages/Swap/swapSlice'
//admin
import cifipanelReducer from '../components/pages/Manage/CifiPanel/cifipanelSlice'

export const store = configureStore({
  reducer: {
    // posts: postsReducer,
    // comments: commentsReducer,
    // users: usersReducer,
    app: appReducer,
    kainuStaking: kainuStakingReducer,
    oldKainuStaking: oldKainuStakingReducer,
    pool: poolReducer,
    market: marketReducer,
    connectWallet: connectWalletReducer,
    forge: forgeReducer,
    portfolio: portfolioReducer,
    blind: blindReducer,
    blindfiPanel: blindfiPanelReducer,
    olympicStaking: olympicStakingReducer,
    //admin
    cifipanel: cifipanelReducer,
    famosoBlackList: famosoBlackListReducer,
    searchTokenSlice: searchTokenReducer,
    addLiquiditySlice: addLiquidityReducer,
    swapSlice: swapReducer,

    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(pokemonApi.middleware),
})
setupListeners(store.dispatch)
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch