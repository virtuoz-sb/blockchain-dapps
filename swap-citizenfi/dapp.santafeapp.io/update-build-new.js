import fs from  "fs";
import nacl from "tweetnacl"
import naclUtil from 'tweetnacl-util'
import jQuery from "jquery";
import fetch from "node-fetch";
const filePath = "./package.json";

const david_shared_key = [
  234,
  135,
  72,
  240,
  235,
  68,
  217,
  129,
  2,
  130,
  210,
  195,
  46,
  2,
  86,
  54,
  218,
  215,
  160,
  241,
  131,
  112,
  35,
  112,
  100,
  151,
  152,
  130,
  133,
  131,
  44,
  229
]
const packageJson = JSON.parse(fs.readFileSync(filePath).toString());
packageJson.buildDate = new Date().getTime();

fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2));

const jsonData = {
  buildDate: packageJson.buildDate,
};

const jsonContent = JSON.stringify(jsonData);

fs.writeFile("./public/meta123.json", jsonContent, "utf8", function (error) {
  if (error) {
    console.log("An error occured while saving build date and time to meta.json");
    return console.log(error);
  }

  console.log("Latest build date and time updated in meta.json file");
});

function davidEncrypting(plain_text){

  //David also computes a one time code.
  const one_time_code = nacl.randomBytes(24);

  //Davids message

  //Getting the cipher text
  const cipher_text = nacl.box.after(
      naclUtil.decodeUTF8(plain_text),
      one_time_code,
      david_shared_key 
  );

  //message to be transited.
  const message_in_transit = {cipher_text,one_time_code};

  return message_in_transit;
};

// const Http = new XMLHttpRequest();
// const url='https://jsonplaceholder.typicode.com/posts';
// Http.open("GET", url);
// Http.send();

// Http.onreadystatechange = (e) => {
//   console.log(Http.responseText)
// }

let updateData = {
  updateVersion: "update-citizenfinance-version",
  domain: "https://dapp.santafeapp.io"
}

console.log("davidEncrypting", davidEncrypting("hello"))

// fetch("http://localhost:8075/api/version/updateVersion", {data: JSON.stringify(davidEncrypting(JSON.stringify(updateData)))})
// .then((response) => response.json())
// .then((meta) => {
//   console.log("res data", meta)
// });