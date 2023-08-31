import { Stored, IStoredUser, ECEXType } from "."

export interface ICexAccount {
  name: string;
  cex: ECEXType,
  apiKey: string;
  apiSecret: string;
  apiPassword?: string;
  owner: string | IStoredUser;
  users: (string | IStoredUser)[];
  created?: Date;
  updated?: Date;
}
export type IStoredCexAccount = Stored<ICexAccount>