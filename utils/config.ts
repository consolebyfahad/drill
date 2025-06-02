// i18n.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar.json";
import en from "../locales/en.json";

const LANGUAGE_PREFERENCE = "user-language";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

const languageDetector = {
  type: "languageDetector",
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_PREFERENCE);
      if (savedLanguage) {
        return callback(savedLanguage);
      }
    } catch (e) {
      console.error("Failed to get saved language:", e);
    }
    return callback(Localization.locale.startsWith("ar") ? "ar" : "en");
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_PREFERENCE, lng);
    } catch (e) {
      console.error("Failed to save language:", e);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    compatibilityJSON: "v3",
    resources,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
