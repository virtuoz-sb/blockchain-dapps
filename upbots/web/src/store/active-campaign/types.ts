import { AxiosError } from "axios";

export interface ActiveCampaignState {
  error: AxiosError;
}
export interface ActiveCampaignUser {
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  tags: string[];
}
