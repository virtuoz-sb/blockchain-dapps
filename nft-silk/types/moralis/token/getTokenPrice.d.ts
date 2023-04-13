interface NativePrice {
  value: string;
  decimals: number;
  name: string;
  symbol: string;
}

interface IGetTokenPrice {
  nativePrice: NativePrice;
  usdPrice: number;
  exchangeAddress: string;
  exchangeName: string;
}
