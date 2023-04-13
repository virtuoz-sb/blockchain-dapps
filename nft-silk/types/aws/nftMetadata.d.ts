interface INftMetadataPropertiesModel {
  value: any;
  trait_type: string;
  display_type: string;
}

interface INftMetadataModel {
  name: string;
  image: string;
  properties: INftMetadataPropertiesModel[];
  description: string;
  animation_url: string;
}
