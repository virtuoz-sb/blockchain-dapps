export enum WalletStatuses {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
  LOCKED = "LOCKED",
}

export enum TransferType {
  SET = "SET",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}

export enum TransactionTypes {
  TRANSFER = "TRANSFER",
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  PERFORMANCE_FEE = "PERFORMANCE_FEE",
  MONTHLY_FEE = "MONTHLY_FEE",
  YEARLY_FEE = "YEARLY_FEE",
}

export enum TransactionStatuses {
  PENDING = "PENDING",
  TRANSFERRING = "TRANSFERRING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
}

export enum FeeRecipientType {
  DEVELOPER = "DEVELOPER",
  BURN = "BURN",
  POOL = "POOL",
  RESERVE = "RESERVE",
  GROUP = "GROUP",
}

export enum ReferralTransTypes {
  CREDIT = "CREDIT",
  DEPOSIT = "DEPOSIT",
  PERFORMANCE_FEE = "PERFORMANCE_FEE",
}

export enum PaidSubscriptionStatus {
  PAID_NO_ALLOWED = "PAID_NO_ALLOWED",
  PAID_OK = "PAID_OK",
  PAID_NO_ENOUGH = "PAID_NO_ENOUGH",
  PAID_AVAILABLE = "PAID_AVAILABLE",
}
