import { Stored } from "."

export interface ICounter {
  sequenceName: string,
  sequenceId: string,
  sequenceValue?: number,
  created?: Date,
  updated?: Date
}

export type IStoredcounter = Stored<ICounter>