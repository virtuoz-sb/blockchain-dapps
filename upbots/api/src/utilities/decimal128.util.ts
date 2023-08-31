import { Types } from "mongoose";

export const opposite = (n: Types.Decimal128) => {
  return Types.Decimal128.fromString((-parseFloat(n.toString())).toString());
};

export const add = (values: Types.Decimal128[]) => {
  let sum = Types.Decimal128.fromString("0");
  values.map((value) => {
    sum = Types.Decimal128.fromString((parseFloat(sum.toString()) + parseFloat(value.toString())).toString());
    return sum;
  });
  return sum;
};

export const sub = (n: Types.Decimal128, m: Types.Decimal128) => {
  return Types.Decimal128.fromString((parseFloat(n.toString()) - parseFloat(m.toString())).toString());
};

export const getFloat = (n: Types.Decimal128) => {
  return parseFloat(n.toString());
};

export const getDecimal128 = (n: number) => {
  return Types.Decimal128.fromString(n.toString());
};
