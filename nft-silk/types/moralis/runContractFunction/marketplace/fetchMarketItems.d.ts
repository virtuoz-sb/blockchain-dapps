interface IFetchMarketItemsApiResponse {
  /** ItemId of this item in the marketplace (this is not the tokenId) */
  0: string;
  /** NFT contract address */
  1: string;
  /** TokenId of the NFT */
  2: string;
  /** Seller address */
  3: string;
  /** Owner address */
  4: string;
  /** Price value in WEI unit (https://eth-converter.com/) */
  5: string;
  /** If the item is sold, true = sold , false = for sale */
  6: boolean;
}

interface IFetchMarketItems {
  itemId: string;
  nftContract: string;
  tokenId: string;
  seller: string;
  owner: string;
  priceWeiUnit: string;
  sold: boolean;
  quantity: string;
  duration: string;
}
