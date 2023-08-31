import { Document } from "mongoose";
import PageSettings from "./page-settings";

export default class PageSettingsModel extends Document implements PageSettings {
  /**
   * Unique identifier
   */
  name: string;

  path: string;

  comingSoon: boolean;
}
