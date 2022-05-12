/**
Project: Operator Connect (c)
Title: i18n
Description: Internationalization settings
Copyrights: This file is subject to the terms and conditions defined in file 'LICENSE.txt', which is part of this source code package.
*/
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English Code (EN)
import oc_home_en from "./app/pages/common/translations/en/home.json";
import oc_common_en from "./app/pages/common/translations/en/common.json";
import oc_product_en from "./app/pages/products/translations/en/products.json";
import oc_quote_en from "./app/pages/quotes/translations/en/quotes.json";
import oc_error_en from "./app/pages/common/translations/en/error.json";


// Spanish Code (ES)
import oc_home_es from "./app/pages/common/translations/es/home.json";
import oc_common_es from "./app/pages/common/translations/es/common.json";
import oc_product_es from "./app/pages/products/translations/es/products.json";
import oc_quote_es from "./app/pages/quotes/translations/es/quotes.json";
import oc_error_es from "./app/pages/common/translations/en/error.json";


const lang = navigator.language ? navigator.language.split("-")[0] : "en";
const detection = {
  order: [
    "localStorage",
    "navigator",
    "cookie",
    "htmlTag",
    "querystring",
    "path",
    "subdomain",
  ],
  caches: ["localStorage"],
};

// the translations
const resources = {
  en: {
    oc_home: oc_home_en,
    oc_product: oc_product_en,
    oc_quote: oc_quote_en,
    oc_common: oc_common_en,
    oc_error: oc_error_en,

  },
  es: {
    oc_home: oc_home_es,
    oc_common: oc_common_es,
    oc_product: oc_product_es,
    oc_quote: oc_quote_es,
    oc_error: oc_error_es,

  },
  /*
  de: {
    common: common_de,
  },
  */
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    detection,
    resources,
    lng: lang,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
