
import maticPng from "../../../assets/img/icons/networks/polygon-network.jpg"
import cifiPng from "../../../assets/img/icons/anyswap.png"
import bnbPng  from "../../../assets/img/icons/bnb.png"
import wethPng from "../../../assets/img/icons/coins/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png"
import tstPng from "../../../assets/img/icons/coins/TST.jpg"

import contractData from "../../../contracts"
import { net_state } from "../../../contracts"

let arrCoins: any = [
    [
        {
            icon: cifiPng,
            label: "CIFI",
            address: "0x19623D433cAa0Cb8e56F42A368d7C7426180DC06",
        },
        {
            icon: maticPng,
            label: "MATIC",
            address: "0x0000000000000000000000000000000000001010",
        },
        {
            icon: tstPng,
            label: "MCT",
            address: contractData.address.MCT,
        },
    ],
    [
        {
            icon: cifiPng,
            label: "CIFI",
            address: "0x19623D433cAa0Cb8e56F42A368d7C7426180DC06",
        },
        {
            icon: maticPng,
            label: "MATIC",
            address: "0x0000000000000000000000000000000000001010",
        },
        {
            icon: tstPng,
            label: "MCT",
            address: contractData.address.MCT,
        },
    ],
    [
        {
            icon: cifiPng,
            label: "CIFI",
            address: contractData.address.Cifi_Token,
        },
        {
            icon: bnbPng,
            label: "BNB",
            address: "0x0000000000000000000000000000000000000010",
        },
        {
            icon: tstPng,
            label: "MCT",
            address: contractData.address.MCT,
        },
    ],
]

export const coins: any = arrCoins[net_state]

export const maticAddr = net_state === 1 ? "0x0000000000000000000000000000000000001010" : "0x0000000000000000000000000000000000001010"