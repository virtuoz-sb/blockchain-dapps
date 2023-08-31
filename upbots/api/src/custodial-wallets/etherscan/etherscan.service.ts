import { HttpService, Injectable, Logger } from "@nestjs/common";
import { toWei } from "web3-utils";

@Injectable()
export default class EtherscanService {
  private readonly logger = new Logger(EtherscanService.name);

  constructor(private http: HttpService) {}

  async getGasPrice() {
    try {
      const params = {
        module: "gastracker",
        action: "gasoracle",
      };
      const res = await this.http.get("", { params }).toPromise();
      const { ProposeGasPrice } = res.data.result;

      this.logger.log(`Fetched Ethereum new gas price: ${ProposeGasPrice}`);

      return toWei(ProposeGasPrice, "gwei");
    } catch (e) {
      this.logger.error(e);
      throw new Error("Failed to fetch new Ethereum gas price");
    }
  }

  async confTime(gas: number): Promise<number | null> {
    if (gas === 0) return 0;
    try {
      const params = {
        module: "gastracker",
        action: "gasestimate",
        gasprice: gas,
      };
      const res = await this.http.get("", { params }).toPromise();
      const time = Number(res.data.result);

      return time;
    } catch (e) {
      return null;
    }
  }
}
