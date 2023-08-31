import { Stored, IStoredUser } from "."

export interface IBaseWallet {
  privateKey: string;
  publicKey: string;
}

export interface IWallet extends IBaseWallet {
  name: string;
  owner: string | IStoredUser;
  users: (string | IStoredUser)[];
  created?: Date;
  updated?: Date;
}
export type IStoredWallet = Stored<IWallet>

export interface ICompanyWallet extends IBaseWallet {
  uniqueNum?: number;
  owner: string | IStoredUser;
  cntInUse: number;
  created?: Date;
  updated?: Date;
  deleted?: boolean;
}
export type IStoredCompanyWallet = Stored<ICompanyWallet>
