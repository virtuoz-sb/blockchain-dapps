import * as appRoot from "app-root-path";

const config = {
  development: {
    MONGO_URI: "mongodb://localhost/DB_TOROBOTS",
    LOG_DIR_PATH: `${appRoot.path}/log`
  },
  production: {
    MONGO_URI: "mongodb://localhost:4000/DB_TOROBOTS",
    LOG_DIR_PATH: "/torobots/log"
  }
}

const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production'
export default config[env]