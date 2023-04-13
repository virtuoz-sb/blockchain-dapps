interface IBuyNFTNotificationModel {
  sellerWalletAddress: string;
  newOwnerUserRegistrationId: number;
  contractName: string;
  tokenId: string;
  tokenName: string;
  tokenPrice: string;
  coinType: CoinTypeEnum;
  tokenImageThumbnailUrl: string;
  tokenMarketplacePartialUrl: string;
}
