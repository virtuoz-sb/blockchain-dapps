
import contracts from "../../../../contracts"
import { isSameAddress } from "./index"
import { adminAccounts } from "../data"
import { net_state } from "../../../../contracts"
import { bestGas, bestGasPrice, zeroAddr } from "../constant"

export function getErc721Tokens(){
    
}

export function approveErc20(tokenAddress: any, spender: any, walletAddress: any, amount?: any) {
    let max_amount: any = window.web3.utils.toWei(String(2 ** 64 - 1))
    amount = amount || max_amount
    let TokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, tokenAddress)
    return TokenContract.methods.approve(spender, amount)
    .send({from: walletAddress, gas: bestGas, gasPrice: bestGasPrice})
}

export function approveErc20Bsc(tokenAddress: any, spender: any, walletAddress: any, amount?: any) {
    let max_amount: any = window.web3.utils.toWei(String(2 ** 64 - 1))
    amount = amount || max_amount
    let TokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, tokenAddress)
    return TokenContract.methods.approve(spender, amount)
    .send({from: walletAddress, gas: 500000})
}

export function allowanceErc20(tokenAddress: any, spender: any, walletAddress: any) {
    let TokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, tokenAddress)
    return TokenContract.methods.allowance(walletAddress, spender).call()
}

export function balanceErc20(tokenAddress: any, walletAddress: any) {
    let TokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, tokenAddress)
    return TokenContract.methods.balanceOf(walletAddress).call()
}

export function decimalsErc20(tokenAddress: any) {
    let TokenContract: any = new window.web3.eth.Contract(contracts.abis.ERC20, tokenAddress)
    return TokenContract.methods.decimals().call()
}

export function balanceCoin(walletAddress: any) {
    return window.web3.eth.getBalance(walletAddress)
}

export const balanceOfWallet = (tokenAddress: any, walletAddress: any) => {
    if(isSameAddress(zeroAddr, tokenAddress)) return balanceCoin(walletAddress)
    else return balanceErc20(tokenAddress, walletAddress)
}

export function isAdmin(addr: string){
    if(net_state === 0)return false
    return true
    return adminAccounts.indexOf(addr.toLowerCase()) > -1
}

export function getMiningPowaValueV1(classId: number, stakingPowa: number){
    let unfold = 0;
    if (classId === 1) {
        unfold = (stakingPowa * 10000) / 5000;
        unfold = unfold + 11000;
    } else if (classId === 2) {
        unfold = ((stakingPowa - 5000) * 10000) / 3000;
        unfold = unfold + 12000;
    } else if (classId === 3) {
        unfold = ((stakingPowa - 8000) * 10000) / 1000;
        unfold = unfold + 13000;
    } else if (classId === 4) {
        unfold = ((stakingPowa - 9000) * 15000) / 900;
        unfold = unfold + 14000;
    } else if (classId === 5) {
        unfold = ((stakingPowa - 9900) * 15000) / 75;
        unfold = unfold + 15000;
    } else {
        unfold = ((stakingPowa - 9975) * 15000) / 25;
        unfold = unfold + 18000;
    }

    return unfold/10000
}

export function getMiningPowaValueV2(classId: number, stakingPowa: number){
    let unfold = 0;
    if (classId === 1) {
        unfold = (stakingPowa * 10000) / 5000;
        return unfold + 11000;
    } else if (classId === 2) {
        unfold = ((stakingPowa - 5000) * 10000) / 3000;
        return unfold + 12000;
    } else if (classId === 3) {
        unfold = ((stakingPowa - 8000) * 10000) / 2000;
        return unfold + 13000;
    } else if (classId === 4) {
        unfold = ((stakingPowa - 9000) * 15000) / 1000;
        return unfold + 14000;
    } else if (classId === 5) {
        unfold = ((stakingPowa - 9800) * 15000) / 500;
        return unfold + 15000;
    } else {
        unfold = ((stakingPowa - 9980) * 15000) / 100;
        return unfold + 16000;
    }
}