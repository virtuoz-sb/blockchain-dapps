interface IHorseSyndicateTab {
  ownerWalletAddress: string;
  owner: string;
  isGovernance: boolean;
  tokenType: string;
  sharesQuantity: number;
}

interface IHorseSyndicateListingTab {
  marketplaceItemId: number;
  priceInETH: number;
  quantity: number;
  expirationTimestamp: number;
  fromOwner: string;
  fromOwnerWalletAddress: string;
}
