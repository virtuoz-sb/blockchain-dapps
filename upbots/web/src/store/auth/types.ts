import * as speakeasy from "speakeasy";
import { AxiosError } from "axios";
export enum Roles {
  ADMIN,
  STAKER,
}

export interface AuthState {
  jwt: string | null;
  user: UserAuthInfo | null;
  totp: speakeasy.GeneratedSecret | null;
  error: AxiosError;
}
export interface UserAuthInfo {
  email: string;
  emailVerified: boolean;
  totpRequired: boolean;
  lastSentEmailVerification: Date;
  firstname: string;
  lastname: string;
  fullname: string;
  telegram: string;
  phone: string;
  homeAddress: string;
  country: string;
  city: string;
  aboutMe: string;
  picture: AccountPicturePayload;
  created: Date;
  roles?: Roles[];
  custodialWallets?: CustodialWallets;
  authProvider: string;
}

export interface CustodialWallets {
  identifier: string;
  pincode: string;
  required?: boolean | null;
  ubxtDeposit: string;
  ethAddress: string;
  bscAddress: string;
}

export interface ProfilUpdatePayload {
  email: string;
  firstname: string;
  password: string;
  lastname?: string;
  telegram?: string;
  phone?: string;
  homeAddress?: string;
  country?: string;
  city?: string;
  aboutMe?: string;
}

export interface AuthRequestPayload {
  email: string;
  password: string;
}
export interface TotpTokenRequestPayload {
  userToken: string;
}
export interface PasswordUpdatePayload extends AuthRequestPayload {
  newPassword: string;
  repeatNewPassword: string;
}

export interface RegisterRequestPayload extends AuthRequestPayload {
  firstname: string;
  captcha: string;
}
export interface AccountPicturePayload {
  data: string;
  mimetype: string;
}

export interface AuthSuccessResponsePayload {
  access_token: string;
  user: UserAuthInfo;
}
