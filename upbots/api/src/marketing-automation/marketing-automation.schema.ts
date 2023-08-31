import * as mongoose from "mongoose";
import { EMAIL_MARKETING_AUTOMATION_COLLECTION } from "../models/database-collection";
import { ContactPropertyType } from "./marketing-automation.types";

const MarketingAutomationUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
    },
    exchangeAdded: {
      type: ContactPropertyType,
    },
    firstDepositAdded: {
      type: ContactPropertyType,
    },
    hasActivatedBot: {
      type: ContactPropertyType,
    },
    hasDisabledBotNoBotYet: {
      type: ContactPropertyType,
    },
  },
  { collection: EMAIL_MARKETING_AUTOMATION_COLLECTION }
);

export default MarketingAutomationUserSchema;
