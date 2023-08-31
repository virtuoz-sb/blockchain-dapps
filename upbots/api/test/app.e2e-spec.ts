import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { ConfigModule } from "@nestjs/config";
import { UserIdentity } from "../src/types/user"; // compilier needs reliative path
import AppService from "../src/app.service";
import AppController from "../src/app.controller";
import UserService from "../src/shared/user.service";

// describe("ROOT", () => {
//   it("should ping", () => {
//     return request(app)
//       .get("/")
//       .expect(200)
//       .expect(({ body }) => expect(body.health).toEqual("ok"));
//   });
// });

describe("root", () => {
  let app: INestApplication;
  const fakeUserService = { findUser: () => ({} as UserIdentity) };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [".env", ".env.dev"],
          isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.MONGODB_URI_TEST, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: UserService,
          useValue: fakeUserService,
        },
      ],
    })
      // .overrideProvider(UserService)
      // .useValue(fakeUserService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET api root should ping`, () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect(({ body }) => {
        expect(body.health).toBe("ok");
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
