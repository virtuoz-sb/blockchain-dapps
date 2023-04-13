import SantaFactoryV2   from "./Abis/SantaFactoryV2.json"
import SantaV2          from "./Abis/SantaV2.json"
import SantaV1          from "./Abis/Santa.json"
import SantaFactory     from "./Abis/SantaFactory.json"
import ERC20            from "./Abis/ERC20.json"
import ERC721           from "./Abis/ERC721.json"
import Cifi_Token       from "./Abis/Cifi_Token.json"
import Fixed_Marketplace from "./Market/Fixed_Marketplace.json"
// import Fixed_Marketplace_old from "./Market/old/Fixed_Marketplace.json"
import NftStaking       from "./Abis/NftStaking.json"
import OldNftStaking       from "./Abis/OldNftStaking.json"
// import SantaFactory2V2  from "./Abis/SantaFactory2V2.json"
import NftStakingV2     from "./Abis/NftStakingV2.json"
import SantaFactoryV3   from "./Abis/SantaFactoryV3.json"

import BlindBox         from "./BlindBox/BlindBox.json"
import BlindBoxFactory  from "./BlindBox/BlindBoxFactoryV1.json"
import BlindBoxFactoryV2  from "./BlindBox/BlindBoxFactoryV2.json"

import LootBox          from "./LootBox/LootBox.json"
import LootBoxFactory   from "./LootBox/LootBoxFactory.json"
import LootBoxFactoryV1 from "./LootBox/LootBoxFactoryV1.json"

import FamosoFactory    from "./Swap/FamosoFactory.json"
import FamosoPair       from "./Swap/FamosoPair.json"
import FamosoErc20      from "./Swap/FamosoERC20.json"
import FamosoRouter     from "./Swap/FamosoRouter.json"
import FBlist           from "./Swap/FBlist.json"

import FamosoStaking    from "./FamosoStaking/FamosoStaking.json"
import CifiStaking    from "./FamosoStaking/CifiStaking.json"

import SwapCifiMetalands from "./MigrateToken/SwapCifiMetalands.json"

let state_var: any = 0

export const net_state = state_var

const addresses: any = [
    { //Polygon Mainnet
        SantaFactory: "0x2a18F61C75981cD587f786490f1a0f5e5Ada6718",// "0x2a18F61C75981cD587f786490f1a0f5e5Ada6718",
        SantaV1: "0x89F2a5463eF4e4176E57EEf2b2fDD256Bf4bC2bD", //"0x89F2a5463eF4e4176E57EEf2b2fDD256Bf4bC2bD",
        SantaFactoryV2 : "0xa6DF7f4917B9A669044bb699bB05b6F166BDd92f",
        SantaV2: "0x26095136711a9abC88009026F92d6200d3317D6A",
        Cifi_Token: "0x316772cfec9a3e976fde42c3ba21f5a13aaaff12", //"0x316772cfec9a3e976fde42c3ba21f5a13aaaff12",
        _MATIC: "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
        AcceptedToken: "0x44E80B4BA2f03cAd1f729768Eb68951E1aDDE011",
        Fixed_Marketplace: "0xa2D39AAC680849D3013e1217E1309d901F4B22d7",//"0x5c14449500ba0c9879Dc27E3A51aA79fCc4Ee287",
        NftStaking: "0x3f849D445454d2386Ab425B7264c7782bE7E66de",
            OldNftStaking: "0xeDB3A700C4ee3b743Aeb0b55E0D2c0B33A4F3314",
            OldNftStaking__2: "0xe083c3e8702AC24aeC9C3d21289f19915bc4697e",
        NftStakingV2: "0xeDeE270455CaCc20A2a5a5ef3409ED9520d6C178",
            OldNftStakingV2__1: "0x61a74D320C3190E2fC2130e463A97bc2A531F8B4",
            OldNftStakingV2__2: "0x75F1499BBeF601ffF5F7B5DeC5bE65c5B5b1eDE7",
            OldNftStakingV2__3: "0xaCD89981f75A82Cba740599817aA61958A254b98",
        SantaFactoryV3: "0xAF0D7960138a0e81Bb9d34BC500dce23E2F5875b",
        
        BlindBox: "0x1A03410C9b970C2bd65786C9e52d7363E3BeAFd4", //TestBlindFi
        BlindBoxFactory: "0xcfEa9a5225bafb8b0245000c1eC3Fa18bc246b9b",

        LootBox: "0xB4ECCCe11a7970beA7157BEb2c7ea7b215Ae4818",
        LootBoxFactory: "0x78c6B9611A95f8B88B3175D99E7De7603A5A7013",
        LootBoxFactoryV1: "0x78c6B9611A95f8B88B3175D99E7De7603A5A7013",
    },
    //BSC Mainnet
    {
        Cifi_Token: "0x89F2a5463eF4e4176E57EEf2b2fDD256Bf4bC2bD",

        LootBox: "0x4dcDb06902B8f5B9F07033b57f3F7B894265efaf",
        LootBoxFactory: "0xA6714c99789E464DDAFD32171438Cf9ccAE1C1e0"
    },
    {//Matic test net
        SantaFactory: "0x9470A173EF87c9Bcaf0792868cfE4aA3F2435D7C",
        SantaV1: "0xd9d4219fF9176bf1e149547A7ABe27bA01e8b70B",
        SantaFactoryV2 : "0x4C935AFcd8F8435dcaa8150050961D122782dD75",
        SantaV2: "0xd13DF104BbA13aDF5431145E6739Bd910BBD8e57",
        Cifi_Token: "0x19623D433cAa0Cb8e56F42A368d7C7426180DC06",
        _MATIC: "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
        AcceptedToken: "0x44E80B4BA2f03cAd1f729768Eb68951E1aDDE011",
        Fixed_Marketplace: "0x1F888Ba2b46Bb7Db4fF9205D71D3C99d4C146404", //"0x969f75Be474F6613546B3409CAF9202c50CeA5F8",
        NftStaking: "0x313b48676D2F028A5122bb96aa6Fc610bB8b1967",
        OldNftStaking: "0x313b48676D2F028A5122bb96aa6Fc610bB8b1967",
        // SantaFactory2V2: "0x15755fD2a20BBe1F6885dd5512F287217901E387",
        NftStakingV2: "0x288BdfE33EcC1fC8C64685DA7B6Fc2f307e57241",
        SantaFactoryV3: "0xAF0D7960138a0e81Bb9d34BC500dce23E2F5875b",

        BlindBox: "0x9aB04d82E5c39d1691D906D3C68647Dcd258a33B", //TestBlindFi
        BlindBoxFactory: "0x55Eb93533736b3c15097888d063c08EBFC1B223D",
        BlindBoxFactoryV2:"0x801bC388A3908E3b3bE134B72626dDcd42783fCc",// "0x2717e739cAeD7D3fBC853d9fa8aceed118c0E31e",

        LootBox: "0x78c6B9611A95f8B88B3175D99E7De7603A5A7013",
        LootBoxFactory: "0xcdd84BE1B72F8ebAa1F8fc30d5197838FC883b5F",
        
        FamosoFactory: "0x24FAE83620fbcD56b76b55B4289e726aA385E034",
        FamosoPair: "0x0c5B8eDcd5D6D27Ed93bA793B91438331169C319",
        FamosoEvent: "0xb13f40342b2eb052139960Cac72cF68A8653054D",
        FBlist: "0x3254009f679290f4aD5E2C1c81707671e31f09f9",
        FamosoErc20: "0xF79e6D66e437583812AdB3087B5b31e36Ce08f6A",
        FamosoRouter: "0x3728DB933e0cAE1877A8c17B1cc36138fB44A17B",
        MCT: "0xc8ED10fF3348aa0385907F230BAC94395D49fCbA",
        SwapCifiMetalands: "0x5dA2D8C56F184787D52ae0cBbca7A86Fda758E2B",
        FamosoStaking: "0x84cdd68eC73fdBBBA806e9dDCE0AbAD95Dc96c6C",
        CifiStaking: "0xeEF7e616F3769cE63dE662305C9cda0FC1Ebd9b4"
    },
    {//bsc testnet
        SantaFactory: "0x9470A173EF87c9Bcaf0792868cfE4aA3F2435D7C",
        SantaV1: "0xd9d4219fF9176bf1e149547A7ABe27bA01e8b70B",
        SantaFactoryV2 : "0x4C935AFcd8F8435dcaa8150050961D122782dD75",
        SantaV2: "0xd13DF104BbA13aDF5431145E6739Bd910BBD8e57",
        Cifi_Token: "0xc14df956215B6E2cD6b666F65B47cAca1EB7d1C7",
        _MATIC: "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e",
        AcceptedToken: "0x44E80B4BA2f03cAd1f729768Eb68951E1aDDE011",
        Fixed_Marketplace: "0x1F888Ba2b46Bb7Db4fF9205D71D3C99d4C146404", //"0x969f75Be474F6613546B3409CAF9202c50CeA5F8",
        NftStaking: "0x313b48676D2F028A5122bb96aa6Fc610bB8b1967",
        OldNftStaking: "0x313b48676D2F028A5122bb96aa6Fc610bB8b1967",
        // SantaFactory2V2: "0x15755fD2a20BBe1F6885dd5512F287217901E387",
        NftStakingV2: "0x288BdfE33EcC1fC8C64685DA7B6Fc2f307e57241",
        SantaFactoryV3: "0xAF0D7960138a0e81Bb9d34BC500dce23E2F5875b",

        BlindBox: "0x2a18F61C75981cD587f786490f1a0f5e5Ada6718", //TestBlindFi
        BlindBoxFactoryV2: "0x2717e739cAeD7D3fBC853d9fa8aceed118c0E31e",
        BlindBoxFactory: "0x2a18F61C75981cD587f786490f1a0f5e5Ada6718",

        
        FamosoERC20: "0xFc3418a0BCcE23bD528EaDD0094bF25d72559362",
        FamosoPair: "0x49c00f5d2bfD97277C420E3C27468A0F4fFE1830",
        FamosoFactory: "0x05b81aB52F22ce1bE5b44589CE29D42C201f7FB6",
        FamosoRouter: "0x362EF1F430a4f441fc3578E418a07b06fe79f4CE",
        FBlist: "0x0a4d2b831A5E50173f6e3E2A95f148eC084BAc25",
        MCT: "0x1ed94ca3B3DfE78A3e2c23CCae7E4e74F0404b23",
        MEND: "0xeaAc9768Cf23297eA86ebAE304c5258Ac6Ea427d",
        SwapCifiMetalands: "0x5dA2D8C56F184787D52ae0cBbca7A86Fda758E2B"
    }
]

const contract: any = {
    abis: {
        SantaFactoryV2: SantaFactoryV2.abi,
        SantaV2: SantaV2.abi,
        SantaFactory: SantaFactory.abi,
        SantaV1: SantaV1.abi,
        ERC20: ERC20.abi,
        ERC721: ERC721.abi,
        Cifi_Token: Cifi_Token.abi,
        Fixed_Marketplace: Fixed_Marketplace.abi,
        OldNftStaking: OldNftStaking.abi,
        NftStaking: NftStaking.abi,
        // SantaFactory2V2: SantaFactory2V2.abi,
        NftStakingV2: NftStakingV2.abi,
        SantaFactoryV3: SantaFactoryV3.abi,

        BlindBox: BlindBox.abi,
        BlindBoxFactory: BlindBoxFactory.abi,
        BlindBoxFactoryV2: BlindBoxFactoryV2.abi,

        LootBox: LootBox.abi,
        LootBoxFactory: LootBoxFactory.abi,
        LootBoxFactoryV1: LootBoxFactoryV1.abi,

        FamosoErc20: FamosoErc20.abi,
        FamosoRouter: FamosoRouter.abi,
        FamosoFactory: FamosoFactory.abi,
        FamosoPair: FamosoPair.abi,
        FBlist: FBlist.abi,
        SwapCifiMetalands: SwapCifiMetalands.abi,
        FamosoStaking: FamosoStaking.abi,
        CifiStaking: CifiStaking.abi
    },
    address: addresses[net_state]
}

export const contractAddress = addresses

export default contract
