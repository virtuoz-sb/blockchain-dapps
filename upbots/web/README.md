# upbots-web

## Install and Config

Building modes and configuration uses the default vuejs .env files ([doc here](https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code)).

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your tests

```
npm run test
```

### local docker image build

- `cd ./web`
- `docker build -f .debug.Dockerfile -t ubpots-front-local .`

### Lints and fixes files

```
npm run lint
```

or
`npm run lint -- --fix` to auto fix errors

## vue socket io

https://github.com/probil/vue-socket.io-extended
Mutations and actions will be dispatched or committed automatically in the Vuex store when a socket event arrives. A mutation or action must follow the naming convention below to recognize and handle a socket event.

- A **mutation** should start with `SOCKET_` prefix and continue with an uppercase version of the event
- An **action** should start with `socket_` prefix and continue with camelcase version of the event

| Server Event   | Mutation              | Action               |
| -------------- | --------------------- | -------------------- |
| `chat message` | `SOCKET_CHAT MESSAGE` | `socket_chatMessage` |
| `chat_message` | `SOCKET_CHAT_MESSAGE` | `socket_chatMessage` |
| `chatMessage`  | `SOCKET_CHATMESSAGE`  | `socket_chatMessage` |
| `CHAT_MESSAGE` | `SOCKET_CHAT_MESSAGE` | `socket_chatMessage` |

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## project structure

- src/views: components that are used in routing
- src/views/layout: master components that are used for layout and has children routes

## customize ui

### colors

- scss files are imported by the [blackDashboard plugin](./src/plugins/blackDashboard.ts)
- side bar colors defined in line 360 of [\_sidebar-and-main-panel.scss](./src/assets/sass/black-dashboard/custom/_sidebar-and-main-panel.scss)
- colors overrides defined in line 102 of [\_variables.scss](./src/assets/sass/black-dashboard/custom/_variables.scss)

## Authentication

Axios is used to make http requests throughout the application. If a request is made to the api and a JWT is found in the store, then an axios interceptor sets the Authorization header accordingly.
see [axios-jwt-interceptor](./src/plugins/axios-jwt-interceptor.ts)

## vscode dev settings (prettier)

If you're using prettier plugin on vscode, be sure that vscode user settings `prettier.printWidth": 140` matches the config specified in [local prettier config](./.prettierrc).

## file structure

### new design

- pages: [src/pages/](./src/pages/PageSixth.vue)
- layout: [src/views/](./src/views/PageLayout.vue)

### old design

- public pages : [src/views/public](./src/views/public/Login.vue)
- other pages : [src/views/](./src/views/Home.vue)
- layout located: [src/views/layout/](./src/views/layout/PublicLayoutBlack.vue)

## manual trade api connection

Manual trade features are available via the upbots staging api. Front app may use manual trade features by connecting the fontend app to upbots staging api.

- edit your [.env.development](./.env.development) and update `VUE_APP_ROOT_API` to `https://api.staging.demo.upbots.com` value.
- launch your front app on localhost:8080
- login using a staging account (or create one)
- if not done already, create an account to [testnet.bitmex](https://testnet.bitmex.com/)
- create an api key with trading capabilities [see apiKeys](https://testnet.bitmex.com/app/apiKeys)
- add a bitmex testnet api key to upbots

see [api-doc-questions.md](./web/doc/api-doc-questions.md) for additional docs.
