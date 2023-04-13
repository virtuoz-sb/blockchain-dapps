interface IGetNFTOwnersResult {
  token_address: string;
  token_id: string;
  amount: string;
  owner_of: string;
  token_hash: string;
  block_number_minted: string;
  block_number: string;
  contract_type: string;
  name: string;
  symbol: string;
  token_uri: string;
  metadata?: any;
  last_token_uri_sync: Date;
  last_metadata_sync: Date;
  minter_address?: any;
}

interface IGetNFTOwners {
  total: number;
  page: number;
  page_size: number;
  cursor?: any;
  result: IGetNFTOwnersResult[];
}
