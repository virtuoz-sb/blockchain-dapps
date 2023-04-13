import { ContractTypeEnum } from '@hooks/useContractAddressStore';
import api from './api';
import { EnvironmentTypeEnum } from './enum/EnvironmentTypeEnum';

export enum MarketplaceUrlTypeEnum {
  horseGovernance = 'governance',
  HorsePartnership = 'partnership',
}

export function getNftMarketplaceDetailRoute(contractType: ContractTypeEnum, id: number, fromPage = 1): string {
  const queryString = fromPage == 1 ? '' : `?p=${fromPage}`;
  switch (contractType) {
    case ContractTypeEnum.Avatar:
      return `/marketplace/avatar/${id}${queryString}`;
    case ContractTypeEnum.Horse:
      return `/marketplace/horse/${id}${queryString}`;
    case ContractTypeEnum.Land:
      return `/marketplace/land/${id}${queryString}`;
    case ContractTypeEnum.Farm:
      return `/marketplace/farm/${id}${queryString}`;
    case ContractTypeEnum.HorseGovernance:
      return `/marketplace/horse/${id}?type=${MarketplaceUrlTypeEnum.horseGovernance}${queryString}`;
    case ContractTypeEnum.HorsePartnership:
      return `/marketplace/horse/${id}?type=${MarketplaceUrlTypeEnum.HorsePartnership}${queryString}`;
    default:
      return '';
  }
}

export function getNftImageThumbnail(contractType: ContractTypeEnum): string {
  switch (contractType) {
    case ContractTypeEnum.Avatar:
      return '/images/avatar-placeholder.jpg';
    case ContractTypeEnum.Horse:
      return '/images/horse-placeholder.jpg';
    case ContractTypeEnum.HorseGovernance:
      return '/images/horse-placeholder.jpg';
    case ContractTypeEnum.HorsePartnership:
      return '/images/horse-placeholder.jpg';
    case ContractTypeEnum.Land:
      return '/images/land-placeholder.jpg';
    case ContractTypeEnum.Farm:
      return '/images/farm-placeholder.jpg';
    default:
      return '/images/avatar-placeholder.jpg';
  }
}

export function getS3EnvironmentPrefix() {
  let s3Url = undefined;
  const environmentPrefix: string = process.env.NEXT_PUBLIC_S3_ENVIRONMENT_PREFIX;

  if (environmentPrefix && environmentPrefix.length > 0 && (environmentPrefix != 'prod')) {
    return `.${environmentPrefix}`;
  } else {
    return '';
  }
}

export async function getNftMetadataFromS3(contractType: ContractTypeEnum, tokenId): Promise<INftMetadataModel> {
  const s3Type = getS3ContractType(contractType);
  const environmentPrefix = getS3EnvironmentPrefix();
  const s3Url = `https://nft${environmentPrefix}.silks.io/metadata/${s3Type}/${tokenId}`;

  const { data: metadata } = await api.get<any>(s3Url);

  if (metadata) {
    return metadata;
  } else {
    return undefined;
  }
}

export function getNftImageFromS3(contractType: ContractTypeEnum, tokenId, isTransparent = false) {
  const s3Type = getS3ContractType(contractType, isTransparent);
  const environmentPrefix = getS3EnvironmentPrefix();

  return `https://nft${environmentPrefix}.silks.io/image/${s3Type}/${tokenId}`;
}

export function getNftImageThumbnailFromS3(contractType: ContractTypeEnum, tokenId) {
  const s3Type = getS3ContractType(contractType);
  const environmentPrefix = getS3EnvironmentPrefix();

  return `https://nft${environmentPrefix}.silks.io/thumbnail/${s3Type}/${tokenId}`;
}

function getS3ContractType(contractType: ContractTypeEnum, isTransparent: boolean = false) {
  if (isTransparent) {
    switch (contractType) {
      case ContractTypeEnum.Horse:
        return 'c1Transparent';
      case ContractTypeEnum.HorseGovernance:
        return 'c1Transparent';
      case ContractTypeEnum.HorsePartnership:
        return 'c1Transparent';
      case ContractTypeEnum.Land:
        return 'c2LandTransparent';
      default:
        return 'Not Implemented';
    }
  }

  switch (contractType) {
    case ContractTypeEnum.Avatar:
      return 'NotImplemented';
    case ContractTypeEnum.Horse:
      return 'c1';
    case ContractTypeEnum.HorseGovernance:
      return 'c5HorseGovernance';
    case ContractTypeEnum.HorsePartnership:
      return 'c4HorsePartnership';
    case ContractTypeEnum.Land:
      return 'c2Land';
    case ContractTypeEnum.Farm:
      return 'c3Farm';
    default:
      return 'collectionNotFound';
  }
}

export function getOpenSeaUrl(contractAddress, tokenId) {
  const defaultChain: string = getOpenSeaDefaultChain();
  const environment: string = process.env.NEXT_PUBLIC_ENVIRONMENT;

  console.log('URL', defaultChain, environment);

  if (environment == EnvironmentTypeEnum.PROD) {
    return `https://opensea.io/assets/${defaultChain}/${contractAddress}/${tokenId}`;
  } else {
    return `https://testnets.opensea.io/assets/${defaultChain}/${contractAddress}/${tokenId}`;
  }
}

function getOpenSeaDefaultChain() {
  const defaultChain: string = process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID;

  switch (defaultChain) {
    case 'goerli':
    case '0x5':
      return 'goerli';
    case 'eth':
    case 'mainnet':
    case '0x1':
      return 'ethereum';
    default:
      return 'ethereum';
  }
}
