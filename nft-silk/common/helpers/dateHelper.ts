export const getTimestampInSeconds = (date: Date) => {
  return date.getTime() / 1000;
};

export function padTo2Digits(num: number) {
  return num.toString().padStart(2, '0');
}

export function convertMsToTime(timestampInSeconds: number) {
  let seconds = Math.floor(timestampInSeconds);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;

  if (days > 0) {
    return `${days} days ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours ${minutes} minutes`;
  } else if (minutes > 1) {
    return `${minutes} minutes`;
  } else {
    return `< 1 min`;
  }
}
