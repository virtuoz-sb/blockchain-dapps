# TOROBOTS Monorepo

| env | deploy link |
|-----|--------|
| prod |   [deploy to prod](https://github.com/Lightfifty-GG/torobots/compare/master...dev?expand=1&title=deploy%20to%20prod&body=describe%20your%20changes) ||

## Running Scripts
To run a script on a specific package (from the root directory):
`yarn <PACKAGE_NAME> <SCRIPT>`
example: `yarn backend start`

To run a global script:
`yarn <SCRIPT>`
for example, `yarn deploy`

## Structure
```
root/
├─ .github/
├─ packages/
│  ├─ shared
│  ├─ engine
│  ├─ api
│  ├─ web
│  ├─ server-config
│  ├─ webserver
├─ ecosystem.yml
├─ package.json
 ```

## Global Items

### .github
Configure the CI pipeline in this directory. Automatic deployments build the packages and then push the results (including all build artifacts) to the `production-build` branch. `pm2` is installed on the host machine and is used to manage the production processes. The `ecosystem.yml` file in the root directory contains the `pm2` configuration.
- `deploy-setup.yml` - trigger this action manually to setup the deployment for the first time
- `deploy.yml` - triggered automatically on every push to master.

### ecosystem.yml
This is the pm2 ecosystem configuration file. [see pm2 documentation](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/)

### package.json
Monorepo package definition. Includes script definitions to run, build, and deploy the system and its subsystems. Includes package references so that you don't have to change directories to run a specific package's script (for example, `yarn backend start` will reference the backend package and calls its `start` script).

## Packages
### Engine
| Script      | Description                                 |
|-------------|---------------------------------------------|
| `start`     | Builds current source and runs.             |
| `build`     | Builds current source                       |
| `autobuild` | Builds current source when changes detected |
| `serve`     | Run in production                           |

### Api
| Script      | Description                                 |
|-------------|---------------------------------------------|
| `start`     | Builds current source and runs.             |
| `build`     | Builds current source                       |
| `autobuild` | Builds current source when changes detected |
| `serve`     | Run in production                           |

### Web

| Script      | Description                                 |
|-------------|---------------------------------------------|
| `start`     | Starts in development mode                  |
| `build`     | Builds current source                       |
| `serve`     | Run in production                           |

This is the frontend interface for interacting with the TOROBOTS backend and smart contract. Like the backend, this should also be as modular as possible. React hooks should be used to get data into components and should follow the pattern established in `hooks.ts`. Components should be strictly built using only Ant Design components unless impossible otherwise. All styling should be done with TailwindCSS classes.


#### Prerequisites
Here is the list of all the prerequisites you would need to install on your system in order to run the web:

* Build TOROBOTS Shared
```
cd apps/shared
yarn
yarn build
```

* Build api and run dev
```
cd packages/api
yarn
yarn build
yarn dev
```

###  Webserver

| Script      | Description                                 |
|-------------|---------------------------------------------|
| `build`     | builds the webserver        |
| `start`     | starts the webserver        |


This is a simple webserver that hosts static assets. For example, a static build of the web. 

---

###  Shared

| Script      | Description                                 |
|-------------|---------------------------------------------|
| `build`     | builds the shared        |


All shared should live here so that the same values can be referenced by both web and api, engine.

---
###  Server Config

This is not a runnable node package. This simply contains utilities and references to configure a new webserver.
