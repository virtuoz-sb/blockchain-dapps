import { TargetFormItems } from "@/models/interfaces";

export const targetRecap = (form: TargetFormItems) => {
  if (form.selectedOrderType.value === "market" || form.selectedOrderType.value === "limit") {
    return {
      recapValues: [
        "TP",
        form.selectedOrderType.label,
        form.selectedOrderType.value === "market" ? form.triggerPrice : form.orderPrice,
        `${form.selectedQuantity}%`,
      ],
    };
  }

  if (form.selectedOrderType.value === "price" || form.selectedOrderType.value === "percentagePrice") {
    return {
      recapValues: [
        "TL",
        form.targetPrice,
        form.selectedOrderType.value === "price" ? form.deviationPrice : `${form.deviationPrice}%`,
        `${form.selectedQuantity}%`,
      ],
    };
  }
};
