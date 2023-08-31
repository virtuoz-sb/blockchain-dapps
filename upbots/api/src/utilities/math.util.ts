export const roundDecimal = (n: number, decimal = 4) => {
  // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
  // decimal rounding in JS is problematic : https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
  // converting to scientific notation avoid certain rounding errors in js
  const exponent1 = `e${decimal.toFixed(0)}`;
  const exponent2 = `e-${decimal.toFixed(0)}`;
  return Number(Math.round(parseFloat(n + exponent1)) + exponent2);
  // Number(Math.round(1.005+'e2')+'e-2')
};

export const integer4Precision = (n: number) => {
  const exponent1 = "e4";
  return Math.round(parseFloat(n + exponent1));
};
