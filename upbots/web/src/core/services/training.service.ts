import { defaultQueryFilterValues } from "@/models/default-models.ts";
import { cloneDeep } from "@/core/helper-functions";
export const decodeRouteQuery = (existingQueryParams: any, type: any, value: any) => {
  const query = cloneDeep(existingQueryParams);
  if (query[type] && type !== "search") {
    query[type] = stringUniqueValues(query[type], value);
  } else {
    query[type] = value.toString();
  }

  // remove param if it's empty
  if (!query[type]) {
    delete query[type];
  }

  return { ...query };
};

export const encodedRouteQuery = ({ search, ...rest }: any, availableFilters: any) => {
  // Default filters values
  const activeFiltersCopy: any = defaultQueryFilterValues();
  if (Object.keys(rest).length) {
    for (const key in rest) {
      const queryFilters = rest[key].split(",");

      const filters = availableFilters[key].filter((el: any) => {
        return queryFilters.some((e: any) => el._id === e);
      });
      activeFiltersCopy[key] = filters;
    }
    return { ...activeFiltersCopy, search };
  } else {
    return { ...defaultQueryFilterValues(), search };
  }
};

export const stringUniqueValues = (data: any, value: any) => {
  let arrValues = data.split(",");

  if (arrValues.includes(value)) {
    arrValues = arrValues.filter((el: any) => el !== value);
  } else {
    arrValues.push(value);
  }

  return arrValues.join(",");
};
