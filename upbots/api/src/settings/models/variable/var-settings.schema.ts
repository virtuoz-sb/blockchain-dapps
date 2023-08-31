import * as mongoose from "mongoose";
import { SETTINGS_VARS } from "../../../models/database-collection";

const VarSettingsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: String,
    },
  },
  {
    timestamps: true, // auto incremented createdAt updatedAt
    collection: SETTINGS_VARS,
  }
);

export default VarSettingsSchema;
