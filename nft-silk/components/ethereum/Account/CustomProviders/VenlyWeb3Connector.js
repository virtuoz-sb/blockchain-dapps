import Moralis from 'moralis';
import Web3 from 'web3';
import { Venly } from '@venly/web3-provider';

class VenlyWeb3Connector extends Moralis.AbstractWeb3Connector {
  type = 'venly';
  account;
  provider;
  chainId;

  async activate() {
    let options = {
      clientId: process.env.NEXT_PUBLIC_VENLY_CLIENT_ID,
      environment: process.env.NEXT_PUBLIC_VENLY_ENVIRONMENT,
      secretType: 'ETHEREUM',
    };

    console.log(options);
    const venlyProvider = await Venly.createProviderEngine(options);

    const web3 = new Web3(venlyProvider);

    const accounts = await web3.eth.getAccounts();
    this.account = accounts[0];
    this.provider = venlyProvider;
    this.chainId = '0x5'; /*process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID_HEX*/

    this.subscribeToEvents(this.provider);

    return {
      provider: this.provider,
      account: this.account,
      chainId: this.chainId,
    };
  }

  async deactivate() {
    this.unsubscribeToEvents(this.provider);
    this.account = null;
    this.provider = null;
  }
}

export default VenlyWeb3Connector;
