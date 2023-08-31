/* eslint-disable no-console */

import { register } from "register-service-worker";
const pj = require("../package.json");

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      const version = pj && pj.version ? pj.version : "0.0.0";
      // console.log("App is being served from cache by a service worker.\n" + "For more details, visit https://goo.gl/AFskqB");
      console.log(`App is being served from cache by a service worker. (v${version})`);
    },
    registered() {
      const version = pj && pj.version ? pj.version : "0.0.0";
      console.log(`Service worker has been registered (v${version})`);
    },
    cached() {
      console.log("SW:Content has been cached for offline use.");
    },
    updatefound() {
      console.log("SW:New content is downloading.");
    },
    updated(registration: ServiceWorkerRegistration) {
      const version = pj && pj.version ? pj.version : "0.0.0";
      console.log(`SW:New content is available; please refresh. currently (v${version})`);
      if (registration.active) {
        console.log(`SW: skipWaiting on active `);
        registration.active.postMessage({ action: "skipWaiting" });
      }

      if (registration.waiting) {
        console.log(`SW: skipWaiting on waiting `);
        registration.waiting.postMessage({ action: "skipWaiting" });
      }

      window.location.reload(); // forces PWA refresh
    },
    offline() {
      console.log("SW:No internet connection found. App is running in offline mode.");
    },
    error(error) {
      console.error("SW:Error during service worker registration:", error);
    },
  });
}
