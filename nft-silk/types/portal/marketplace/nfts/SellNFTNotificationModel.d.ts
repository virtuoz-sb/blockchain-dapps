interface ISellNFTNotificationModel {
  userRegistrationId: Number;
  contractName: string;
  tokenId: string;
  tokenName: string;
  tokenPrice: string;
  coinType: CoinTypeEnum;
  tokenImageThumbnailUrl: string;
  tokenMarketplacePartialUrl: string;
}
