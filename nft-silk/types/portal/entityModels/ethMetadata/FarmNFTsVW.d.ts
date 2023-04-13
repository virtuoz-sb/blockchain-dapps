interface IFarmNFTsVWEntityModel {
  tokenId: number;
  imageURL: string;
  name: string;
  nftOwnerWalletAddress: string;
  isForSale: boolean;
  priceInETH: number;
  marketPlaceItemId: number | null;
  totalPiecesLand: number;
  isPublic: boolean;
}
