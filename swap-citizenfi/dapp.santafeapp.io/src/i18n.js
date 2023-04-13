import i18n from 'i18next'
import Backend from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'
import detector from "i18next-browser-languagedetector";
import Cache from 'i18next-localstorage-cache';

i18n
  .use(detector)
  .use(Backend)
  .use(initReactI18next)
  .use(Cache)
  .init({
    // lng: 'en',
    backend: {
      /* translation file path */
      loadPath: '/assets/i18n/{{ns}}/{{lng}}.json'
    },
    fallbackLng: 'en',
    debug: true,
    /* can have multiple namespace, in case you want to divide a huge translation into smaller pieces and load them on demand */
    ns: ['translations'],
    defaultNS: 'translations',
    // keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ','
    },
    react: {
      wait: true,
    },
    Cache: {
      enabled: false,
      prefix: 'translation_',
      expirationTime: Infinity,
      Version: {},
      // defaultVersion: '',
    }
  })

export default i18n

// import i18n from "i18next";
// // import LngDetector from "i18next-browser-languagedetector";
// import { initReactI18next } from "react-i18next";

// import Fetch from "i18next-xhr-backend";

//   i18n
//     // .use(LngDetector) //language detector
//     .use(Fetch)
//     .use(initReactI18next)
//     .init({
//       backend: {
//         loadPath: "/assets/i18n/{{ns}}/{{lng}}.json",
//         // path to post missing resources
//         addPath: "/assets/i18n/{{ns}}/{{lng}}.json",
//         // define how to stringify the data when adding missing resources
//         stringify: JSON.stringify
//       },
//       defaultNS: "base",
//       fallbackLng: "en",
//       debug: true,
//       initImmediate: false,
//       react: {
//         useSuspense: false
//       }
//     });

// export default i18n;