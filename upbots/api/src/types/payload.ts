import { Roles } from "./user";

export interface JwtPayload {
  // username: string;
  email: string;
  /**
   * indicates a 2FA step is required (dual factor). If true, it means user is not fully logged in.
   */
  totpRequired?: boolean;
  // seller: boolean;
  iat?: number;
  exp?: number;
  roles: Roles[];
}
