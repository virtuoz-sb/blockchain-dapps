interface ILandNFTsVWEntityModel {
  tokenId: number;
  imageURL: string;
  xCoordinate: number;
  yCoordinate: number;
  nftOwnerWalletAddress: string;
  isForSale: boolean;
  priceInETH: number;
  marketPlaceItemId: number | null;
}
