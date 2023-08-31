export interface ApiHealthState extends ApiHealth {
  isOn: boolean;
  loading: boolean;
  // date?: Date;
  // error: false;
}

export interface ApiHealth {
  date?: Date;
  error: boolean;
}
