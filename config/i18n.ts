import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import ko from "./locales/ko.json";
import en from "./locales/en.json";
import zh from "./locales/zh-CN.json";
import vi from "./locales/vi.json";
import th from "./locales/th.json";
import fil from "./locales/fil.json";

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  "zh-CN": { translation: zh },
  zh: { translation: zh },
  vi: { translation: vi },
  th: { translation: th },
  fil: { translation: fil },
  tl: { translation: fil },
};

// Get the device locale using the new API
const deviceLocale = Localization.getLocales()[0]?.languageCode || "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLocale,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;