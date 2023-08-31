import { Controller } from "@nestjs/common";
import MarketingAutomationService from "./marketing-automation.service";

@Controller("marketing-automation")
export default class MarketingAutomationController {
  constructor(private marketingAutomationService: MarketingAutomationService) {}
}
