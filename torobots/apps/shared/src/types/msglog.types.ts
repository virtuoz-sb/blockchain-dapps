import { Stored } from "."

export interface IMsglog {
  msgType?: string;
  msgFrom?: string;
  msgTo?: string;
  msgContent?: string;
  created?: Date;
  updated?: Date;
}
export type IStoredMsglog = Stored<IMsglog>
