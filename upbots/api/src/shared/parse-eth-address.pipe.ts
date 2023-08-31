import { HttpException, HttpStatus, Injectable, PipeTransform } from "@nestjs/common";
import Web3 = require("web3");

@Injectable()
export default class ParseEthAdressesPipe implements PipeTransform {
  transform(addresses: string) {
    if (!addresses) {
      throw new HttpException("Empty addresses list", HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const addressList = addresses.split(",");
    addressList.forEach((address) => {
      const isEthAddress = (Web3 as any).utils.isAddress(address);
      const isEns = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(address);
      if (!isEthAddress && !isEns) {
        throw new HttpException("Invalid ETH address", HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });
    return addresses;
  }
}
