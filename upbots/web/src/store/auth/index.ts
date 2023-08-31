import { RootState } from "../root.store";
import { ActionTree, GetterTree, MutationTree, Module } from "vuex";
import { AxiosError } from "axios";
import * as speakeasy from "speakeasy";
import $http from "@/core/api.config";
import {
  AuthState,
  UserAuthInfo,
  AuthSuccessResponsePayload,
  AccountPicturePayload,
  RegisterRequestPayload,
  AuthRequestPayload,
  TotpTokenRequestPayload,
  PasswordUpdatePayload,
  ProfilUpdatePayload,
  Roles,
} from "./types";

const namespaced: boolean = true;

// STATE
export const state: AuthState = {
  jwt: null,
  user: null,
  totp: null,
  error: null,
};

// GETTERS
export const getters: GetterTree<AuthState, RootState> = {
  getJwt(state): string | null {
    return state.jwt;
  },

  getUser(state): UserAuthInfo {
    return state.user;
  },

  getError(state): any {
    return state.error;
  },

  getUserIsAuthenticated(state): boolean {
    return !!state && (state.user && state.jwt ? true : false);
  },

  getUserEmailVerified(state): boolean {
    return !!state && state.user && state.user.emailVerified ? true : false;
  },

  is2FAEnabled(state): boolean {
    return !!state && state.user && state.user.totpRequired ? true : false;
  },

  get2FASecret(state): speakeasy.GeneratedSecret {
    return !!state && state.totp && state.totp ? state.totp : null;
  },

  userAvatar({ user }): object {
    return user.picture.data
      ? { type: "img", value: `data:${user.picture.mimetype};base64,${user.picture.data}` }
      : { type: "text", value: user.firstname[0].toUpperCase() };
  },

  isAdminUser(state): boolean {
    let result: boolean = false;
    if (!!state && state.user && state.jwt) {
      state.user.roles.forEach((role: Roles) => {
        if (role.toString() === "ADMIN") {
          result = true;
          return;
        }
      });
    }
    return result;
  },
  isDeveloperUser(state): boolean {
    let result: boolean = false;
    if (!!state && state.user && state.jwt) {
      state.user.roles.forEach((role: Roles) => {
        if (role.toString() === "DEVELOPER") {
          result = true;
          return;
        }
      });
    }
    return result;
  },

  hasWallets(state): boolean {
    return !!(state.user && state.user.custodialWallets.identifier);
  },
};

// MUTATIONS
export const mutations: MutationTree<AuthState> = {
  resendEmail(state: AuthState, payload: UserAuthInfo) {
    state.user.lastSentEmailVerification = new Date();
    // if the resend email has changed the email then we need to invalidate the
    // jwt token as it is not link to the correct email
    if (state.user.email !== payload.email) {
      state.jwt = null;
    }
    state.user = {
      ...state.user,
      lastSentEmailVerification: new Date(),
      email: payload.email,
      emailVerified: payload.emailVerified,
    };
  },

  register(state: AuthState, payload: AuthSuccessResponsePayload) {
    const { user, access_token } = payload;
    state.jwt = access_token;
    let fullname = "";
    if (user.firstname || user.lastname) {
      fullname = user.firstname;
      if (user.lastname) {
        fullname += ` ${user.lastname}`;
      }
    } else {
      fullname = payload.user.email;
    }

    state.user = {
      email: user.email,
      emailVerified: user.emailVerified,
      lastSentEmailVerification: new Date(),
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: fullname,
      telegram: user.telegram,
      phone: user.phone,
      homeAddress: user.homeAddress,
      country: user.country,
      city: user.city,
      aboutMe: user.aboutMe,
      picture: user.picture,
      created: user.created,
      totpRequired: user.totpRequired,
      authProvider: user.authProvider,
    };
  },

  profilePasswordUpdate(state: AuthState, payload: AuthSuccessResponsePayload) {
    state.jwt = null;
  },

  login(state: AuthState, payload: AuthSuccessResponsePayload) {
    const { user, access_token } = payload;
    state.jwt = access_token;
    let fullname = "";
    if (user.firstname || user.lastname) {
      fullname = user.firstname;
      if (user.lastname) {
        fullname += ` ${user.lastname}`;
      }
    } else {
      fullname = user.email;
    }
    state.user = {
      ...state.user,
      email: user.email,
      emailVerified: user.emailVerified,
      firstname: user.firstname,
      lastname: user.lastname,
      fullname: fullname,
      telegram: user.telegram,
      phone: user.phone,
      picture: user.picture,
      created: user.created,
      totpRequired: user.totpRequired,
      roles: user.roles,
      homeAddress: user.homeAddress,
      country: user.country,
      city: user.city,
      aboutMe: user.aboutMe,
    };
  },

  setUserInfo(state: AuthState, payload: any) {
    // console.log("payload: ", payload);
    let fullname = "";
    if (payload.firstname || payload.lastname) {
      fullname = payload.firstname;
      if (payload.lastname) {
        fullname += ` ${payload.lastname}`;
      }
    } else {
      fullname = payload.email;
    }
    state.user = {
      fullname,
      ...state.user,
      ...payload,
    };
  },

  logout(state: AuthState) {
    state.jwt = null;
    state.user = null;
  },

  profilePictureUpdate(state: AuthState, payload: AccountPicturePayload) {
    state.user.picture = payload;
  },

  profileUpdate(state: AuthState, payload: AuthSuccessResponsePayload) {
    state.error = null;
    const { user } = payload;
    let fullname = "";
    if (user.firstname || user.lastname) {
      fullname = user.firstname;
      if (user.lastname) {
        fullname += ` ${user.lastname}`;
      }
    } else {
      fullname = user.email;
    }
    state.user = {
      emailVerified: user.emailVerified ? user.emailVerified : state.user.emailVerified,
      firstname: user.firstname ? user.firstname : state.user.firstname,
      lastname: user.lastname ? user.lastname : state.user.lastname,
      fullname: fullname,
      telegram: user.telegram ? user.telegram : state.user.telegram,
      phone: user.phone ? user.phone : state.user.phone,
      homeAddress: user.homeAddress ? user.homeAddress : state.user.homeAddress,
      country: user.country ? user.country : state.user.country,
      city: user.city ? user.city : state.user.city,
      aboutMe: user.aboutMe ? user.aboutMe : state.user.aboutMe,
      ...state.user,
    };
  },

  profileUpdate__err(state: AuthState, error: AxiosError) {
    state.error = error;
  },

  removeJWT(state: AuthState) {
    state.jwt = null;
  },

  setJWT(state: AuthState, payload: { jwt: string }) {
    state.jwt = payload.jwt;
  },

  deactivate2FA(state: AuthState, payload: AuthSuccessResponsePayload) {
    state.jwt = payload.access_token;
    state.user = {
      ...state.user,
      totpRequired: false,
    };
  },

  verify2FA(state: AuthState, payload: AuthSuccessResponsePayload) {
    state.jwt = payload.access_token;
    state.user = {
      ...state.user,
      totpRequired: true,
    };
  },

  secret2FA(state: AuthState, payload: speakeasy.GeneratedSecret) {
    state.totp = payload;
  },
};

// ACTIONS
export const actions: ActionTree<AuthState, RootState> = {
  resendEmailVerificationAction({ commit }, { email, password }: { email: string; password: string }): any {
    return $http
      .post<{ email: string; password: string }>("/api/auth/resendEmail", { email, password })
      .then((response) => {
        const res = response && response.data;
        commit("resendEmail", res);
      });
  },

  sendVerifyEmailLink({ commit }, payload: { email: string }): any {
    return $http.post<boolean>("/api/auth/send-verify-email-link", payload).then((response) => {
      if (response.data) {
        commit("removeJWT");
      }
    });
  },

  recoverPasswordRequestAction({ commit }, payload: { email: string }): any {
    return $http.post<boolean>("/api/auth/send-recover-link", payload).then((response) => {
      if (response.data) {
        commit("removeJWT");
      }
    });
  },

  resetPasswordAction(
    { commit },
    payload: {
      code: string;
      newPassword: string;
      repeatNewPassword: string;
    }
  ): any {
    return $http.post<boolean>("/api/auth/recover-password", payload).then((response) => {
      if (response.data) {
        commit("removeJWT");
      }
    });
  },

  registerRequestAction({ commit, dispatch }, payload: RegisterRequestPayload): any {
    return $http.post<AuthSuccessResponsePayload>("/api/auth/register", payload).then((response) => {
      const payload = response && response.data;
      commit("register", payload);
      dispatch("getInfoUser");
    });
  },
  loginRequestAction({ commit, dispatch }, payload: AuthRequestPayload): any {
    return $http.post<AuthSuccessResponsePayload>("/api/auth/login", payload).then((response) => {
      const payload = response && response.data;
      commit("login", payload);

      if (response.status === 202) {
        // Handle 2 Factor Authentication
        return { totpAuth: true };
      }
      return response;
    });
  },

  async getInfoUser({ commit }) {
    return $http.get("/api/account/user").then((response: any) => {
      const payload = response && response.data;
      commit("setUserInfo", payload);
    });
  },

  deactivate2FAAction({ commit }, payload: TotpTokenRequestPayload) {
    return $http.post<AuthSuccessResponsePayload>("/api/auth/totp-deactivate", payload).then((response) => {
      const payload = response && response.data;
      commit("deactivate2FA", payload);
    });
  },

  verify2FAAction({ commit }, payload: TotpTokenRequestPayload) {
    return $http.post<AuthSuccessResponsePayload>("/api/auth/totp-verify", payload).then((response) => {
      const payload = response && response.data;
      commit("verify2FA", payload);
    });
  },

  get2FASecretAction({ commit, state }, payload: AuthRequestPayload) {
    $http.get<speakeasy.GeneratedSecret>("/api/auth/totp-secret", null).then((response) => {
      const payload = response && response.data;
      const secretKey = /secretkey/gi;
      const upbotsKey = state && state.user ? "".concat("UpBots(", state.user.email, ")") : "UpBots";
      payload.otpauth_url = "".concat(payload.otpauth_url.replace(secretKey, upbotsKey), "&issuer=upbots.com");
      commit("secret2FA", payload);
    });
  },

  passwordUpdateAction({ commit }, payload: PasswordUpdatePayload) {
    return $http.put<AuthSuccessResponsePayload>("/api/account/password", payload).then((response) => {
      const payload = response && response.data;
      commit("profilePasswordUpdate", payload);
    });
  },

  profileUpdateAction({ commit }, payload: ProfilUpdatePayload) {
    return $http
      .put<AuthSuccessResponsePayload>("/api/account/update", payload)
      .then((res) => {
        const payload = res && res.data;
        commit("profileUpdate", payload);
      })
      .catch((error: AxiosError) => {
        const err = error && error.response && error.response.data;
        commit("profileUpdate__err", err);
      });
  },
};

export const authModule: Module<AuthState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
