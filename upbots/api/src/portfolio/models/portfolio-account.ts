import ExchangeCredentials from "./exchange-credentials";

export default class CredentialInfo {
  id: string;

  userId: string;

  exchangeName: string;

  keyName: string;

  valid: boolean;

  lastHealthCheck: Date;

  error: string;

  credentials: ExchangeCredentials;
}
