import { HttpStatus, INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import * as request from "supertest";
import * as speakeasy from "speakeasy";
import { ConfigModule } from "@nestjs/config";
import { CredentialsDTO, RegisterDTO, TotpTokenDTO } from "../src/auth/auth.dto";
import UserSchema from "../src/models/user.schema";
import AuthModule from "../src/auth/auth.module";
import { USER_COLLECTION } from "../src/models/database-collection";

describe.skip("AUTH one time password", () => {
  const emailUser1 = "totp_USER1@e2e.test";
  const expiredTokenUser1 =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRvdHBAZTJlLnRlc3QiLCJmYWtlIjp0cnVlLCJpYXQiOjE1OTA0ODE3MjEsImV4cCI6MTU5MDQ4NTMyMX0.oKAfIHtutdisXEe7KcXTaaKIe5WXu7vbZy3FPQV-6fo";

  let app: INestApplication;
  const userMod = mongoose.model("users", UserSchema, USER_COLLECTION);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [".env", ".env.dev"],
          isGlobal: true,
        }),
        // USE TEST DATABASE
        MongooseModule.forRoot(process.env.MONGODB_URI_TEST, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        AuthModule,
      ],
    })
      // .overrideProvider(UserService)
      // .useValue(fakeUserService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init(); // app set up
    // DATA clean up
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // console.log(`global beforeall !! (DATA clean up)`);
    await userMod.deleteOne({ email: emailUser1 });
  });

  afterAll(async (done) => {
    // console.log(`afterAll !! (DATA clean up)`);

    // DATA clean up
    await userMod.deleteOne({ email: emailUser1 });
    await mongoose.disconnect(done);
    await app.close(); // app tear down
  });

  describe("when not authenticated", () => {
    const regUser1: RegisterDTO = {
      email: emailUser1,
      firstname: "totp_user1 when not authenticated",
      password: "passssssssqdqsdqsdsword",
      captcha: "ffff",
    };

    // const user1: CredentialsDTO = {
    //   email: emailUser1,
    //   password: "passssssssqdqsdqsdsword"
    // };

    afterEach(() => {
      // console.log(`afterEach 0 delete test user ${emailUser1}`);
      return userMod.deleteOne({ email: emailUser1 });
    });

    it("should register user", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .set("Accept", "application/json")
        .send(regUser1)
        .expect(({ body }) => {
          // userToken = body.access_token;
          expect(body.access_token).toBeDefined();
          expect(body.user.email).toEqual(emailUser1);
          expect(body.user.totpRequired).toBeFalsy(); // default no 2FA set up
          expect(body.user.username).toBeUndefined(); // no username implemented
          expect(body.user.password).toBeUndefined(); // check/avoid security leak
        })
        .expect(HttpStatus.CREATED)
        .then(() => {
          // console.log(`auth/register finally cleanup: delete test user ${curTestEmail}`);
          return userMod.deleteOne({ email: emailUser1 });
        });
    });

    it("/auth/totp-deactivate returns 401 when invalid jwt (not authenticated)", () => {
      const oneTimePassword: any = {
        userToken: "token",
      };
      const fakeJWT = "kjhugyftdrfyguhijokl";
      return request(app.getHttpServer())
        .post("/auth/totp-deactivate")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${fakeJWT}`)
        .send(oneTimePassword)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("/account/user should be UNAUTHORIZED when token expired", () => {
      return request(app.getHttpServer())
        .get("/account/user")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${expiredTokenUser1}`)
        .expect(({ body }) => {
          expect(body.code).toBe(401);
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  }); // end of when not authenticated

  describe("when authenticated (without 2FA)", () => {
    const regUser1: RegisterDTO = {
      email: emailUser1,
      firstname: "totp_user1 when authenticated (without 2FA)",
      password: "passssssssqdqsdqsdsword",
      captcha: "ffff",
    };

    const user1: CredentialsDTO = {
      email: emailUser1,
      password: "passssssssqdqsdqsdsword",
    };
    let authJwt: string;
    beforeEach(() => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .set("Accept", "application/json")
        .send(regUser1)
        .expect(({ body }) => {
          authJwt = body.access_token;
          expect(body.access_token).toBeDefined();
          expect(body.user.email).toEqual(emailUser1);
          expect(body.totpRequired).toBeFalsy();
        })
        .expect(HttpStatus.CREATED);
    });

    afterEach(() => {
      // console.log(`afterEach delete test user ${emailUser1}`);
      return userMod.deleteOne({ email: emailUser1 });
    });

    it("/auth/login returns OK_200 (no 2FA required)", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .set("Accept", "application/json")
        .send(user1)
        .expect(({ body }) => {
          expect(body.access_token).toBeDefined();
          expect(body.user.email).toEqual(emailUser1);
          expect(body.user.totpRequired).toBeFalsy(); // THIS is where it happens
        })
        .expect(HttpStatus.OK);
    });

    it("/auth/totp-deactivate should not deactivate totp if totp has not been verified", () => {
      const totp: any = {
        userToken: "token",
      };
      return request(app.getHttpServer())
        .post("/auth/totp-deactivate")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwt}`)
        .send(totp)
        .expect(({ body }) => {
          expect(body.message).toEqual("totp not activated for this user");
        })
        .expect(HttpStatus.FORBIDDEN);
    });

    it("/auth/totp-secret should return secret (in order to setup OTP client)", () => {
      return request(app.getHttpServer())
        .get("/auth/totp-secret")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwt}`)
        .expect(({ body }) => {
          expect(body.base32).toBeDefined();
          expect(body.otpauth_url).toBeDefined();
        })
        .expect(HttpStatus.OK);
    });

    it("should return false for incorrect token", () => {
      const totp: TotpTokenDTO = {
        userToken: "424224_invalid",
      };
      return request(app.getHttpServer())
        .post("/auth/totp-verify")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwt}`)
        .send(totp)
        .expect(({ body }) => {
          expect(body.message).toEqual("token not valid");
        })
        .expect(HttpStatus.FORBIDDEN);
    });
  }); // end when when authenticated

  describe("when 2FA pre-activated (not confirmed)", () => {
    let dualFASecret: string;
    let authJwtStep1: string;
    const regUser1b: RegisterDTO = {
      email: emailUser1,
      firstname: "totp_user1 when authenticated (without 2FA)",
      password: "passssssssqdqsdqsdsword",
      captcha: "ffff",
    };

    const user1b: CredentialsDTO = {
      email: emailUser1,
      password: "passssssssqdqsdqsdsword",
    };
    beforeEach(() => {
      // console.log("2FA pre-activation..");
      return request(app.getHttpServer())
        .post("/auth/register")
        .set("Accept", "application/json")
        .send(regUser1b)
        .expect(({ body }) => {
          authJwtStep1 = body.access_token; // (NOTE) expect does not work in beforeEach
        })
        .then(() => {
          // enable 2FA (no confirmed yet)
          return request(app.getHttpServer())
            .get("/auth/totp-secret")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${authJwtStep1}`)
            .expect(({ body }) => {
              dualFASecret = body.base32;
              // expect(body.base32).toBeDefined();
            })
            .expect(HttpStatus.OK);
        });
    });

    afterEach(() => {
      // console.log(`afterEach 2 cleanup delete test user ${emailUser1}`);
      return userMod.deleteOne({ email: emailUser1 });
    });

    it("(2FA confirm) should return OK when 2FA code provided", () => {
      const token = speakeasy.totp({
        secret: dualFASecret,
        encoding: "base32",
      });
      const totp: TotpTokenDTO = {
        userToken: token,
      };
      return request(app.getHttpServer())
        .post("/auth/totp-verify")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwtStep1}`)
        .send(totp)
        .expect(({ body }) => {
          expect(body.access_token).toBeDefined();
          expect(body.user.totpRequired).toBeTruthy();
        })
        .expect(HttpStatus.OK);
    });
    it("login should NOT require 2FA when 2FA set up not verified (yet)", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .set("Accept", "application/json")
        .send(user1b)
        .expect(({ body }) => {
          // userTokenwithtotp = body.access_token;
          expect(body.access_token).toBeDefined();
          expect(body.user.email).toEqual(emailUser1);
          expect(body.user.totpRequired).toBeFalsy();
        })
        .expect(HttpStatus.OK);
    });
  }); // end when 2FA pre-activated

  describe("when 2FA activated (and verified) (FLOW C)", () => {
    let twoFASecret2: string; // needed to get a fresh 2FA code
    let authJwtLoginCompleted: string;
    let authJwt2FAStepRequired: string;
    const emailUser2 = "totp_USER2@e2e.test";
    const regUser2: RegisterDTO = {
      email: emailUser2,
      firstname: "totp_user2",
      password: "fake_passw_kjlhgfytdresdtfyguhj",
      captcha: "ddddddddd",
    };
    const user2: CredentialsDTO = {
      email: emailUser2,
      password: "fake_passw_kjlhgfytdresdtfyguhj",
    };

    beforeEach(async () => {
      // console.log("onbeforeeach (FLOW C), 2FA pre-activation (and verification)..");
      let jwtForTestSetup: string;
      await userMod.deleteOne({ email: emailUser2 });

      return request(app.getHttpServer())
        .post("/auth/register")
        .set("Accept", "application/json")
        .send(regUser2)
        .expect(({ body }) => {
          jwtForTestSetup = body.access_token; // (NOTE) expect does not work in beforeEach
        })
        .then(() => {
          // enable 2FA (no confirmed yet)
          return request(app.getHttpServer())
            .get("/auth/totp-secret")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${jwtForTestSetup}`)
            .expect(({ body }) => {
              twoFASecret2 = body.base32;
              // expect(body.base32).toBeDefined();
            });
        })
        .then(() => {
          // console.log("(FLOW C) 2FA activation..");
          return request(app.getHttpServer())
            .post("/auth/totp-verify")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${jwtForTestSetup}`)
            .send({
              userToken: speakeasy.totp({
                secret: twoFASecret2,
                encoding: "base32",
              }),
            })
            .expect(({ body }) => {
              expect(body.access_token).toBeDefined();
              authJwtLoginCompleted = body.access_token;
              // console.log(   `(FLOW C) 2FA activation body.user.totpRequired :${body.user.totpRequired} should be false because just after 2FA activation your are already logged in` );
              // console.log(`(FLOW C) 2FA activation body.access_token:${body.access_token}`);
            });
        })
        .then(() => {
          return request(app.getHttpServer())
            .post("/auth/login")
            .set("Accept", "application/json")
            .send(user2)
            .then(({ body }) => {
              authJwt2FAStepRequired = body.access_token;
            });
          // .expect(HttpStatus.OK);
        });
    });

    afterEach(() => {
      // console.log(`afterEach 3 cleanup delete test user ${emailUser2}`);
      return userMod.deleteOne({ email: emailUser2 });
    });

    it("/auth/login returns 202 (instead of 200) when 2FA is activated aaaaaaa", () => {
      // VERY IMPORTANT TEST
      return request(app.getHttpServer())
        .post("/auth/login")
        .set("Accept", "application/json")
        .send(user2)
        .expect(({ body }) => {
          // userTokenwithtotp = body.access_token;
          expect(body.access_token).toBeDefined();
          expect(body.user.email).toEqual(emailUser2);
          expect(body.user.totpRequired).toBeTruthy(); // THIS is where it happens
        })
        .expect(HttpStatus.ACCEPTED);
    });

    it("/account/user should not required 2FA just after 2FA activatted (user stays logged in)", () => {
      return request(app.getHttpServer())
        .get("/account/user")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwtLoginCompleted}`)
        .expect(({ body }) => {
          // console.log(`response.body:${JSON.stringify(body)}`);
          expect(body.email).toEqual(emailUser2);
          // FIXME: account/user should return user id or not ? expect(body.id).toBeUndefined();
        })
        .expect(HttpStatus.OK);
    });

    it("/account/user access denied after login but 2FA code not provided yet", () => {
      return request(app.getHttpServer())
        .get("/account/user")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwt2FAStepRequired}`)
        .expect(({ body }) => {
          // console.log(`response.body:${JSON.stringify(body)}`);
          // expect(body.email).toEqual(emailUser2);
          expect(body.code).toBe(401);
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("should not return secret if verified and already generated (secret displayed only once)", () => {
      return request(app.getHttpServer())
        .get("/auth/totp-secret")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwtLoginCompleted}`)
        .expect(HttpStatus.UNAUTHORIZED)
        .expect(({ body }) => {
          expect(body.message).toEqual("secret has been already issued and verified");
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it("additional 2FA verify should return a valid (and usable) jwt after valid 2FA has been submitted", () => {
      let fullJWT: string;
      return request(app.getHttpServer())
        .post("/auth/totp-verify")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwtLoginCompleted}`)
        .send({
          userToken: speakeasy.totp({
            secret: twoFASecret2,
            encoding: "base32",
          }),
        })
        .expect(({ body }) => {
          // userTokenaftertotp = body.access_token;
          expect(body.access_token).toBeDefined();
          fullJWT = body.access_token;
          expect(body.user.totpRequired).toBeTruthy();
        })
        .expect(HttpStatus.OK)
        .then(() => {
          // assert fullJWT can be used to get data from the api
          return request(app.getHttpServer())
            .get("/account/user")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${fullJWT}`)
            .expect(({ body }) => {
              expect(body.totpRequired).toBeTruthy();
              expect(body.email).toEqual(emailUser2);
            })
            .expect(HttpStatus.OK);
        });
    });

    it("should get user with jwt from totp verify", () => {
      return request(app.getHttpServer())
        .get("/account/user")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwtLoginCompleted}`)
        .expect(({ body }) => {
          expect(body.totpRequired).toBeTruthy();
          expect(body.email).toEqual(emailUser2);
        })
        .expect(HttpStatus.OK);
    });

    it("/auth/totp-deactivate should deactivate totp and new token can be used direclty to call api", () => {
      let userTokenAfterTotpDeactivation: string;
      return request(app.getHttpServer())
        .post("/auth/totp-deactivate")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${authJwtLoginCompleted}`)
        .send({
          userToken: speakeasy.totp({
            secret: twoFASecret2,
            encoding: "base32",
          }),
        })
        .expect(({ body }) => {
          userTokenAfterTotpDeactivation = body.access_token;
          expect(body.access_token).toBeDefined();
          expect(body.user.email).toEqual(emailUser2);
          expect(body.user.totpRequired).toBeFalsy();
        })
        .expect(HttpStatus.CREATED)
        .then(() => {
          // test new token can be used (without 2FA just disabled)
          return request(app.getHttpServer())
            .get("/account/user")
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${userTokenAfterTotpDeactivation}`)
            .expect(({ body }) => {
              expect(body.totpRequired).toBeFalsy();
              expect(body.email).toEqual(emailUser2);
            })
            .expect(HttpStatus.OK);
        });
    });
  }); // end of when 2FA activated (and verified)
}); // end of main describe
