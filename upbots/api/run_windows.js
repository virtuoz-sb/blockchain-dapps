/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const rimraf = require("rimraf");
const copyfiles = require("copyfiles");

// const dirMaker = require("mkdir-recursive");
const mkdirp = require('mkdirp')

rimraf.sync("./dist");
console.log(`deleted /dist`);

// const err = dirMaker.mkdirSync("./dist/src/proto/");
// console.log(`dir created err:${err}`);
const made = mkdirp.sync('./dist/src/proto/');
console.log(`made directories, starting with ${made}`);

copyfiles(["./src/proto/**/*.js", "./dist/"], res => {
  console.log(`files copied :${res}`);
  return;
});
