import * as mongoose from "mongoose";
import { SETTINGS_PAGES } from "../../../models/database-collection";

const PageSettingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    comingSoon: {
      type: Boolean,
      required: false,
      default: false,
    },
    path: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true, // auto incremented createdAt updatedAt
    collection: SETTINGS_PAGES,
  }
);

export default PageSettingsSchema;
