import * as mongoose from "mongoose";
import { COMINGSOON_COLLECTION } from "../../models/database-collection";

const ComingSoonSchema = new mongoose.Schema(
  {
    email: String,
    feature: String,
    logtime: String,
  },
  { collection: COMINGSOON_COLLECTION }
);

// schema validation //implicit cast

export default ComingSoonSchema;
