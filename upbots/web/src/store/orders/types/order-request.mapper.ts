import { EntryDto, TakeProfitDto } from "./create-order-strategy.payload";

export const mapEntries = (data: any[]) => {
  const r = new Array<EntryDto>();
  if (!data && data.length > 0) {
    return r;
  }
  data.forEach((e: any) => {
    r.push({
      isLimit: e.selectedAdaptationsType !== "market",
      isMarket: e.selectedAdaptationsType === "market",
      triggerPrice: parseFloat(e.price),
      price: parseFloat(e.price),
      quantity: parseFloat(e.amount),
    } as EntryDto);
  });
  return r;
};

export const mapTakeProfits = (data: [], totalQuantity: number) => {
  const r = new Array<TakeProfitDto>();
  if (!data && data.length > 0) {
    return r;
  }
  // targetPrice is the trigger price; orderPrice is the price
  //rangeValue is the percentage of total quantity
  data.forEach((tp: any) => {
    r.push({
      // TODO: avoid calculation with floating points as they're never accurate. Use a lib or integers only.
      quantity: (totalQuantity * tp.rangeValue) / 100,
      triggerPrice: tp.targetPrice,
      //   orderPrice:tp.orderPrice
    } as TakeProfitDto);
  });
  return r;
};

export const mapStopLoss = (data: any) => {
  if (data) {
    return data;
  }
  // console.log(`type of SL ${typeof data[0].form.triggerPrice} ${data[0].form.triggerPrice}`);
  return -1;
};
