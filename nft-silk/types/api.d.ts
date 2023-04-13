interface IApiList {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  indexFrom: number;
  items: any[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface IProfile {
  dynastyName?: string;
  userRegistrationId: Number;
  username: string;
  email: string;
  location: string;
  walletAddress: string;
  notifications: INotification[];
  about: string;
  isEmailVerified: boolean;
  settings?: ISettings;
  defaultProfileAvatarTokenId?: number;
}

interface IUserStatus {
  walletAddress: string;
  username: string;
  email: string;
  userRegistrationId: Number;
  isActive?: boolean;
}

interface ISettings {
  horseWinningEmail: boolean;
  horseWinningSMS: boolean;
  marketplaceEmail: boolean;
  marketplaceSMS: boolean;
}

interface INotificationMessage {
  userNotificationId?: number;
  title: string;
  message: string;
}

interface IUserTransaction {
  userTransactionId?: number;
  walletAddress: string;
  contractAddress: string;
  functionName: string;
  tokenId?: number;
  createAt: Date;
  isActive: boolean;
}

interface INotification {
  date: string;
  message: string;
  title: string;
  isRead: boolean;
  isDeleted: boolean;
  notification: {
    date: Date;
    title: string;
    message: string;
  };
  userNotificationId?: number;
}

interface IAppNotification {
  date: Date;
  title: string;
  message: string;
  read: boolean;
  userNotificationId?: number;
}

interface INFTBase {
  tokenOwnersWalletAddressList: string[];
  tokenId: number;
  name: string;
  image?: string;
  imageThumbnail?: string;
  quantityForSale?: number;
  marketplaceItemId?: number;
  price: number?;
  isForSale: boolean;
  isOwned?: boolean;
  properties: IProperties[];
  collectionType: ContractTypeEnum;
  collectionName?: string;
  isSyndicateRulesMet?: boolean;
  isReconstituteRulesMet?: boolean;
  hasMultipleShares: boolean;
  availableQuantityToMakeAnOffer?: number;
  availableQuantityToAcceptAnOffer: number;
  availableQuantityToSell?: number;
}

interface IAvatar extends INFTBase {
  posedAvatar: string;
  glbAvatar: string;
  glbHorse: string;
  avatarIframe: string;
  horseIframe: string;
  crest: string;
}

interface IHorse extends INFTBase {
  isFractionalized: boolean;
  governanceData?: ISyndicateEntityModel;
  partnershipData?: IPartnershipDataModel;
  syndicateTab?: IHorseSyndicateTab[];
  syndicateListingTab?: IHorseSyndicateListingTab[];
  farmName?: string;
  farmLink?: string;
  iframeUrl?: string;
}

interface ILand extends INFTBase {
  type: string;
  coords: ICoordinateModel;
}

interface IFarm extends ILand {
  isPublic: boolean;
  totalLandPieces?: number;
  addressInformation?: any;
  landCoordinates?: ICoordinateModel[];
}

interface IProperties {
  name: string;
  type: string;
  value: string;
  rarity?: number;
  trait_type?: string;
}

interface IOffer extends IGetTokenOffersByCollectionTypeResponseModel {
  priceInUSD?: number;
  currentExpirationTime?: string;
  floorDifference?: string;
  isAcceptButtonEnabled?: boolean;
  isDeclineButtonEnabled?: boolean;
}

interface IStakedHorse {
  id: number;
  horsetokenID?: number | string;
  stall: string;
  name: string;
  price: string;
  usdPrice: string;
  damName: string;
}

interface IStableRequest {
  id: number;
  horseID: number;
  horseName: string;
  farmID: string;
  requester: string;
  stableTerm: Date;
}

interface IAdminProfile {
  username?: string;
  adminId?: number;
  email: string;
  role: string;
  status: string;
}

interface IAdminAttributes {
  family_name?: string;
  given_name?: string;
  email: string;
  email_verified: boolean;
  sub?: string;
}

interface IAdminUser {
  username?: string; //id
  role?: string;
  groups?: ('silks-support' | 'silks-admins')[];
  status?: string;
  attributes: IAdminAttributes;
}
