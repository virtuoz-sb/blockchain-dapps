import Web3 from "web3"
import { net_state } from "../../../contracts"
export const bestGas = 1000000
export const bestGasPrice = Web3.utils.toWei('50', 'gwei')
export const zeroAddr = '0x0000000000000000000000000000000000000000'
export const maxApproveAmount = Web3.utils.toWei(String(2 ** 64 - 1))
export const chkApproveAmount = Web3.utils.toWei(String(500000))
export const unitAmount = BigInt(String(10**18))
export const maxSupply = 500000
export const mnTkAmt    = BigInt("10")
export const mnDeadline = 1700000000


export enum NETWORK_TYPES { MATIC_MAIN, BSC_MAIN, MATIC_TEST, BSC_TEST }

export enum MENU_LIST { POOL, FORGE, LOOTBOX, SWAP, MARKET, CIFI_PANEL, BLIND_PANEL, FAMOSO_BLACK }

export enum SWAP_MODAL_TYPE {SWAP, LIQUIDITY, ADD_LIQUIDITY, REMOVE_LIQUIDITY, BRIDGE, SETTING}

export const wethAddr = [
    '',
    '',
    '0x86652c1301843B4E06fBfbBDaA6849266fb2b5e7',
    ''
]
export const NetworkArray = [
    [{
        chainId: '0x89', 
        chainId_dec: 137,
        chainName: 'Polygon',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
    }],
    [{
        chainId: '0x38', 
        chainId_dec: 56,
        chainName: 'BSC Mainnet',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
    }],
    [{
        chainId: '0x89', 
        chainId_dec: 80001,
        chainName: 'Polygon Testnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
    }],
    [{
        chainId: '0x61', 
        chainId_dec: 97,
        chainName: 'BSC Testnet',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/'],
    }],
]

export const MATIC_API='ATQ7BDMSXF9Y5TUBCT27HDWUNNR5HJ2M85'

export const NUM_ARR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
