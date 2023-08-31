import axios from "axios";

export default async (url: string) => {
  const image = await axios.get(url, { responseType: "arraybuffer" });
  const raw = Buffer.from(image.data).toString("base64");
  return {
    mimetype: image.headers["content-type"],
    data: raw,
  };
};
