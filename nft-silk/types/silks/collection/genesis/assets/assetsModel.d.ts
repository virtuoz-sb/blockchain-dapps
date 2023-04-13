interface ITraitModel {
  name: string;
  traitType: string;
  value: string;
  rarity: number;
}

interface IAssetsModel {
  tokenId: number;
  name: string;
  type: string;
  rawImage: string;
  imageUrl: string;
  imageThumbnail: string;
  crest: string;
  glbAvatar: string;
  glbHorse: string;
  avatarIframe: string;
  horseIframe: string;
  posedAvatar: string;
  avatarIframe: string;
  horseIframe: string;
  traits: TraitModel[];
}
