import parseIp from "./ip.parser";

describe("ip parser", () => {
  it("should return empty array", () => {
    const forwards = [];
    const remoteIp = null;
    const actual = parseIp(forwards, remoteIp);
    expect(actual).toBeDefined();
    expect(actual).toStrictEqual([]);
  });
  it("should return forward array with single ip", () => {
    const forwards = ["ip1"];
    const remoteIp = null;
    const actual = parseIp(forwards, remoteIp);
    expect(actual).toBeDefined();
    expect(actual).toStrictEqual(["ip1"]);
  });

  it("should return forward array", () => {
    const forwards = ["ip1", "ip2"];
    const remoteIp = null;
    const actual = parseIp(forwards, remoteIp);
    expect(actual).toBeDefined();
    expect(actual).toStrictEqual(["ip1", "ip2"]);
  });

  it("should return forward string", () => {
    const forwards = "ip-simple-string";
    const remoteIp = null;
    const actual = parseIp(forwards, remoteIp);
    expect(actual).toBeDefined();
    expect(actual).toStrictEqual(["ip-simple-string"]);
  });

  it("should return empty array when null and null", () => {
    const forwards = null;
    const remoteIp = null;
    const actual = parseIp(forwards, remoteIp);
    expect(actual).toBeDefined();
    expect(actual).toStrictEqual([]);
  });

  it("should return empty array when null and null", () => {
    const forwards = null;
    const remoteIp = "ip3";
    const actual = parseIp(forwards, remoteIp);
    expect(actual).toBeDefined();
    expect(actual).toStrictEqual(["ip3"]);
  });
});
