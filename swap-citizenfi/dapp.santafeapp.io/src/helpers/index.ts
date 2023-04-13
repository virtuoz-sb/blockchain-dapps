import { parseUnits } from 'ethers/lib/utils'
export enum GAS_PRICE {
  default = '5',
  fast = '6',
  instant = '7',
  testnet = '10',
}

export const GAS_PRICE_GWEI = {
  default: parseUnits(GAS_PRICE.default, 'gwei').toString(),
  fast: parseUnits(GAS_PRICE.fast, 'gwei').toString(),
  instant: parseUnits(GAS_PRICE.instant, 'gwei').toString(),
  testnet: parseUnits(GAS_PRICE.testnet, 'gwei').toString(),
}

//my code on 11/6

export enum SWAP_TYPE {
  EXACT_TOKENS_FOR_TOKENS,
  TOKENS_FOR_EXACT_TOKENS,
  EXACT_ETH_FOR_TOKENS,
  TOKENS_FOR_EXACT_ETH,
  EXACT_TOKENS_FOR_ETH,
  ETH_FOR_EXACT_TOKENS
}
