/* eslint-disable dot-notation */
/* eslint-disable func-names */
import * as bcrypt from "bcryptjs";
import * as mongoose from "mongoose";
import { Logger } from "@nestjs/common";
import { AuthProvider, Roles, User } from "../types/user";
// import UIDGeneratorConstructor from "uid-generator";
import UserEmailCodeGeneration from "./user.hook";
import { USER_COLLECTION } from "./database-collection";
// tslint:disable-next-line:no-var-requires
// const UIDGenerator: UIDGeneratorConstructor = require("uid-generator");
// this package needs require
const logger = new Logger("User.schema");

/**
 * User mongoose schema for an upbots User.
 * @see src/types/user.ts
 */
const UserSchema = new mongoose.Schema(
  {
    // username: String,
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 255,
    },
    firstname: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 255,
    },
    lastname: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 255,
    },
    roles: [
      {
        type: String,
        enum: Object.values(Roles),
        required: false,
      },
    ],
    phone: {
      type: String,
      required: false,
      minlength: 6,
      maxlength: 255,
    },
    telegram: {
      type: String,
      required: false,
      minlength: 2,
      maxlength: 255,
    },
    tgChatId: {
      type: String,
      required: false,
    },
    tgChatIdDraft: {
      type: String,
      required: false,
    },
    tgConfirmCode: {
      type: String,
      required: false,
    },
    picture: {
      data: String,
      mimetype: String,
      required: false,
    },
    homeAddress: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    aboutMe: {
      type: String,
      required: false,
      maxlength: 1024,
    },
    city: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false, // pre validation
      select: false,
      minlength: 8,
      maxlength: 255,
    },
    totpRequired: {
      type: Boolean,
      default: false,
      // required: true,
    },
    twoFactorTempSecret: {
      type: String,
      required: false,
      select: false,
    },
    twoFactorSecret: {
      type: String,
      required: false,
      select: false,
    },
    reset2faCode: {
      type: String,
      required: false,
      select: false,
    },
    is2faDisabled: {
      type: Boolean,
      default: false,
    },
    passwordModified: { type: Date, default: Date.now },
    passwordModifiedCount: { type: Number, default: 0 },
    created: { type: Date, default: Date.now },
    verification: {
      emailVerified: {
        type: Boolean,
        default: false,
        // required: true,
      },
      codeExpiration: {
        type: Date,
        default: () => {
          const expiry = new Date();
          expiry.setHours(expiry.getHours() + 1);
          return expiry;
        },
      },
      code: {
        type: String,
        // default: '',
        // required: true,
        // minlength: 15,
        maxlength: 255,
        // default: async () => {
        //   const gen = new UIDGenerator();
        //   const newVerifCode = await gen.generate();
        //   return newVerifCode;
        // },
      },
    },
    passwordReset: {
      required: false,
      codeExpiration: {
        type: Date,
        default: () => {
          const expiry = new Date();
          expiry.setHours(expiry.getMinutes() + 15);
          return expiry;
        },
      },
      code: {
        type: String,
        maxlength: 255,
      },
    },
    custodialWallets: {
      identifier: {
        type: String,
        required: false,
      },
      pincode: {
        type: String,
        required: false,
      },
      ubxtDeposit: {
        type: String,
        required: false,
      },
      ubxtDebt: {
        type: String,
        default: "0",
      },
      withdrawExpiry: {
        type: Date,
      },
      ethAddress: {
        type: String,
        required: false,
      },
      bscAddress: {
        type: String,
        required: false,
      },
    },
    // passwordUpdate: { type: Date, default: Date.now },
    // ubxt staking amout
    ubxtStakingAmount: { type: Number, default: 0 },
    botsAccess: {
      type: Boolean,
      default: false,
    },
    // auth provider
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.LOCAL,
      required: false,
    },
  },
  { collection: USER_COLLECTION }
);

// mongoose middlewares1: hashPasswordIfModified
UserSchema.pre("save", async function (next: mongoose.HookNextFunction) {
  // DO NOT USE ARROW FUNCTION or this pre-hook won't work as arrow functions use lexical scope for 'this'.
  try {
    logger.log("hashPasswordIfModified mongoose pre-hook");
    if (!this.isModified("password")) {
      return next();
    }

    const hashed = await bcrypt.hash(this["password"], 10);

    this["password"] = hashed;
    // this['passwordUpdate'] = Date.now();
    return next();
  } catch (err) {
    return next(err);
  }
});

// mongoose middlewares2 : email verification code generation
UserSchema.pre<User>("save", async function (next: mongoose.HookNextFunction) {
  // DO NOT USE ARROW FUNCTION or this pre-hook won't work as arrow functions use lexical scope for 'this'.
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const that = this;
  try {
    // if (!this.verification.code || this.verification.code.length < 5) {
    if (this.isNew) {
      logger.log("setEmailVerification mongoose pre-hook, new verif code will be generated");

      const newVerifCode = await UserEmailCodeGeneration();
      that.verification.code = newVerifCode;
      that.verification.emailVerified = false;
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

export default UserSchema;
