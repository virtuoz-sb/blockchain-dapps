import { Document } from "mongoose";
import VarSettings from "./var-settings";

export default class VarSettingsModel extends Document implements VarSettings {
  /**
   * Unique identifier
   */
  name: string;

  value: string;
}
