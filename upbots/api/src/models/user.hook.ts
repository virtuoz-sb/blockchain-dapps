import * as UIDGenerator from "uid-generator";
// tslint:disable-next-line:no-var-requires
// const UIDGenerator: UIDGeneratorConstructor = require("uid-generator"); // this package needs require

const UserEmailCodeGeneration = async () => {
  const gen = new UIDGenerator(256, UIDGenerator.BASE58);
  return gen.generate();
};

export default UserEmailCodeGeneration;
