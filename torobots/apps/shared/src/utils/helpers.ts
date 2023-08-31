import { randomBytes, randomInt } from "crypto";
import { v5 as uuidv5, v4 as uuid } from "uuid";
import { Document } from "mongodb";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { STATUS_ERROR, STATUS_SUCCESS } from "../types/consts";
import { Response } from "../types/defs";

const DEFAULT_NUM_DECIMALS = 18;
const DEFAULT_DESIRED_DECIMALS = 2;
const ADDRESS_SHOW_AMOUNT = 5;

export function unixTimestamp(date: Date) {
  return parseInt(String(date.getTime() / 1000));
}

export function generateId() {
  return uuid();
}

export function shortenAddress(address: string) {
  const length = address.length;
  return address.substr(0, 6) + "..." + address.substr(length - 4, length);
}

export function generateKey(length = 32) {
  return randomBytes(length).toString("hex");
}

export function numberOfSameDigits(num: number, numDigits: number) {
  let numString = "";
  for (let i = 0; i < numDigits; ++i) {
    numString += String(num);
  }
  return parseInt(numString);
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function removeLastLetter(str: string) {
  return str.substring(0, str.length - 1);
}

export function documentsObject<T extends Document>(docs: T[]) {
  const items: { [id: string]: T } = {};
  docs.forEach((doc) => {
    items[doc._id] = doc;
  });
  return items;
}

export function randomString(length = 60) {
  let output = '';

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};

export function formatNumber(
  num: BigNumber,
  numDecimals = DEFAULT_DESIRED_DECIMALS
) {
  return num.toFormat(numDecimals);
}

export function removeCommas(num: string): string {
  return num.replace(/,/g, "");
}

export function shiftedBigNumber(
  num: string | number,
  shiftAmount = DEFAULT_NUM_DECIMALS,
  shiftDirection = "negative"
) {
  let number = new BigNumber(num);
  let shift = shiftDirection === "negative" ? -1 * shiftAmount : shiftAmount;
  return number.shiftedBy(shift);
}

export function smallToBig(
  number: BigNumber,
  numDecimals = DEFAULT_NUM_DECIMALS
): string {
  return number.shiftedBy(numDecimals).toFixed();
}

export function bigToSmall(
  num: string | number,
  numDecimals = DEFAULT_NUM_DECIMALS,
  formatDecimals = DEFAULT_DESIRED_DECIMALS
): string {
  let number = new BigNumber(num);
  return number.shiftedBy(-1 * numDecimals).toFixed(formatDecimals, 1);
}

export function formatDate(date:string | Date){
  let parsed  = typeof date === "string"?new Date(date):date;
  return `${parsed.getMonth()}-${parsed.getDate()}-${parsed.getFullYear()}`
}

export function waitFor(timeout: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(true), timeout);
  });
}

export function isValidEthAddress(address: string) {
  if (address === "") return true;
  return Web3.utils.isAddress(address);
}

export const respond = {
  error: (data: any): Response => {
    return { status: STATUS_ERROR, data };
  },
  success: (data: any): Response => {
    return { status: STATUS_SUCCESS, data };
  },
};