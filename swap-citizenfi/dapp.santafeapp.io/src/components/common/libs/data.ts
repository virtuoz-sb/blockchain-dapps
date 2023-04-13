import polygonImg   from "../../../assets/img/icons/networks/polygon-network.jpg"
import binanceImg   from "../../../assets/img/icons/networks/bsc-network.jpg"
import ethImg       from "../../../assets/img/icons/networks/ethereum-network.jpg"
// import solanaImg       from "../../../assets/img/icons/networks/solana-network.jpg"
import BNB_icon     from "../../../assets/img/icons/bnb.png"
import CIFI_icon    from "../../../assets/img/icons/cifi.png"
import USDT_icon    from "../../../assets/img/icons/usdt.png"
import BUSD_icon    from "../../../assets/img/icons/busd.png"

import contracts   from "../../../contracts"
import Web3 from "web3"

import { net_state } from "../../../contracts"

export const chains: any = [
    {
        symbol: "MATIC",
        networkId: 137,
        label: "Polygon",
        icon: polygonImg,
        rpc: "https://polygon-rpc.com/"
    },
    {
        symbol: "BNB",
        networkId: 56,
        label: "Binance",
        icon: binanceImg,
        rpc: "https://bsc-dataseed1.binance.org:443"
    },
    {
        symbol: "MATIC",
        networkId: 80001,
        label: "Polygon Testnet",
        icon: polygonImg,
        rpc: "https://rpc-mumbai.maticvigil.com/v1/ID"
    },
    {
        symbol: "BNB",
        networkId: 97,
        label: "BSC Testnet",
        icon: binanceImg,
        rpc: "https://data-seed-prebsc-1-s1.binance.org:8545"
    },
    {
        symbol: "ETH",
        networkId: 1,
        label: "Ethereum",
        icon: ethImg,
        rpc: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
    },
]

export const networks: any = [
    137, 56, 80001, 97
]

export const adminAccounts = [
    String('0x05a409dcE87Bc77152330Dd9016C4968Cc362417').toLowerCase()
]

export const appStateId = net_state

export const curNetwork = networks[appStateId]

export const polygonWeb3 = new Web3(window.ethereum || chains[1].rpc)

export const appState = [
    {
        apiUrl: "https://api.dapp.santafeapp.io/api/",
        apiMetaUrl: "https://api.santafeapp.io/",
    },
    {
        apiUrl: "https://test.api.dapp.santafeapp.io/api/",
        // apiMetaUrl: "https://api.santafeapp.io/",
        apiMetaUrl: "http://localhost:8093/"
    },
    {
        apiUrl: "http://localhost:8005/api/",
        // apiUrl: "https://test.api.dapp.santafeapp.io/api/",
        apiMetaUrl: "http://localhost:8093/"
    }
]

export const coins: any = [
    {
        label: "CIFI",
        symbol: "CIFI",
        icon : CIFI_icon,
        address: contracts.address.Cifi_Token
    },
    {
        label: "BNB",
        symbol: "BNB",
        icon : BNB_icon
    },
    {
        label: "USDT",
        symbol: "USDT",
        icon : USDT_icon
    },
    {
        label: "BUSD",
        symbol: "BUSD",
        icon : BUSD_icon
    }
]

export const graphEndPoint = [
    "https://api.studio.thegraph.com/query/7211/citizenfinance/v0.0.1",
    "https://api.studio.thegraph.com/query/6699/citizen-finance/v0.0.2",
    "https://api.studio.thegraph.com/query/6699/citizen-finance/v0.0.2",
    "https://api.studio.thegraph.com/query/6699/citizen-finance/v0.0.2"
]
//https://thegraph.com/hosted-service/subgraph/jeydev310/fixedmarketplace

export const famosoSwapGraphEndPoint = [
    'https://api.thegraph.com/subgraphs/name/jeydev310/famoso-dex',
    'https://api.thegraph.com/subgraphs/name/jeydev310/famoso-dex',
    'https://api.thegraph.com/subgraphs/name/jeydev310/famoso-dex',
    'https://api.thegraph.com/subgraphs/name/jeydev310/famoso-dex'
]

export const famostoGraph = 'https://api.studio.thegraph.com/query/11375/famosotest/v0.0.2'
// "https://api.studio.thegraph.com/query/11327/famosomatic/v0.0.1"
// https://thegraph.com/studio/subgraph/famosomatic/
// https://thegraph.com/studio/subgraph/famosotest/

export const networkScan = [
    {
        title: 'Polygon Scan',
        url: 'https://polygonscan.com/'
    },
    {
        title: 'BSC Scan',
        url: 'https://bscscan.com/'
    },
    {
        title: 'Mumbai Testnet',
        url: 'https://mumbai.polygonscan.com/'
    },
    {
        title: 'BSC Testnet',
        url: 'https://testnet.bscscan.com/'
    },
]

