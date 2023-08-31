import * as mongoose from "mongoose";
import { USERSETTINGS_COLLECTION } from "../../models/database-collection";

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    favoriteCurrency: {
      value: { type: String, require: false, default: "usd" },
      label: { type: String, require: false, default: "USD" },
    },
    darkMode: { type: Boolean, require: false, default: true },
    algobotFilters: {
      status: {
        value: { type: String, require: false, default: "all" },
        label: { type: String, require: false, default: "All" },
      },
      strategy: {
        value: { type: String, require: false, default: "all" },
        label: { type: String, require: false, default: "All" },
      },
      exchanges: { type: Array, require: false, default: [] },
      pairs: { type: Array, require: false, default: [] },
      sortedByValue: {
        value: { type: String, require: false, default: "performance" },
        label: { type: String, require: false, default: "Total perf %" },
      },
    },
  },
  { collection: USERSETTINGS_COLLECTION }
);

export default UserSettingsSchema;
