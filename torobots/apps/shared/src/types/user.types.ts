import { Stored } from "."

export enum EUserRole {
  ADMIN = "ADMIN",
  TRADER = "TRADER",
  MONITOR = "MONITOR",
  MAINTAINER = "MAINTAINER",
  LIQUIDATOR = "LIQUIDATOR"
}

export enum EUserStatus {
  TBA = "TBA",
  APPROVED = "APPROVED",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  username: string;
  email: string;
  role: EUserRole;
  status: EUserStatus;
  sessionToken: string;
  online: boolean;
  password?: string;
  totpRequired: boolean;
  twoFactorSecret: string;
  twoFactorTmpSecret: string;
  created?: Date;
  updated?: Date;
}
export type IStoredUser = Stored<IUser>