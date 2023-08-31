import { HttpService, Injectable, Logger } from "@nestjs/common";

@Injectable()
export default class DepositAddressGenerationService {
  private readonly logger = new Logger(DepositAddressGenerationService.name);

  constructor(private http: HttpService) {}

  async generateAddress(userId: string, symbol: string): Promise<any> {
    try {
      const payload = {
        userId,
        symbol,
      };
      const res = await this.http.post("/create_deposit_address", payload).toPromise();
      const { data } = res;

      return data;
    } catch (e) {
      return null;
    }
  }

  async getTransfers(): Promise<any> {
    try {
      const payload = {};
      const res = await this.http.post("/get_transfers", payload).toPromise();
      const { data } = res;

      return data;
    } catch (e) {
      return null;
    }
  }
}
