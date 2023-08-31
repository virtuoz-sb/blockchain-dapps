# Authentication Flow

auth/login endpoint check login and password if user exists (`localStrategy`)
then we create a jwt token taht contains an email and `totprequired` , if it was activated, in the payload returned by the `createAuthenticationResponse` function in `auth.Service`
If you have a jwt token that includes `totprequired` you can only call two endpoints
then for guard enpoint needed a jwt token the `jwtStrategy` comes in. It verifies and decodes the token. If the token payload
contains a `totprequired = true` totpexp it will returns a 401 unauthorized. With this token you can only call the auth/totp-verify
endpoint that will return a new jwt token without the `totprequired'

## Login and jwt issuing without 2FA

Auth/Login -> Jwt {email} -> can call all the endpoints

## Login and jwt issuing with 2FA

Auth/Login -> JwtToTp {email, totpRequired} -> can only call /auth/totp-verify and /auth/totp-secret
with JwtToTp call to /auth/totp-verify -> Jwt {email} -> can call all the endpoints

# ubots api

## create env file

mongo connection string requires an `.env` file. See [file sample here](./sample.env).

## install mongo locally using docker

### (option 1) mongo and mongo viewer

- go to docker directory (`cd docker`)
- Run `docker-compose --project-name upbots_local -f docker-compose-db-viewer.yml up -d`
<!-- - Run `docker-compose -f docker-compose-dev-db-viewer.yaml up`. You may see the mongo ui on **http://localhost:8081/**. -->

- Mongo db is exposed on **mongodb://localhost:27017/database**.
- mongo viewer exposed on `http://localhost:8081/`

### (option 2) mongo only

```bash
docker pull mongo
docker run -d -p 27017-27019:27017-27019 --name mongodb mongo
```

to play with the mongo cli

```
bash
docker exec -it mongodb bash
$>mongo
$>use mydb
$>db.people.save({ firstname: "Nic", lastname: "Raboy" })
$>db.people.save({ firstname: "Maria", lastname: "Raboy" })
$>db.people.find({ firstname: "Nic" })
```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository. It uses `tsc` and `ts-node`. However, since october 2019 it can use webpack, too.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
npm run start

# watch mode (prefered way)
npm run start:dev

# production mode
npm run start:prod
```

## Test (using Jest)

- run one test : `npx jest ./test/totp.e2e-spec.ts --config ./test/jest-e2e.json`

```bash
# unit tests
npm run test:unit

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

For end to end tests to work, you need to use a special `.env` key otherwise recaptcha will cause your tests to fail.

### unit test development workflow

During unit testing development, use the `npx jest --watch` command to run your tests while fixing them. You may also run failing test only.

## local docker build

- `docker build -f .debug.Dockerfile -t ubpots-api-local .`

## auto generated api doc

When `process.env.NODE_ENV` is not production, the API will have an auto-generated documentation under `api/doc` endpoint using `swagger-ui-express`.

## URLs

- `/`: root url rerturns 'ok'
- `/api`: api health endpoint returns health status and IP
- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/account/verify/{code}` (email verification endpoint)
- GET `/api/account/user` (gets user info)
- GET `/api/portfolio/summary`
- GET `/api/trade/summary`

## error handling

See [error interceptor](./src/shared/http-exception.filter.ts).

## Add/declare a new db entity using mongoose (ORM)

Mongoose models are injected using the MongooseModule in the [SharedModule](./src/shared/shared.module.ts), for instance:

```typescript
// shared.module.ts
@Module({
  imports: [
      ...
      MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]);
      ...
  ]
```

## db indexes

- index user.verification.code, user.email (account verification and login)

## nestjs update

Since `@nestjs/cli` was installed as a dev dependency (`npm i @nestjs/cli --save-dev) you may using`npx` to update nestjs using the following command:

- `npx nest update`

## Order book proxy
Proxy implemented using "http-proxy-middleware" package. Middleware mouted to app for route `/api/orderbook/*`
File src/main.ts:69

## Portfolio evolution
Endpoint GET `/api/portfolio/evolution?start=YYYY-MM-DD&end=YYYY-MM-DD&account=account_id1,account_id2,...`.
Returns portfolio evolution data, grouped by accounts.
Getting new portfolio evolution data is done via interval task `portforlioEvolutionTask`, file src/portfolio/services/portfolio.service.ts:191.
After adding new binance key, `onKeyAdded` event handler is retrieving portfolio evolution data for last 90 days. File src/portfolio/services/portfolio.service.ts:134.
After adding new binance key `exchange-key.service.ts` fires `key-added` event.

## Training
Endpoints:
- GET `/api/training?topic=topic_id&level=level_id&format=format_id&language=language_id&search=search_query&limit=1&offset=0` get list of trainings. All params are not mandatory
- GET `/api/training/topics` get list of topics.
- GET `/api/training/levels` get list of levels.
- GET `/api/training/formats` get list of formats.
- GET `/api/training/languages` get list of languages.

### nest cli command example

- `npx nest g mo portfolio --dry-run`
- create a controller `npx nest g co portfolio/portfolio --dry-run --flat` (remove the dry-run option to really create the files)
- create a service `npx nest g service trade/services/trade --dry-run --flat` (CREATE /src/trade/services/trade.service.ts )

## grpc

### install grpc for the api project (grpc-tools)

proto files needs to be compiled to generate js files. At the moment, it is not possible to generate typescript (only definition types).
Those js files needs to be copied to the dist folder during the build.

- install main grpc lib `npm i grpc google-protobuf`
- `npm i @types/google-protobuf --save-dev`
- `npm i grpc-tools grpc_tools_node_protoc_ts --save-dev`

- grpc-tools generate javascript files for the proto files
- grpc_tools_node_protoc_ts generate corresponding typescript d.ts codes according to js codes generated by grpc-tools

make script executable `sudo chmod +x ./scripts/generate-proto.sh`

### when proto files changes (important)

**IMPORTANT**
Whenever proto files are modified you need to update the js generated files:

- copy the new proto files under a new folder of your choice _./src/proto/<a_new_folder>_
- run proxy js class `npm run proto:gen`(see package.json script).
- try tsc compilation `npm run start:dev`

#### [not needed] mac osx protoc install on your dev machine

https://www.npmjs.com/package/grpc-web#quick-start

protoc-gen-grpc-web is not needed as you do not call grpc from the browser.

- Download OS X version of https://github.com/protocolbuffers/protobuf/releases
- Download https://github.com/grpc/grpc-web/releases
- \$ sudo mv ~/Downloads/protoc-3/bin/protoc /usr/local/bin/protoc
- \$ chmod +x /usr/local/bin/protoc
- \$ sudo mv ~/Downloads/protoc-3/include/google /usr/local/include

- \$ sudo mv ~/Downloads/protoc-gen-grpc-web-1.0.7-darwin-x86_64 /usr/local/bin/protoc-gen-grpc-web
- \$ chmod +x /usr/local/bin/protoc-gen-grpc-web
