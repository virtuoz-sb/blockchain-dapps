import commonAbis from '@common/abi/common';
import farmAbis from '@common/abi/farm';
import horsePartnershipAbis from '@common/abi/horsePartnership';
import marketplaceAbis from '@common/abi/marketplace';
import skyfallsAbis from '@common/abi/skyfalls';
import { ContractTypeEnum } from '@hooks/useContractAddressStore';

export const getAbi = (contractType: ContractTypeEnum) => {
  let returnAbi = null;

  switch (contractType) {
    case ContractTypeEnum.APIConsumerFarm:
      break;

    case ContractTypeEnum.Avatar:
      break;

    case ContractTypeEnum.Common:
      returnAbi = commonAbis;
      break;

    case ContractTypeEnum.Farm:
      returnAbi = farmAbis;
      break;

    case ContractTypeEnum.Horse:
      break;

    case ContractTypeEnum.HorseGovernance:
      break;

    case ContractTypeEnum.HorsePartnership:
      returnAbi = horsePartnershipAbis;
      break;

    case ContractTypeEnum.HorsePass:
      break;

    case ContractTypeEnum.Index:
      returnAbi = indexAbis;
      break;

    case ContractTypeEnum.Land:
      break;

    case ContractTypeEnum.LienedFarm:
      break;

    case ContractTypeEnum.Marketplace:
      returnAbi = marketplaceAbis;
      break;

    case ContractTypeEnum.SkyFalls:
      returnAbi = skyfallsAbis;
      break;

    default:
      returnAbi = farmAbis;
      break;
  }

  return returnAbi;
};

export const indexAbis = {
  addressCount: [
    {
      inputs: [],
      name: 'addressCount',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  getAddress: [
    {
      inputs: [
        {
          internalType: 'string',
          name: 'name',
          type: 'string',
        },
      ],
      name: 'getAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  getAllContracts: [
    {
      inputs: [],
      name: 'getAllContracts',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],

  SilksContractsIndextoName: [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'indexNumber',
          type: 'uint256',
        },
      ],
      name: 'SilksContractsIndextoName',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ],
};
