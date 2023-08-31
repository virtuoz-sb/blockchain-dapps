import { ExecutionContext } from '@nestjs/common';
import { Dictionary } from 'code-config';
import { IUserDocument } from "@torobot/shared"

export interface Client {
  headers: Dictionary<string>;
  user: IUserDocument;
}

export const getClient = <T = Client>(ctx: ExecutionContext): T => {
  switch (ctx.getType()) {
    case 'ws':
      return ctx.switchToWs().getClient().handshake;
    case 'http':
      return ctx.switchToHttp().getRequest();
    default:
      return undefined;
  }
};
