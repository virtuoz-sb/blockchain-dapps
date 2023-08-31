import { AlgobotExecutionResult } from "./signal-tracking.dto";

/**
 * represents algobot engine webhook reponse
 * should match OkWebhookReponse (engine)
 */
export interface WebhookResponse {
  success: boolean;
  botId: string;
  position: string;
  signalId: string;
  audit: AlgobotExecutionResult;

  code?: number; // engine error code
  errors?: ValidationErrors;
  message?: string; // "validation error"
  status?: string; // error status
  date?: Date;
}

export interface ValidationErrors {
  apisecret: string[];
  botid: string[];
  position: string[];
}
