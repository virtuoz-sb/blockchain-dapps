import create from 'zustand';
import createVanilla from 'zustand/vanilla';
import { find, forEach } from 'lodash-es';

import { getAbi } from '@common/abi';

const indexStoreAddress = process.env.NEXT_PUBLIC_CONTRACT_INDEX_ADDRESS;
const defaultChain = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;

interface IContractAddressStore {
  contractPromise: Promise<boolean>;
  contractAddresses: any;
  getContractAddress: Function;
  getContractAddressType: Function;
  setContractAddresses: Function;
  getContractAddresses: Function;
  refreshContractAddresses: boolean;
  setRefreshContractAddresses: Function;
  getAllContractAddresses: Function;
  getAddressCount: Function;
  getIndexToName: Function;
  getAddressFromName: Function;
}

export enum ContractTypeEnum {
  APIConsumerFarm = 'APIConsumerFarm',
  Avatar = 'Avatar',
  Common = 'Common',
  Farm = 'Farm',
  Horse = 'Horse',
  HorseGovernance = 'HorseGovernance',
  HorsePartnership = 'HorsePartnership',
  HorsePass = 'HorsePass',
  Index = 'Index',
  Land = 'Land',
  LienedFarm = 'LienedFarm',
  Marketplace = 'Marketplace',
  SkyFalls = 'SkyFalls',
  MyAssets = 'MyAssets', // is not a real contract, but it's used in marketplace page as one to display the owned nfts
}

const indexPromise = {
  promise: null,
  reject: null,
  resolve: null,
};

indexPromise.promise = new Promise<boolean>((resolve, reject) => {
  indexPromise.reject = reject;
  indexPromise.resolve = resolve;
});

const useContractAddressStore = createVanilla<IContractAddressStore>((set, get) => ({
  contractPromise: get()?.contractPromise || indexPromise.promise,
  contractAddresses: get()?.contractAddresses || {},
  getContractAddress: async (contractType: ContractTypeEnum) => {
    try {
      await get().contractPromise;
      return get().contractAddresses?.[contractType] || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  getContractAddressType: async (contractAddress: string): Promise<ContractTypeEnum> => {
    let prop: ContractTypeEnum = null;

    try {
      await get().contractPromise;

      find(get().contractAddresses, (ca, key) => {
        if (ca === contractAddress) {
          prop = key as ContractTypeEnum;
          return true;
        }

        return false;
      });
    } catch (error) {
      console.error(error);
    }

    return prop;
  },
  setContractAddresses: contractAddresses => {
    set({ contractAddresses });
    indexPromise?.resolve(true);
  },
  getContractAddresses: async Web3API => {
    try {
      const contractAddresses = await get()?.getAllContractAddresses(Web3API);

      set({ contractAddresses });
      indexPromise?.resolve(true);
    } catch (error) {
      console.log(error);
      indexPromise?.reject();
    }
  },
  // stopped using this and moved to web sockets to send contracts from BE instead of having each client call moralis on load
  // useTransactionStore now controls the web socket for getting index contract address
  // still used as a fallback
  getAllContractAddresses: async (Web3API): Promise<object> => {
    try {
      let addressStringList: string = null;
      let addressList = {};

      const options = {
        chain: defaultChain,
        address: indexStoreAddress,
        function_name: 'getAllContracts',
        abi: getAbi(ContractTypeEnum.Index)?.getAllContracts,
      };

      addressStringList = await Web3API.runContractFunction(options);
      addressList = JSON.parse(addressStringList.replaceAll("'", '"'));

      return addressList;
    } catch (error) {
      console.log(error);
      return {};
    }
  },
  refreshContractAddresses: get()?.refreshContractAddresses || false,
  setRefreshContractAddresses: refreshContractAddresses => {
    set({
      refreshContractAddresses,
    });

    // reset after 500ms
    if (refreshContractAddresses) {
      setTimeout(() => {
        get()?.setRefreshContractAddresses(false);
      }, 500);
    }
  },
  getAddressCount: async Web3API => {
    try {
      let addressCount = null;

      const options = {
        chain: defaultChain,
        address: indexStoreAddress,
        function_name: 'addressCount',
        abi: getAbi(ContractTypeEnum.Index)?.addressCount,
      };

      addressCount = await Web3API.runContractFunction(options);
      console.log('1 - Address Count, ', addressCount);

      return addressCount;
    } catch (error) {
      console.log(error);
    }
  },
  getIndexToName: async (Web3API, totalCount) => {
    try {
      let indexNameList = [];

      for (let index = 0; index < totalCount; index++) {
        const options = {
          params: {
            indexNumber: index.toString(),
          },
          chain: defaultChain,
          address: indexStoreAddress,
          function_name: 'SilksContractsIndextoName',
          abi: getAbi(ContractTypeEnum.Index)?.SilksContractsIndextoName,
        };

        const name = Web3API.runContractFunction(options);
        indexNameList.push(name);
      }

      return await Promise.all(indexNameList);
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  getAddressFromName: async (Web3API, contractNamesList: string[] = []) => {
    try {
      let addressFromNameList = [];
      let addressList = {};

      for (const contractName of contractNamesList) {
        const options = {
          params: {
            name: contractName,
          },
          chain: defaultChain,
          address: indexStoreAddress,
          function_name: 'getAddress',
          abi: getAbi(ContractTypeEnum.Index)?.getAddress,
        };

        const contract = Web3API.runContractFunction(options);
        addressFromNameList.push(contract);
      }

      const contractAddresses = await Promise.all(addressFromNameList);

      // match contract address up to name
      forEach(contractAddresses, (address, index) => {
        addressList[contractNamesList[index]] = address;
      });

      return addressList;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
}));

export const vanillaStore = useContractAddressStore;
// @ts-ignore-start
export default create<IAppState>(useContractAddressStore);
// @ts-ignore-end
