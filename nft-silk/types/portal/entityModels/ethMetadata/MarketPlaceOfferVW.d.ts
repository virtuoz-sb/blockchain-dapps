interface IMarketPlaceOfferVWEntityModel {
  marketPlacePriceOffersID: number;
  indexID: number;
  collectionType: string;
  tokenId: number;
  priceInETH: number;
  quantity: number;
  offererWalletAddress: string;
  expirationDateUnix: number;
  expirationDate: Date;
}
