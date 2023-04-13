interface IGetAllWithDynamicFiltersModel {
  pageNumber: number;
  pageSize: number;
  dynamicFilters?: IDynamicFiltersModel[];
  orderByType: number;
  tokenId?: number;
  currentWalletConnected: string;
}

interface IDynamicFiltersModel {
  filterType: string;
  lastActionIsRemove: boolean;
  dbColumnName: string;
  useBooleanValue?: boolean;
  textValue?: string;
  isChecked?: boolean;
  optionValue?: Array<string>;
  valueOfRange1?: number;
  valueOfRange2?: number;
}

interface IGetAllWithDynamicFiltersResponseModel {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  indexFrom: number;
  items: INftItems[];
}

interface INftItems {
  tokenId: string;
  imageURL: string;
  imageThumbnailURL: string;
  isForSale: boolean;
  priceInETH: number;
  marketPlaceItemId?: number;
  nftOwnerWalletAddress: string;
  name: string;
  sharesQuantity?: number;
  isMinted: boolean;
  contractType: string;
}
