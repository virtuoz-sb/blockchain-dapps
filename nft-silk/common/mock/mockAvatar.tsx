import { ContractTypeEnum } from '@hooks/useContractAddressStore';

export const mockAvatar: IAvatar = {
  tokenOwnersWalletAddressList: ['0x000000000'],
  crest:
    'https://image-proxy.silks.io/eyJidWNrZXQiOiJzaWxrc2dlbiIsImtleSI6InNpbGtzLzAwMDAwMDAwMDAwMC9iYzhjZjgzYmYyNTY5OGY3NDZhODc3NTVkZDVmNTExYWQ3YTgwMjdmL2NyZXN0LnBuZyJ9',
  glbAvatar: 'https://silksgen.s3.us-west-2.amazonaws.com/silks/000000000000/default/image.glb',
  glbHorse: 'https://silksgen.s3.us-west-2.amazonaws.com/silks/000000000000/default/horse.glb',
  avatarIframe: '',
  horseIframe: '',
  imageThumbnail:
    'https://image-proxy.silks.io/eyJidWNrZXQiOiJzaWxrc2dlbiIsImtleSI6InNpbGtzLzAwMDAwMDAwMDAwMC9iYzhjZjgzYmYyNTY5OGY3NDZhODc3NTVkZDVmNTExYWQ3YTgwMjdmL2ltYWdlLnBuZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6NTEyLCJoZWlnaHQiOjUxMiwiZml0IjoiY292ZXIifX19',
  image:
    'https://image-proxy.silks.io/eyJidWNrZXQiOiJzaWxrc2dlbiIsImtleSI6InNpbGtzLzAwMDAwMDAwMDAwMC9iYzhjZjgzYmYyNTY5OGY3NDZhODc3NTVkZDVmNTExYWQ3YTgwMjdmL2ltYWdlLnBuZyJ9',
  name: '#2',
  posedAvatar: 'https://silksgen.s3.us-west-2.amazonaws.com/silks/000000000000/default/posed.png',
  tokenId: 2,
  properties: [
    { name: 'Background', type: 'background', value: 'Silks Orange', rarity: 5.800000000000001 },
    { name: 'Body Pattern', type: 'body_pattern', value: 'Tropical Racing', rarity: 0 },
    { name: 'Collar', type: 'collar', value: 'Mandarin', rarity: 25.7 },
    { name: 'Eyewear', type: 'eyewear', value: 'Vintage', rarity: 22.5 },
    { name: 'Helmet', type: 'helmet', value: 'King', rarity: 0.33 },
    { name: 'Helmet Pattern', type: 'helmet_pattern', value: 'Stripe', rarity: 0 },
    { name: 'Jacket', type: 'jacket', value: 'Racing', rarity: 24.7 },
    { name: 'Primary Color', type: 'primary_color', value: 'Silks Orange', rarity: 5.87 },
    { name: 'Secondary Color', type: 'secondary_color', value: 'Silks Dark Green', rarity: 4.92 },
    { name: 'Sleeve Pattern', type: 'sleeve_pattern', value: 'Multiple Hoops', rarity: 5.3 },
  ],
  price: 1.234,
  collectionType: ContractTypeEnum.Avatar,
  collectionName: 'Genesis Avatar',
  isForSale: false,
  hasMultipleShares: false,
  availableQuantityToAcceptAnOffer: 1,
};
