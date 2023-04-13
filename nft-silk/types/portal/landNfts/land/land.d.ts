interface Property {
  value: string;
  max_value: number;
  trait_type: string;
  display_type: string;
}

interface ILandResponseModel {
  name: string;
  image: string;
  properties: Property[];
  description: string;
  external_url: string;
}
