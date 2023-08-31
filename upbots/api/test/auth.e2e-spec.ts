import { HttpStatus, INestApplication } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import * as mongoose from "mongoose";

import { ConfigModule } from "@nestjs/config";
import { CredentialsDTO, RegisterDTO } from "../src/auth/auth.dto";
import AuthModule from "../src/auth/auth.module";
import UserSchema from "../src/models/user.schema";
import { USER_COLLECTION } from "../src/models/database-collection";

const curTestEmail1 = "username@e2e.test";
const curTestEmail2 = "username2@e2e.test";

describe.skip("AUTH", () => {
  let app: INestApplication;

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
    const userMod = mongoose.model("users", UserSchema, USER_COLLECTION);
    await userMod.deleteOne({ email: curTestEmail1 });
    await userMod.deleteOne({ email: curTestEmail2 });
  });
  afterAll(async (done) => {
    // DATA clean up
    const userMod = mongoose.model("users", UserSchema, USER_COLLECTION);
    await userMod.deleteOne({ email: curTestEmail1 });
    await userMod.deleteOne({ email: curTestEmail2 });
    await mongoose.disconnect(done);
    await app.close(); // app tear down
  });

  const regUser1: RegisterDTO = {
    email: curTestEmail1,
    firstname: "ben",
    password: "password",
    captcha: "dsssddssd",
  };
  const regUser2: RegisterDTO = {
    email: curTestEmail2,
    firstname: "kris",
    password: "password2",
    captcha: "ddsdsdsdsdsd",
  };
  const user: CredentialsDTO = {
    email: curTestEmail1,
    password: "password",
  };

  const user2: CredentialsDTO = {
    email: curTestEmail2,
    password: "password2",
    // seller: true,
  };

  // let sellerToken: string;

  it("should register user", () => {
    return request(app.getHttpServer())
      .post("/auth/register")
      .set("Accept", "application/json")
      .send(regUser1)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.access_token).toBeDefined();
        expect(body.user.email).toEqual(curTestEmail1);
        expect(body.user.username).toBeUndefined(); // no username implemented
        expect(body.user.password).toBeUndefined(); // check/avoid security leak
        expect(body.user.custodialWallets).toEqual({});
      });
  });

  it("should register user2", () => {
    return request(app.getHttpServer())
      .post("/auth/register")
      .set("Accept", "application/json")
      .send(regUser2)
      .expect(HttpStatus.CREATED)
      .expect(({ body }) => {
        expect(body.access_token).toBeDefined();
        expect(body.user.email).toEqual(curTestEmail2);
      });
  });

  it("should reject duplicate registration", () => {
    return request(app.getHttpServer())
      .post("/auth/register")
      .set("Accept", "application/json")
      .send(user)
      .expect(({ body }) => {
        expect(body.message).toEqual("User already exists");
      })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it("should login user", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .set("Accept", "application/json")
      .send(user)
      .expect(({ body }) => {
        // userToken = body.access_token;
        expect(body.access_token).toBeDefined();
        expect(body.user.email).toEqual(curTestEmail1);
      })
      .expect(HttpStatus.OK);
  });

  it("should login user 2", () => {
    return request(app.getHttpServer())
      .post("/auth/login")
      .set("Accept", "application/json")
      .send(user2)
      .expect(({ body }) => {
        // sellerToken = body.access_token;

        expect(body.access_token).toBeDefined();
        expect(body.user.email).toEqual(curTestEmail2);
      });
  });

  // it("should respect seller token", () => {
  //   return request(app.getHttpServer())
  //     .get("/product/mine")
  //     .set("Accept", "application/json")
  //     .set("Authorization", `Bearer ${sellerToken}`)
  //     .expect(200);
  // });
});
