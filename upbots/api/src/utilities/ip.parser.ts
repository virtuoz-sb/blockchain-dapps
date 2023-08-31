const parseIp = function parseIp(forwards: string[] | string, remoteIp: string): string[] {
  let r = [];
  try {
    if (forwards && Array.isArray(forwards) && forwards.length > 0) {
      r = forwards;
    } else if (forwards && forwards.length > 0) {
      r.push(forwards); // string version
    } else if (remoteIp) {
      r.push(remoteIp);
    }
    // eslint-disable-next-line no-empty
  } catch {}
  return r;
};

export default parseIp;
