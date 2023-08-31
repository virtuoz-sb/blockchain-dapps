import * as mongoose from "mongoose";
import { LOGIN_TRACKING_COLLECTION } from "../models/database-collection";

const LoginTrackingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: false,
    },
    firstname: {
      type: String,
      required: false,
    },
    login: {
      type: Date,
      required: true,
    },
    pending: {
      type: String,
      required: false,
    },
    success: {
      type: Boolean,
      required: true,
      default: false,
    },
    userAccess: {
      type: Object,
      required: true,
    },
  },
  { collection: LOGIN_TRACKING_COLLECTION }
);

export default LoginTrackingSchema;
