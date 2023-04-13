
import contracts       from "../../../../contracts"
import {isSameAddress} from "./index"
import jQuery from "jquery";
import SaleApi from "../../api/sale"
import { bestGas, bestGasPrice } from "../constant";
var alertify = require('alertifyjs')

export async function buyItem(contractAddress: any, tokenId: any, acceptedToken: any, price: any, buyer: any, cifiBalance: any, Fixed_Marketplace_Address: any){
        if((Number(cifiBalance) < Number(price)) && (acceptedToken.toLowerCase() === "cifi")){
            alertify.error("You have no enough token balance to buy this item")
            return
        }


        return window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accs: any) => {
          let account = accs[0];
          console.log("buy contract call", contractAddress, tokenId, acceptedToken, BigInt(Number(price) * 10 ** 18), account.toLowerCase())
          
          let NftMarketPlace: any = new window.web3.eth.Contract(contracts.abis.Fixed_Marketplace, Fixed_Marketplace_Address) //
            NftMarketPlace.setProvider(window.ethereum);

            if(acceptedToken.toLowerCase() === "bnb"){
                return NftMarketPlace.methods.safeExecuteOrder(contractAddress, tokenId).send({from: account, value: window.web3.utils.toWei(String(price)), gas: bestGas, gasPrice: bestGasPrice}) //, acceptedToken, BigInt(Number(price) * 10 ** 18)
                .then((buyData: any) => {
                    console.log("buyData", buyData);
                    return {
                        succ: true
                    }
                    // return SaleApi.buySale({
                    //     contractAddress: contractAddress,
                    //     tokenId: tokenId,
                    //     buyer: account.toLowerCase()
                    // })
                })
            }else{
                console.log("getTokenAddress", account, Fixed_Marketplace_Address, BigInt(Number(price) * 10 ** 18))
                return NftMarketPlace.methods.getTokenAddress(acceptedToken).call({from: account})
                .then((address: any) => {
                    let max_amount: any = window.web3.utils.toWei(String(2 ** 64 - 1))
                    let ERC20Contract : any = new window.web3.eth.Contract(contracts.abis.ERC20, address)
                    ERC20Contract.methods.allowance(account, Fixed_Marketplace_Address).call()
                    .then((allowaRes: any) => {
                        console.log("allowed cifi amount",allowaRes)
                        if(allowaRes < BigInt(Number(price) * 10 ** 18)){
                            return ERC20Contract.methods.approve(Fixed_Marketplace_Address, max_amount).send({from: account, gas: bestGas, gasPrice: bestGasPrice})
                            .then((allowanceIncreaseRes: any) => {
                                console.log("allowanceIncreaseRes", allowanceIncreaseRes)
                                return NftMarketPlace.methods.safeExecuteOrder(contractAddress, tokenId).send({from: account, gas: bestGas, gasPrice: bestGasPrice}) //, acceptedToken, BigInt(Number(price) * 10 ** 18)
                                .then((buyData: any) => {
                                    console.log("buyData", buyData);
                                    alertify.dismissAll();
                                    alertify.success("Success")
                                    setTimeout(() => {
                                        window.location.href = "/portfolio?tab=wallet"
                                    }, 300);
                                    return {succ: true}
                                })
                            })
                        }else{
                            return NftMarketPlace.methods.safeExecuteOrder(contractAddress, tokenId).send({from: account, gas: bestGas, gasPrice: bestGasPrice}) //, acceptedToken, BigInt(Number(price) * 10 ** 18)
                            .then((buyData: any) => {
                                console.log("buyData", buyData);
                                alertify.dismissAll();
                                alertify.success("Success")
                                setTimeout(() => {
                                    window.location.href = "/portfolio?tab=wallet"
                                }, 300);
                                return {succ: true}
                            })
                        }
                    })
                })
            }
        })
}

export async function putOnSaleItem(selectedType: any, selectedTokenType: any, tokenContractAddress: any, tokenId: any, selectedCoin: any, price: any, hours: any, Fixed_Marketplace_Address: any){
    
    console.log(selectedType, selectedTokenType, tokenContractAddress, tokenId, selectedCoin, price, hours)
    
    let NftMarketPlace: any = new window.web3.eth.Contract(contracts.abis.Fixed_Marketplace, Fixed_Marketplace_Address)
    NftMarketPlace.setProvider(window.ethereum);

    let ERC721: any         = new window.web3.eth.Contract(contracts.abis.ERC721, tokenContractAddress);

    console.log("putOnSaleItem Data: ", selectedType, selectedTokenType, tokenContractAddress, tokenId, selectedCoin, price, hours)
    
    return window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then((accs: any) => {
        let account = accs[0];
        return ERC721.methods.tokenURI(tokenId).call()
        .then((tokenUri: any) => {
            console.log("tokenURI  = ", tokenUri)
            return jQuery.get(tokenUri + "/")
            .then((metaData: any) => {
                if(typeof metaData === "string"){
                    metaData = JSON.parse(metaData)
                }
                console.log("metaData : ", metaData)
        
                ERC721.methods.isApprovedForAll(account, Fixed_Marketplace_Address)
                .call()
                .then((approveForAllRes: any) => {
                    if(approveForAllRes === true) return callCreateOrder(tokenContractAddress, tokenId, selectedCoin, price, hours, Fixed_Marketplace_Address, account)
                    else{
                        return ERC721.methods.setApprovalForAll(Fixed_Marketplace_Address, true)
                        .send({ from: account, gas: bestGas})
                        .then((setApproveForAll_Rest: any) => {
                            return callCreateOrder(tokenContractAddress, tokenId, selectedCoin, price, hours, Fixed_Marketplace_Address, account)
                        })
                    }
                })
            })
        })
    })
}

function callCreateOrder(tokenContractAddress: any, tokenId: any, selectedCoin: any, price: any, hours: any, Fixed_Marketplace_Address: any, account: any){
    var tmLoc = new Date();
    let endTm: any = (tmLoc.getTime() + tmLoc.getTimezoneOffset() * 60000 + hours * 60 * 60 * 1000)

    let NftMarketPlace: any = new window.web3.eth.Contract(contracts.abis.Fixed_Marketplace, Fixed_Marketplace_Address)
    return NftMarketPlace.methods.createOrder(tokenContractAddress, tokenId, selectedCoin.symbol, BigInt(Number(price) * 10 ** 18), endTm)
    .send({
        from: account, 
        gas: bestGas, 
        gasPrice: bestGasPrice
    })
    .then((res: any) => {
        return {
            succ: true
        }
    })
    .catch((err: any) => {
        console.log("has claim error")
        console.log(err)
        alertify.dismissAll();
    })
}

export async function cancelOrder(contractAddress: any, tokenId: any, rowId: any, Fixed_Marketplace_Address: any){
    return window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then((accs: any) => {
        let account = accs[0];
        let NftMarketPlace: any = new window.web3.eth.Contract(contracts.abis.Fixed_Marketplace, Fixed_Marketplace_Address)
        NftMarketPlace.setProvider(window.ethereum);
        return NftMarketPlace.methods.cancelOrder(contractAddress, tokenId).send({from: account, gas: bestGas, gasPrice: bestGasPrice})
        .then((buyData: any) => {
            alertify.dismissAll();
            alertify.success("Success cancel order")    
            setTimeout(() => {
                window.location.href="/portfolio?tab=wallet"
            }, 30);
            // SaleApi.cancelOrder({
            //     contractAddress: contractAddress, 
            //     tokenId: tokenId,
            //     id: rowId
            // }).then((res: any) => {
            //     if(res.data && res.data.success === true){
            //         alertify.dismissAll();
            //         alertify.success("Success cancel order")    
            //         setTimeout(() => {
            //             window.location.href="/portfolio?tab=wallet"
            //         }, 30);
            //     }else{
            //         alertify.dismissAll();
            //         alertify.error("Error on connection")    
            //     }
            // }).catch((err: any) => {
            //     alertify.dismissAll();
            //     alertify.error("Error on connection")    
            // })
        })
    })
}