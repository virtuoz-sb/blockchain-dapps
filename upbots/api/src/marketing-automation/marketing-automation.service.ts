import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Email } from "node-mailjet";
import * as mailJet from "node-mailjet";
import { User } from "../types/user";
import { MailJetContactProperty, ContactPropertyType } from "./marketing-automation.types";
import MarketingAutomation from "./marketing-automation.model";

@Injectable()
export default class MarketingAutomationService {
  private readonly logger = new Logger(MarketingAutomationService.name);

  private readonly connection: Email.Client = mailJet.connect(process.env.EMAIL_PKEY, process.env.EMAIL_SKEY);

  constructor(
    @InjectModel("MarketingAutomation") private MarketingAutomationModel: Model<MarketingAutomation>,
    @InjectModel("User") private userModel: Model<User>
  ) {}

  // ** GENERATE/UPDATE USER PROPS IN MAILJET AND DB //
  async subscribeToAutomationList(userId: string, email: string, firstname: string): Promise<MailJetContactProperty> {
    const payload = {
      email,
      firstName: firstname,
      emailVerified: false,
      exchangeAdded: ContactPropertyType.NV,
      firstDepositAdded: ContactPropertyType.NV,
      hasActivatedBot: ContactPropertyType.NV,
      hasDisabledBotNoBotYet: ContactPropertyType.NV,
    };

    try {
      // Add user to DB
      const res = await this.MarketingAutomationModel.findOneAndUpdate({ userId }, { ...payload }, { new: true, upsert: true });

      // Add user to automation list
      this.connection.post("contactslist", { version: "v3" }).id("10212159").action("managecontact").request({
        Name: payload.firstName,
        Properties: {},
        Action: "addnoforce",
        Email: payload.email,
      });

      // Update user properties
      this.connection.put("contactdata", { version: "v3" }).id(payload.email).request(this.computeAllPropsMailjet(payload));

      this.logger.log(`User contact added successfully`);
      return res;
    } catch (err) {
      this.logger.error(`User contact added failed: ${err}`);
      return err;
    }
  }

  async updateAutomationPropertyInMailjet(payload: MailJetContactProperty): Promise<any> {
    try {
      const response = await this.connection
        .put("contactdata", { version: "v3" })
        .id(payload.email)
        .request(this.computeAllPropsMailjet(payload));

      this.logger.log(`User property updated successfully in Mailjet`);
      return response;
    } catch (err) {
      this.logger.error(`User property updated failed in Mailjet: ${err}`);
      return err;
    }
  }

  async updateAutomationProperty(user: User, payload: MailJetContactProperty): Promise<boolean> {
    let res = true;
    try {
      await this.MarketingAutomationModel.findOneAndUpdate(
        { userId: user.id },
        { email: user.email, firstName: user.firstname, ...payload },
        { new: true, upsert: true }
      );

      await this.updateAutomationPropertyInMailjet({ email: user.email, firstName: user.firstname, ...payload });
      this.logger.log(`User property updated successfully`);
    } catch (err) {
      res = false;
      this.logger.error(`User property updated failed: ${err}`);
    }
    return res;
  }

  // ** GET USER AND USER AUTOMATION PROPERTIES FROM DB ** //
  async getAutomationProperty(userId: string): Promise<MailJetContactProperty> {
    const res = await this.MarketingAutomationModel.findOne({ userId });
    return res;
  }

  async getUserByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async getUserById(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  // ** CALCULATE USER AUTOMATION PROPERTIES ** //
  getExchangeAdded(props: MailJetContactProperty) {
    if (props.emailVerified && props.exchangeAdded !== ContactPropertyType.TRUE) {
      return ContactPropertyType.FALSE;
    }
    return props.exchangeAdded;
  }

  getFirstDeposit(props: MailJetContactProperty) {
    if (props.emailVerified && props.exchangeAdded === ContactPropertyType.TRUE && props.firstDepositAdded !== ContactPropertyType.TRUE) {
      return ContactPropertyType.FALSE;
    }
    return props.firstDepositAdded;
  }

  getHasActivatedBot(props: MailJetContactProperty) {
    if (
      props.emailVerified &&
      props.exchangeAdded === ContactPropertyType.TRUE &&
      props.firstDepositAdded === ContactPropertyType.TRUE &&
      props.hasActivatedBot !== ContactPropertyType.TRUE
    ) {
      return ContactPropertyType.FALSE;
    }
    return props.hasActivatedBot;
  }

  computeAllProps(props: MailJetContactProperty) {
    return {
      exchangeAdded: this.getExchangeAdded(props),
      firstDepositAdded: this.getFirstDeposit(props),
      hasActivatedBot: this.getHasActivatedBot(props),
      hasDisabledBotNoBotYet: props.hasDisabledBotNoBotYet,
    };
  }

  computeAllPropsMailjet(props: MailJetContactProperty) {
    return {
      Data: [
        { Name: "firstname", Value: props.firstName },
        { Name: "exchange_added", Value: props.exchangeAdded },
        { Name: "firstdeposit_added", Value: props.firstDepositAdded },
        { Name: "has_activated_bot", Value: props.hasActivatedBot },
        { Name: "has_disabled_bot_no_bot_yet", Value: props.hasDisabledBotNoBotYet },
      ],
    };
  }

  // ** HANDLE USER AUTOMATION ACTIONS ** //
  async handleUserVerifyEmail(email: string) {
    const user = await this.getUserByEmail(email);
    const contactProperty = await this.getAutomationProperty(user?.id);
    if (contactProperty) {
      contactProperty.emailVerified = true;
      this.updateAutomationProperty(user, this.computeAllProps(contactProperty));
    }
  }

  async handleUserAddExchange(id: string) {
    const user = await this.getUserById(id);
    const contactProperty = await this.getAutomationProperty(user?.id);
    if (contactProperty) {
      contactProperty.exchangeAdded = ContactPropertyType.TRUE;
      this.updateAutomationProperty(user, this.computeAllProps(contactProperty));
    }
  }

  async handleUserAddDeposit(id: string) {
    const user = await this.getUserById(id);
    const contactProperty = await this.getAutomationProperty(user?.id);
    // Only initiate the automation when a user makes the first deposit
    if (contactProperty) {
      if (contactProperty.firstDepositAdded !== ContactPropertyType.TRUE) {
        contactProperty.firstDepositAdded = ContactPropertyType.TRUE;
        this.updateAutomationProperty(user, this.computeAllProps(contactProperty));
      }
    }
  }

  async handleUserActivateBot(id: string) {
    const user = await this.getUserById(id);
    const contactProperty = await this.getAutomationProperty(user?.id);
    if (contactProperty) {
      contactProperty.hasActivatedBot = ContactPropertyType.TRUE;
      contactProperty.hasDisabledBotNoBotYet = ContactPropertyType.FALSE;

      this.updateAutomationProperty(user, this.computeAllProps(contactProperty));
    }
  }

  async handleUserDisableBot(id: string, activeBots: number) {
    const user = await this.getUserById(id);
    const contactProperty = await this.getAutomationProperty(user?.id);

    if (contactProperty) {
      if (activeBots === 0 && contactProperty.hasActivatedBot === ContactPropertyType.TRUE) {
        contactProperty.hasDisabledBotNoBotYet = ContactPropertyType.TRUE;
      }

      this.updateAutomationProperty(user, this.computeAllProps(contactProperty));
    }
  }
}
