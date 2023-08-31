import * as geoipLite from "geoip-lite";

// eslint-disable-next-line import/prefer-default-export
export const createUserIpAddressInfo = (req: any, ipAddress: any) => {
  const ip = ipAddress; // `${JSON.stringify(ipAddress).split(":").pop().trim().slice(0, -1)}` || "";
  const geo = geoipLite.lookup(ip);
  const address = geo ? `${geo.country} ${geo.city}`.trim() : "";
  const device = req?.headers["user-agent"];

  return {
    ip,
    address,
    device,
  };
};
