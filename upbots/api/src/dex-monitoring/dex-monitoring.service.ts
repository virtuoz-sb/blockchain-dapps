import { HttpService, Injectable, CACHE_MANAGER, Inject, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";

import { plainToClass } from "class-transformer";
import ConversionRateService from "../cryptoprice/conversion-rate.service";
import BalancesDto from "./models/balances.dto";
import { TokenData } from "./models/TokenData.d";
import TransactionsDto from "./models/transactions.dto";

const knownScamAddresses = [
  "0x5558447b06867ffebd87dd63426d61c868c45904",
  "0xb16600c510b0f323dee2cb212924d90e58864421",
  "0x119e2ad8f0c85c6f61afdf0df69693028cdc10be",
  "0x0df62d2cd80591798721ddc93001afe868c367ff",
  "0xb0557906c617f0048a700758606f64b33d0c41a6",
  "0xb8a9704d48c3e3817cc17bc6d350b00d7caaecf6",
  "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
  "0xd22202d23fe7de9e3dbe11a2a88f42f4cb9507cf",
  "0x4e1191fa01bb4ec0dcca114a958bf5c204c285fb",
  "0x5190b01965b6e3d786706fd4a999978626c19880",
  "0xe1b3f4849c8959f53edd3ab932e0f145daf865c1",
  "0xd5e3bf9045cfb1e6ded4b35d1b9c34be16d6eec3",
  "0x8d3ff27d2ad6a9556b7c4f82f4d602d20114bc90",
  "0xd667a84005975eef906e980f200541974a8c9766",
  "0x27b880865395da6cda9c407e5edfcc32184cf429",
  "0xD5E3BF9045Cfb1e6dEd4b35D1B9C34be16D6EEc3",
  "0x556798DD55Db12562A6950EA8339a273539B0495",
  "0x04645027122c9f152011f128c7085449b27cb6D7",
  "0xc1bd7b9ccd8a82d3e555e08dc5fa0c38b23b4ec7",
  "0xab3a556884fc1104cf8d9ce78cfa99c4fa4c9df1",
  "0xD5E3BF9045Cfb1e6dEd4b35D1B9C34be16D6EEc3",
  "0x491b25000d386cd31307580171a510d32d7e64ee",
  "0xef27b9cb67aa93ec3494a60f1ea9380e86175b26",
  "0xbc6675de91e3da8eac51293ecb87c359019621cf",
  "0x556798dd55db12562a6950ea8339a273539b0495",
  "0x17d1285bC68D9085f8e4b86Fc565E452B29dC48F",
  "0x8bd0e87273364ebbe3482efc166f7e0d34d82c25",
  "0x17d1285bC68D9085f8e4b86Fc565E452B29dC48F",
  "0x0D05a204e27E4815F1F5AfDB9D82aa221AA0BdfA",
  "0xAc6A33f4215E5A2c877047a67C9A969fdD7e1fF8",
  "0xac6a33f4215e5a2c877047a67c9a969fdd7e1ff8",
  "0x569B2Cf0B745Ef7fad04E8Ae226251814B3395f9",
  "0x6Ae9701B9c423F40d54556C9a443409D79cE170a",
  "0x04645027122c9f152011f128c7085449b27cb6D7",
  "0x2ba6204c23fbd5698ED90ABC911de263E5f41266",
  "0xAc6a41a0A06b2AaEDAa6187BED974E1Fe6cB21d2",
  "0xBB92B9d18DB99C3695BC820bf2c876D4B1527Fa5",
];

@Injectable()
export default class DexMonitoringService {
  private readonly logger = new Logger(DexMonitoringService.name);

  constructor(
    private readonly httpService: HttpService,
    private rateSvc: ConversionRateService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  private ethChainId = 1;

  private bscChainId = 56;

  private ttlSeconds = 3600; // 1 hour

  private toFixed = (nbr: number): number => parseFloat(nbr.toFixed(5));

  private async getFromCovalent(endpoint: string) {
    try {
      const res = await this.httpService.get(endpoint).toPromise();
      const { data } = res.data;

      return data;
    } catch (err) {
      this.logger.error(JSON.stringify(err, null, err));
      this.logger.warn(`Covalent request failed for endpoint: ${endpoint}`);
      return null;
    }
  }

  private formatTokens(items: any[], address: string, blockchain: "eth" | "bsc", scamCoins: string[]): TokenData[] {
    if (!items) return [];
    return items
      ?.filter(({ quote, contract_address: contractAddress }) => {
        return quote !== 0 && !scamCoins.includes(contractAddress);
      })
      .map((item: any) => {
        return {
          address,
          contractAddress: item.contract_address,
          contractTickerSymbol: item.contract_ticker_symbol,
          contractLogoUrl: item.logo_url,
          balance: this.toFixed(parseFloat(item.balance) / 10 ** item.contract_decimals),
          quote: item.quote,
          blockchain,
        };
      });
  }

  private async getTokensData(addressList: string[]): Promise<TokenData[]> {
    try {
      let scamCoins: string[] = await this.cache.get("scamCoins");
      if (!scamCoins) {
        const cryptoscamData = await this.httpService.get("https://api.cryptoscamdb.org/v1/addresses").toPromise();
        scamCoins = [...Object.keys(cryptoscamData.data.result), ...knownScamAddresses];
        this.cache.set("scamCoins", scamCoins, this.ttlSeconds);
      }

      const data = await Promise.all(
        addressList.map(async (address) => {
          const [ethTokens, bscTokens] = await Promise.all([
            this.getFromCovalent(`/${this.ethChainId}/address/${address}/balances_v2/`),
            this.getFromCovalent(`/${this.bscChainId}/address/${address}/balances_v2/`),
          ]);
          return [
            ...this.formatTokens(ethTokens?.items || [], address, "eth", scamCoins),
            ...this.formatTokens(bscTokens?.items, address, "bsc", scamCoins),
          ];
        })
      );

      return data?.reduce((acc, val) => acc.concat(val), []);
    } catch (e) {
      this.logger.error(e);
      this.logger.warn(`Fetching exchanges data failed for address: ${addressList}`, "DexMonitoringService");

      return [];
    }
  }

  async getAddressBalances(addressList: string[], liveFetch: boolean): Promise<BalancesDto> {
    const cachedAddressBalances = !liveFetch ? await this.cache.get(addressList.join(",")) : false;

    // if we have already saved balances data in cache and livefetch == false
    if (cachedAddressBalances) {
      return cachedAddressBalances;
    }
    const [rates, tokens] = await Promise.all([this.rateSvc.getConversionRates(["USD"]), this.getTokensData(addressList)]);

    const balancesDto = plainToClass(BalancesDto, {
      addressList,
      quoteCurrency: "usd",
      quoteCurrencyConversionRates: {
        btc: rates.USD.BTC,
        eur: rates.USD.EUR,
      },
      tokens: tokens.filter((token) => token.contractTickerSymbol !== "xSUSHI"),
    });
    // no need to wait for the balaces data to be saved.
    this.cache.set<BalancesDto>(addressList.join(","), balancesDto, this.ttlSeconds);
    return balancesDto;
  }

  private formatTransactionsHistoryResponse(data: any): TransactionsDto {
    const items = data?.items.map((item) => ({
      blockSignedAt: item.block_signed_at,
      txHash: item.tx_hash,
      txOffset: item.tx_offset,
      successful: item.successful,
      from: {
        address: item.from_address,
        label: item.from_address_label,
      },
      to: {
        address: item.to_address,
        label: item.to_address_label,
      },
      value: item.value,
      valueQuote: item.value_quote,
      gas: {
        offered: item.gas_offered,
        spent: item.gas_spent,
        price: item.gas_price,
        quote: item.gas_quote,
        quoteRate: item.gas_quote_rate,
      },
    }));

    return {
      address: data.address,
      quoteCurrency: data.quoteCurrency,
      pagination: {
        hasMore: data.pagination.has_more,
        pageNumber: data.pagination.page_number,
        pageSize: data.pagination.page_size,
        totalCount: data.pagination.total_count,
      },
      items,
    };
  }

  async getTransactionsHistory(
    address: string,
    chainId: number,
    asc: boolean,
    pageNumber: number,
    pageSize: number
  ): Promise<TransactionsDto> {
    const data = await this.getFromCovalent(
      `/${chainId}/address/${address}/transactions_v2?block-signed-at-asc=${asc}&no-logs=true&page-number=${pageNumber}&page-size=${pageSize}`
    );

    return this.formatTransactionsHistoryResponse(data);
  }
}
