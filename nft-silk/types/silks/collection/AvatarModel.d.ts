interface ISilksGetAvatarModel {
  pageNumber: number;
  totalPages: number;
  totalItems: number;
  items: ISilksGetAvatarItemModel[];
}

interface ISilksGetAvatarItemModel {
  tokenId: number;
  name: string;
  imageUrl: string;
  imageThumbnail: string;
  traits: ISilksGetAvatarTraitModel[];
}

interface ISilksGetAvatarTraitModel {
  traitType: string;
  name: string;
  value: string;
  rarity: number;
}
