import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Email } from "node-mailjet";
import * as mailJet from "node-mailjet";
import * as moment from "moment";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../types/user";
import ComingSoon from "../marketing/dbmodels/comingsoon";
import { TransferDto } from "../perfees/models/user-wallet.model";

@Injectable()
export default class MailService {
  private readonly logger = new Logger(MailService.name);

  private readonly connection: Email.Client = mailJet.connect(process.env.EMAIL_PKEY, process.env.EMAIL_SKEY);

  constructor(@InjectModel("User") private userModel: Model<User>) {}

  // (1) REGISTER CONFIRM EMAIL //
  async sendVerificationEmail(user: User): Promise<string> {
    const params = this.createEmailVerificationParams(user);
    const res = await this.sendEmail(params);
    return res;
  }

  // (2) PASSWORD RESET NOTIFICATION //
  async sendPasswordResetNotif(user: User, userInfo: any): Promise<string> {
    const params = this.createPasswordResetNotifParams(user, userInfo);

    const res = await this.sendEmail(params);
    return res;
  }

  // (3) PASSWORD RESET MANUAL REQUEST //
  async sendResetPassword(user: User): Promise<string> {
    const params = this.createResetPasswordParam(user);

    const res = await this.sendEmail(params);

    return res;
  }

  // (4) 2FA RESET NOTIFICATION //
  async send2faDeactivatedNotif(email: string, firstname: string, userInfo: any, enable: boolean): Promise<string> {
    const params = this.create2FAResetNotifParams(email, firstname, userInfo, enable);

    const res = await this.sendEmail(params);
    return res;
  }

  // (5) 2FA RESET MANUAL REQUEST //
  async sendReset2faCode(user: User, userInfo: any): Promise<string> {
    const params = this.createReset2faCodeParams(user, userInfo);

    const res = await this.sendEmail(params);
    return res;
  }

  // (6) EXCHANGE ADDED NOTIFICATION //
  async sendExchangeAdded(email: string, firstname: string): Promise<string> {
    const params = this.createExchangeAddedParam(email, firstname);

    const res = await this.sendEmail(params);
    return res;
  }

  // (7) ALGOBOT ENABLE/DISABLED NOTIFICATION //
  async sendBotSubscriptionNotification(userId: string, botName: string, enabled: boolean) {
    const user = await this.userModel.findOne({ _id: userId });
    const params = this.createAlgobotNotificationParams(user, botName, enabled);

    const res = await this.sendEmail(params);
    return res;
  }

  // (8) UBXT BALANCE ZERO NOFTIFICATION //
  async sendUbxtBalanceZeroNotification(userId: string) {
    const user = await this.userModel.findOne({ _id: userId });

    if (!user) return null;
    const params = this.createUBXTBalanceZeroParams(user.email, user.firstname);
    const res = await this.sendEmail(params);
    return res;
  }

  // (9) WITHDRAWAL REQUEST NOTIFICATION //
  async sendWithdrawalRequestNotification(user: User, data: TransferDto) {
    const params = this.createWithdrawalRequestParams(user, data);

    const res = await this.sendEmail(params);
    return res;
  }

  // (10) NEW DEPOSIT NOTIFICATION //
  async sendNewDepositNotification(userId: string, amount: number) {
    const user = await this.userModel.findOne({ _id: userId });

    if (!user) return null;
    const params = this.createNewDepositParams(user, amount);
    const res = await this.sendEmail(params);
    return res;
  }

  // (11) RESEND EMAIL VERIFICATION //
  @Cron("0 10 * * *") // Every day at 10.00
  async resendVerificationEmail1D() {
    const yesterday = moment().subtract(1, "day");
    const users = await this.userModel.find((user) => user && user.verification.emailVerified === false);

    if (users.length > 0) {
      users.map(async (user: any) => {
        if (moment(user.created).isSame(yesterday, "day")) {
          const params = this.createResendEmailVerificationParams(user);
          const res = await this.sendEmail(params);
          return res;
        }
        return null;
      });
    }
  }

  // (12) NEW IP DETECTED EMAIL //
  async sendNewIpDetectedEmail(user: User, code: string): Promise<string> {
    const params = this.createNewIpDetectedParams(user, code);
    const res = await this.sendEmail(params);
    return res;
  }

  // ** CREATE PARAMS ** //

  // (1) REGISTER CONFIRM EMAIL //
  private createEmailVerificationParams(user: User): Email.SendParams {
    const verifylink = process.env.EMAIL_VERIFY_LINK + user.verification.code;

    this.logger.debug(`email verification (doSendBool: ${this.getDoSendBool()} for ${user.email}, link: ${verifylink}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.email,
            },
          ],
          TemplateID: Number(process.env.EMAIL_TEMPLATE_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_SUBJECT,
          Variables: {
            verifylink,
            firstname: user.firstname || "",
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (2) PASSWORD RESET NOTIFICATION //
  private createPasswordResetNotifParams(user: User, userInfo: any): Email.SendParams {
    this.logger.debug(`email password reset notification (doSendBool: ${this.getDoSendBool()} for ${user.email}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_RESET_PASSWORD_NOTIF_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_NOTIF_PASSWORD_SUBJECT,
          Variables: {
            firstname: user.firstname || "",
            location: userInfo.location,
            device: userInfo.device,
            ip: userInfo.ip,
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (3) PASSWORD RESET MANUAL REQUEST //
  private createResetPasswordParam(user: User): Email.SendParams {
    const resetlink = process.env.EMAIL_RESET_LINK + user.passwordReset.code;

    this.logger.debug(`email reset password manual request (doSendBool: ${this.getDoSendBool()} for ${user.email}, link: ${resetlink}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_RESET_PASSWORD_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_RESET_PASSWORD_SUBJECT,
          Variables: {
            resetlink,
            firstname: user.firstname || "",
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (4) 2FA RESET NOTIFICATION
  private create2FAResetNotifParams(email: string, firstname: string, userInfo: any, enable: boolean): Email.SendParams {
    this.logger.debug(`email reset 2fa notification (doSendBool: ${this.getDoSendBool()} for ${email}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: email,
              Name: firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_RESET_2FA_NOTIF_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_RESET_2FA_NOTIF_SUBJECT,
          Variables: {
            action: enable ? "enable" : "deactivate",
            firstname: firstname || "",
            location: userInfo.location,
            device: userInfo.device,
            ip: userInfo.ip,
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (5) 2FA RESET MANUAL REQUEST //
  private createReset2faCodeParams(user: User, userInfo: any): Email.SendParams {
    const code = user.reset2faCode;

    this.logger.debug(`email reset 2fa manual request (doSendBool: ${this.getDoSendBool()} for ${user.email}, link: ${code}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_RESET_2FA_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_RESET_2FA_SUBJECT,
          Variables: {
            code,
            firstname: user.firstname || "",
            location: userInfo.location,
            device: userInfo.device,
            ip: userInfo.ip,
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (6) EXCHANGE ADDED NOTIFICATION //
  private createExchangeAddedParam(email: string, firstname: string): Email.SendParams {
    this.logger.debug(`email exhange added notification (doSendBool: ${this.getDoSendBool()} for ${email}`);

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: email,
              Name: firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_EXCHANGE_ADDED_TEMPLATE_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_EXCHANGE_ADDED_SUBJECT,
          Variables: {
            firstname: firstname || "",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (7) ALGOBOT ENABLED/DISABLED NOTIFICATION //
  private createAlgobotNotificationParams(user: User, botName: string, enabled: boolean): Email.SendParams {
    this.logger.debug(
      `email algobot ${enabled ? "enabled" : "disabled"} notification (doSendBool: ${this.getDoSendBool()} for ${user.email}`
    );
    const subject = enabled ? `🤖 Congrats! You've activated ${botName || "a"} bot!` : `🤖 UpBots - You disabled ${botName || "a"} bot`;

    const template = Number(enabled ? process.env.EMAIL_BOT_ENABLED_TEMPLATE_ID : process.env.EMAIL_BOT_DISABLED_TEMPLATE_ID);

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: template,
          TemplateLanguage: true,
          Subject: subject,
          Variables: {
            firstname: user.firstname,
            bot_name: botName || "",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (8) UBXT BALANCE ZERO NOFTIFICATION //
  private createUBXTBalanceZeroParams(email: string, firstname: string): Email.SendParams {
    this.logger.debug(`email ubxt balance zero notification (doSendBool: ${this.getDoSendBool()} for ${email}`);

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: email,
              Name: firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_UBXT_BALANCE_ZERO_TEMPLATE_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_UBXT_BALANCE_ZERO_SUBJECT,
          Variables: {
            firstname,
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (9) WITHDRAWAL REQUEST NOTIFICATION //
  private createWithdrawalRequestParams(user: User, data: TransferDto): Email.SendParams {
    this.logger.debug(`email ubxt withdraw (doSendBool: ${this.getDoSendBool()} for ${user.email}`);

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_UBXT_WITHDRAW_TEMPLATE1_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_UBXT_WITHDRAW_TEMPLATE1_SUBJECT,
          Variables: {
            firstname: user.firstname,
            withdraw_amount: data.amount,
            withdraw_address: data.address,
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (10) NEW DEPOSIT NOTIFICATION //
  private createNewDepositParams(user: User, amount: number): Email.SendParams {
    this.logger.debug(`email new deposit (doSendBool: ${this.getDoSendBool()} for ${user.email}`);

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: Number(process.env.EMAIL_NEW_DEPOSIT_TEMPLATE_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_NEW_DEPOSIT_SUBJECT,
          Variables: {
            deposite_amount: amount,
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (11) RESEND EMAIL VERIFICATION //
  private createResendEmailVerificationParams(user: User): Email.SendParams {
    const verifylink = process.env.EMAIL_VERIFY_LINK + user.verification.code;

    this.logger.debug(`email verification (doSendBool: ${this.getDoSendBool()} for ${user.email}, link: ${verifylink}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.email,
            },
          ],
          TemplateID: Number(process.env.EMAIL_RESEND_VERIFICATION_TEMPLATE_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_RESEND_VERIFICATION_SUBJECT,
          Variables: {
            verifylink,
            firstname: user.firstname,
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // (12) NEW IP DETECTED EMAIL //
  private createNewIpDetectedParams(user: User, code: string): Email.SendParams {
    this.logger.debug(`Email for new IP detection (doSendBool: ${this.getDoSendBool()} for ${user.email}, code: ${code}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.email,
            },
          ],
          TemplateID: Number(process.env.EMAIL_TEMPLATE_ID_NEW_IP_DETECTION ?? 3943536),
          TemplateLanguage: true,
          Subject: "New IP Detected",
          Variables: {
            firstname: user.firstname || "",
            code,
          },
        },
      ],
      SandboxMode: !this.getDoSendBool(),
    };
  }

  // ** SEND EMAIL ** //
  async sendEmail(params: any): Promise<string> {
    const response = await this.connection.post("send", { version: "v3.1" }).request(params);
    const firstemail = response.body.Messages[0];

    if (firstemail) {
      this.logger.log(`email success: MessageHref ${firstemail.To[0].MessageHref}`);
      return firstemail.To[0].MessageUUID;
    }
    return null;
  }

  // ** GET DOSEND ** //
  getDoSendBool() {
    const doSend = process.env.EMAIL_SEND_FOR_REAL;
    const isDoSendFalse = doSend === "false" ? false : doSend;
    const doSendBool = doSend === "true" ? true : isDoSendFalse;
    return doSendBool;
  }

  // ** PREVIOUSLY USED FUNCTIONS ** //
  async sendComingSoonEmail(comingsoon: Partial<ComingSoon>): Promise<string> {
    const params = this.createComingSoonParam(comingsoon);

    const response = await this.connection.post("send", { version: "v3.1" }).request(params);
    const sentemail = response.body.Messages[0];

    if (sentemail) {
      this.logger.log(`email success: MessageHref ${sentemail.To[0].MessageHref}`);
      return sentemail.To[0].MessageUUID;
    }
    return null;
  }

  async sendUbxtWithdrawRequestEmail(user: User, data: any): Promise<string> {
    const params = this.createUbxtWithdrawRequestParams(user, data);
    const response = await this.connection.post("send", { version: "v3.1" }).request(params);
    const sentemail = response.body.Messages[0];

    if (sentemail) {
      this.logger.log(`email success: MessageHref ${sentemail.To[0].MessageHref}`);
      return sentemail.To[0].MessageUUID;
    }
    return null;
  }

  async sendUbxtWithdrawConfirmEmail(user: User, data: any): Promise<string> {
    const params = this.createUbxtWithdrawConfirmParams(user, data);
    const response = await this.connection.post("send", { version: "v3.1" }).request(params);
    const sentemail = response.body.Messages[0];

    if (sentemail) {
      this.logger.log(`email success: MessageHref ${sentemail.To[0].MessageHref}`);
      return sentemail.To[0].MessageUUID;
    }
    return null;
  }

  private createComingSoonParam(comingsoon: Partial<ComingSoon>): Email.SendParams {
    const doSend = process.env.EMAIL_SEND_FOR_REAL;
    const isDoSendFalse = doSend === "false" ? false : doSend;
    const doSendBool = doSend === "true" ? true : isDoSendFalse;
    this.logger.debug(`email coming soon (doSendBool: ${doSendBool} for ${comingsoon.email}, feature: ${comingsoon.feature}`);
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: process.env.EMAIL_COMINGSOON_RECEIVER,
              Name: process.env.EMAIL_COMINGSOON_RECEIVER_NAME,
            },
          ],
          TemplateID: Number(process.env.EMAIL_COMINGSOON_TEMPLATE_ID),
          TemplateLanguage: true,
          Subject: process.env.EMAIL_COMINGSOON_SUBJECT,
          Variables: {
            email: comingsoon.email,
            feature: comingsoon.feature || "",
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !doSendBool,
    };
  }

  private createUbxtWithdrawRequestParams(user: User, data: any): Email.SendParams {
    const doSend = process.env.EMAIL_SEND_FOR_REAL;
    const isDoSendFalse = doSend === "false" ? false : doSend;
    const doSendBool = doSend === "true" ? true : isDoSendFalse;
    this.logger.debug(`email ubxt withdraw (doSendBool: ${doSendBool} for ${user.email}`);
    const companyContractAddress = process.env.EMAIL_COMPANY_CONTACT_ADDRESS
      ? process.env.EMAIL_COMPANY_CONTACT_ADDRESS
      : "contact@upbots.com";
    const companyCooAddress = "angelique.massolo@outlook.com";
    const developerAddress = "alextim1218@gmail.com";
    const emailTemplateID = process.env.EMAIL_UBXT_WITHDRAW_TEMPLATE1_ID ? process.env.EMAIL_UBXT_WITHDRAW_TEMPLATE1_ID : 2996794;
    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: companyContractAddress,
              Name: "Upbots Contacts",
            },
            {
              Email: companyCooAddress,
              Name: "Upbots COO",
            },
            {
              Email: developerAddress,
              Name: "Upbots Developer",
            },
          ],
          TemplateID: Number(emailTemplateID),
          TemplateLanguage: true,
          // TemplateErrorDeliver: true, // not exist in typings?
          // TemplateErrorReporting: { // not exist in typings?
          //   Email: "air-traffic-control@mailjet.com",
          //   Name: "Air traffic control"
          // },
          Subject: `Upbots | Ubxt withdraw request (${process.env.NODE_ENV})`,
          // TextPart: 'Greetings 7 text from Mailjet!',
          // HTMLPart:
          // '<h3>Welcome 7 {{var:firstname:""}} html to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><p></p><p>{{var:verifylink:""}}</p>',
          Variables: {
            withdraw_amount: data.amount,
            withdraw_email: user.email,
            withdraw_address: data.address,
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !doSendBool,
    };
  }

  private createUbxtWithdrawConfirmParams(user: User, data: any): Email.SendParams {
    const doSend = process.env.EMAIL_SEND_FOR_REAL;
    const isDoSendFalse = doSend === "false" ? false : doSend;
    const doSendBool = doSend === "true" ? true : isDoSendFalse;
    this.logger.debug(`email ubxt withdraw (doSendBool: ${doSendBool} for ${user.email}`);
    const emailTemplateID = process.env.EMAIL_UBXT_WITHDRAW_TEMPLATE2_ID ? process.env.EMAIL_UBXT_WITHDRAW_TEMPLATE2_ID : 2994135;

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: user.email,
              Name: user.firstname,
            },
          ],
          TemplateID: Number(emailTemplateID),
          TemplateLanguage: true,
          // TemplateErrorDeliver: true, // not exist in typings?
          // TemplateErrorReporting: { // not exist in typings?
          //   Email: "air-traffic-control@mailjet.com",
          //   Name: "Air traffic control"
          // },
          Subject: `Upbots | Ubxt withdraw confirm (${process.env.NODE_ENV})`,
          // TextPart: 'Greetings 7 text from Mailjet!',
          // HTMLPart:
          // '<h3>Welcome 7 {{var:firstname:""}} html to <a href="https://www.mailjet.com/">Mailjet</a>!</h3><p></p><p>{{var:verifylink:""}}</p>',
          Variables: {
            withdraw_amount: data.amount,
            withdraw_address: data.address,
            env: process.env.NODE_ENV === "production" ? "" : "dev",
          },
        },
      ],
      SandboxMode: !doSendBool,
    };
  }

  private createGeneralEmailParams(email: string, subject: string, body: string): Email.SendParams {
    const doSend = process.env.EMAIL_SEND_FOR_REAL;
    const isDoSendFalse = doSend === "false" ? false : doSend;
    const doSendBool = doSend === "true" ? true : isDoSendFalse;
    this.logger.debug(`email, general (doSendBool: ${doSendBool} for ${email}`);
    const emailTemplateID = process.env.EMAIL_GENERAL_TEMPLATE_ID ? process.env.EMAIL_GENERAL_TEMPLATE_ID : 2994159;

    return {
      Messages: [
        {
          From: {
            Email: process.env.EMAIL_SENDER,
            Name: process.env.EMAIL_SENDER_NAME,
          },
          To: [
            {
              Email: email,
              Name: "",
            },
          ],
          // TemplateID: Number(emailTemplateID),
          // TemplateLanguage: true,
          Subject: `Upbots | ${subject}`,
          TextPart: body,
        },
      ],
      SandboxMode: !doSendBool,
    };
  }

  validateEMail(email: string): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  async sendGeneralEmail(email: string, subject: string, body: string): Promise<string> {
    if (this.validateEMail(email)) {
      const params = this.createGeneralEmailParams(email, subject, body);
      const response = await this.connection.post("send", { version: "v3.1" }).request(params);
      const sentemail = response.body.Messages[0];

      if (sentemail) {
        this.logger.log(`email success: MessageHref ${sentemail.To[0].MessageHref}`);
        return sentemail.To[0].MessageUUID;
      }
    }
    return null;
  }
}
