import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateQuery } from 'mongoose';
import axios from 'axios';
import { CoinMarketVolumeDto } from '../dto/coinmarketVolume.dto';
import { mongoDB, ICoinMarketVolumeDocument } from "@torobot/shared";

@Injectable()
export class CoinMarketVolumeService {
  constructor() { }
  async create(coin: CoinMarketVolumeDto) {
    const object = await mongoDB.CoinMarketVolumes.create(coin);
    return this.getById(object._id);
  }

  async update(coin: ICoinMarketVolumeDocument, body: UpdateQuery<ICoinMarketVolumeDocument>) {
    await mongoDB.CoinMarketVolumes.findOneAndUpdate({ _id: coin._id }, body);
    return this.getById(coin._id);
  }

  delete(coin: ICoinMarketVolumeDocument) {
    return mongoDB.CoinMarketVolumes.findOneAndDelete({ _id: coin._id });
  }

  async getById(id: string) {
    const doc = await mongoDB.CoinMarketVolumes.populateModel(mongoDB.CoinMarketVolumes.findById(id));
    return doc as ICoinMarketVolumeDocument;
  }

  async validate(id: string): Promise<ICoinMarketVolumeDocument> {
    const doc = await this.getById(id);

    if (!doc) {
      throw new NotFoundException('Coin not found');
    }

    return doc as ICoinMarketVolumeDocument;
  }

  async getAll(tokenId: string) {
    let volumes = await mongoDB.CoinMarketVolumes.find({ token: tokenId });
    // Get current volume
    let curVolume = await mongoDB.CurrentCoinMarketVolumes.find({ token: tokenId }).sort({ 'timestamp': -1 }).limit(1);

    if (curVolume?.length) {
      volumes = volumes.concat(curVolume);
    }
    return volumes;
  }

  async getCoinmarketcapId(symbol: string, network: string, tokenAddress: string) {
    const res = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=${symbol}`,
      {
        headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
      }
    );

    if (res.data.status.error_code === 0) {
      for (const data of res.data.data) {
        if (data.platform?.id === Number(network) && tokenAddress.toLowerCase() === data.platform?.token_address.toLowerCase()) {
          return data.id;
        }
      }
      for (const data of res.data.data) {
        if  (data.platform == null) {
          return data.id;
        }
      }      
    }
    return null;
  }

  async ohlcvLatest(coinmarketcapId: string) {
    const res = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/latest?id=${coinmarketcapId}`,
      {
        headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
      }
    );

    if (res.data.status.error_code === 0) {
      const quote = res.data.data[coinmarketcapId]["quote"];
      return quote["USD"]["volume"];

    } else {
      return null;
    }
  }

  async coinPrice(coinmarketcapId: string) {
    const res = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/ohlcv/latest?id=${coinmarketcapId}`,
      {
        headers: { 'X-CMC_PRO_API_KEY': 'f11d72ac-59ba-4c67-9220-95fababf3e68' }
      }
    );

    if (res.data.status.error_code === 0) {
      const quote = res.data.data[coinmarketcapId]["quote"];
      return quote["USD"]["close"] ? quote["USD"]["close"] : quote["USD"]["open"];
    } else {
      return 0;
    }
  }
}