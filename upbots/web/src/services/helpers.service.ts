export const formatPrice = (price: number, decimals: number = 2) => {
  if (!price) {
    return "N/A";
  } else if (parseFloat(price.toFixed(decimals)) !== 0) {
    return price.toFixed(decimals);
  } else {
    let i = decimals + 1;
    while (parseFloat(price.toFixed(i)) === 0) i++;
    return price.toFixed(i);
  }
};
