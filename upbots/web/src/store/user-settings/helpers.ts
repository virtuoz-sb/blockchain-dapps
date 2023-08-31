export const saveFavourites = (pairs: string[]) => {
  localStorage.setItem("favouritePairs", JSON.stringify(pairs));
};

export const loadFavourites = () => {
  const favourites = localStorage.getItem("favouritePairs");

  return favourites ? JSON.parse(favourites) : [];
};
