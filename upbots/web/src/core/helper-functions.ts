export const cloneDeep = (value: any) => JSON.parse(JSON.stringify(value));

export const maxFloatCharacters: (value: number | any, max: number) => number = (value: number | any, max: number) => {
  const floatValue = value.toString().split(".")[1];
  if (floatValue && floatValue.length > max) {
    return Number(Number(value).toFixed(max));
  }
  return Number(value);
};

export const precisionCalculator = (value: string | number) => {
  const [_, b] = value.toString().split(".");
  return b ? b.length : 0;
};

export const emptySvgTemplate = (width: any, height: any) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`;
};
