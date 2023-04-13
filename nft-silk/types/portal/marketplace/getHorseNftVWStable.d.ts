interface IGetHorseNftVWStablePropertyModel {
  type: string;
  value: string;
  name: string;
  rarity: number;
}

interface IPartnershipDataModel {
  imageURL: string;
  isForSale: boolean;
  priceInETH: number;
  marketPlaceItemId: number;
  quantityOfShares: number;
  nftOwnerWalletAddress: string;
}

interface IGetHorseNftVWStableItemModel {
  moreInformation: string;
  posedHorse: string;
  tokenId: number;
  name: string;
  imageThumbnail: string;
  image: string;
  price: number;
  properties: IGetHorseNftVWStablePropertyModel[];
  isStabled: boolean;
  farmTokenId: number;
  farmName: string;
  nftOwnerWalletAddress: string;
  isForSale: boolean;
  marketplaceItemId: number;
  isFractionalized: boolean;
  governanceData: ISyndicateEntityModel;
  partnershipData: IPartnershipDataModel;
  syndicateTab: IHorseSyndicateTab[];
  syndicateListingTab: IHorseSyndicateListingTab[];
}

interface IGetHorseNFTVWItemModel {
  tokenId: number;
  imageURL: string;
  yearlingId: number;
  name: string;
  sex: string;
  foalDate: string;
  foalDate2: string;
  color: string;
  colorAlias: string;
  sireName: string;
  damName: string;
  damSireName: string;
  auctionPrice: number;
  isForSale: boolean;
  priceInETH: number;
  marketPlaceItemId: number;
  nftOwnerWalletAddress: string;
  isMinted: boolean;
  farmtokenID: number;
  isStabled: boolean;
  isFractionalized: boolean;
  auctionHouse: string;
  auctionDate: string;
  hip: string;
  rank: string;
  virtual_Inspection: string;
  more_Information: string;
  areaFoaled: string;
}

interface IGetHorseNftVWStableModel {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  indexFrom: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: IGetHorseNftVWStableItemModel[];
}
