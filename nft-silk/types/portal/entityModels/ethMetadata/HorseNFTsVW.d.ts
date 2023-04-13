interface IHorseNFTsVWEntityModel {
  tokenId: number;
  yearlingId: number;
  imageURL: string;
  name: string;
  sex: string;
  foalDate: string;
  foalDate2: string;
  color: string;
  colorAlias: string;
  sireName: string;
  damName: string;
  damSireName: string;
  nftOwnerWalletAddress: string;
  isForSale: boolean;
  priceInETH: number;
  marketPlaceItemId: number | null;
  farmtokenID: number;
  isStabled: boolean;
  isFractionalized: boolean;
}
