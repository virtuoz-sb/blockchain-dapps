import { StopLossFormItems } from "@/models/interfaces";

export const stopLossRecap = (form: StopLossFormItems) => {
  if (form.selectedOrderType.value === "market" || form.selectedOrderType.value === "limit") {
    return {
      recapValues: [
        "SL",
        form.selectedOrderType.label,
        form.selectedOrderType.value === "market" ? form.triggerPrice : form.orderPrice,
        `${form.selectedQuantity}%`,
      ],
    };
  }

  if (form.selectedOrderType.value === "trailing" || form.selectedOrderType.value === "trailingPercentage") {
    return {
      recapValues: [
        "TL",
        form.selectedOrderType.value === "trailing" ? form.deviationPrice : `${form.deviationPrice}%`,
        `${form.selectedQuantity}%`,
      ],
    };
  }
};
