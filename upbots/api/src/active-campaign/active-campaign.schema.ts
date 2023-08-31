import * as mongoose from "mongoose";
import { ACTIVE_CAMPAIGN_COLLECTION } from "../models/database-collection";

const ActiveCampaignUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: { type: String },
  },
  { collection: ACTIVE_CAMPAIGN_COLLECTION }
);

export default ActiveCampaignUserSchema;
