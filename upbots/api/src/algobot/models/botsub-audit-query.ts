export default interface BotSubAuditQueryArg {
  page: number;
  /** number of items per page */
  pageSize: number;

  userId?: string;
  email?: string;
  botId?: string;
  signalId?: string;
}
