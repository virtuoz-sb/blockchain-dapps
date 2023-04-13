interface IFarmNftsPropertiesModel {
  value: string;
  max_value: number;
  trait_type: string;
  display_type: string;
}

interface IFarmNftsModel {
  name: string;
  image: string;
  properties: Property[];
  description: string;
  external_url: string;
}

interface ICoordinateModel {
  x: number;
  y: number;
}
