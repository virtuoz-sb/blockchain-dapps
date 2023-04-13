import { utcToZonedTime } from 'date-fns-tz';

export const convertDbDate = dateString => {
  // add Z to indicate it's a UTC time
  return utcToZonedTime(`${dateString}Z`);
};
