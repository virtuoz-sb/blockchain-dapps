import Vue from "vue";
import moment from "moment";
import { maxFloatCharacters } from "@/core/helper-functions";

const toCurrency = (value: string, currency: string, minimumFractionDigits = 6) => {
  if (typeof value !== "number") {
    return value;
  }
  let formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits,
  });
  return formatter.format(value);
};

const date = (value: string, format = "D/M/YYYY") => {
  return moment(value).format(format);
};

const dateLocal = (value: Date, format = "DD MMM YYYY HH:mm:ss") => {
  return moment.utc(value).local().format(format);
};

const convertNumberValue = (value: number, format = "en-US") => {
  return Number(value.toFixed(2)).toLocaleString(format);
};

const twoDigits = (value: string | number) => {
  if (value.toString().length <= 1) {
    return "0" + value.toString();
  }
  return value.toString();
};

const numberWithCommas = (x: number) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const toProfit = (val: number): string => {
  if (val) {
    return val >= 0 ? `+${val.toFixed(2)} %` : `${val.toFixed(2)} %`;
  }
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const Upper = (string: string) => {
  return string.toUpperCase();
};

const toDefaultFixed = (string: string) => {
  return string ? Number(string).toFixed(4) : "0.0000";
};

const toTwoDecimalDigitFixed = (string: string) => {
  return string ? Number(string).toFixed(2) : "0.00";
};

export const fixedDecimal = (value: string | number | null, to: number = 2, fallbackValue: string | number = "-") => {
  if (value === null || !value) {
    return fallbackValue;
  } else {
    const toReturn = Number(value).toFixed(to);
    return toReturn === "NaN" ? fallbackValue : toReturn;
  }
};

export const truncStringPortion = (value: string, firstCharCount = 4, endCharCount = 4, dotCount = 3) => {
  let convertedStr = "";
  convertedStr += value.substring(0, firstCharCount);
  convertedStr += ".".repeat(dotCount);
  convertedStr += value.substring(value.length - endCharCount, value.length);
  return convertedStr;
};

Vue.filter("date", date);
Vue.filter("dateLocal", dateLocal);
Vue.filter("convertNumberValue", convertNumberValue);
Vue.filter("toProfit", toProfit);
Vue.filter("toCurrency", toCurrency);
Vue.filter("twoDigits", twoDigits);
Vue.filter("numberWithCommas", numberWithCommas);
Vue.filter("capitalize", capitalizeFirstLetter);
Vue.filter("maxFloat", maxFloatCharacters);
Vue.filter("Upper", Upper);
Vue.filter("toDefaultFixed", toDefaultFixed);
Vue.filter("toTwoDecimalDigitFixed", toTwoDecimalDigitFixed);
Vue.filter("fixed", fixedDecimal);
Vue.filter("truncStringPortion", truncStringPortion);
