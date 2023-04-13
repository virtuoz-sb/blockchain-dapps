import { ContractTypeEnum } from '@hooks/useContractAddressStore';

export const mockLand: ILand = {
  tokenOwnersWalletAddressList: ['0x000000000'],
  tokenId: 1,
  name: '1 Acre Land',
  type: 'Skyfalls',
  coords: { x: 1, y: -2 },
  image: '/images/sky-falls.png',
  price: 7.7996,
  properties: [],
  collectionType: ContractTypeEnum.Land,
  isForSale: false,
  hasMultipleShares: false,
  availableQuantityToAcceptAnOffer: 1,
};
