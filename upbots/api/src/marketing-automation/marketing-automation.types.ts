export enum ContactPropertyType {
  NV = "N/V",
  TRUE = "TRUE",
  FALSE = "FALSE",
}

export interface MailJetContactProperty {
  email?: string;
  firstName?: string;
  emailVerified?: boolean;
  exchangeAdded?: ContactPropertyType;
  firstDepositAdded?: ContactPropertyType;
  hasActivatedBot?: ContactPropertyType;
  hasDisabledBotNoBotYet?: ContactPropertyType;
}
