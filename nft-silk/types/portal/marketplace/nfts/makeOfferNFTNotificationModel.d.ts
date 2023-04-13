interface IMakeOfferNFTNotificationModel {
  offerSentFromWalletAddress: string;
  ownersList: string[];
  contractName: string;
  tokenId: number;
  tokenName: string;
  tokenPrice: string;
  coinType: CoinTypeEnum;
  tokenImageThumbnailUrl: string;
  tokenMarketplacePartialUrl: string;
}
