// i18n.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { I18nManager } from "react-native";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar.json";
import en from "../locales/en.json";

const LANGUAGE_PREFERENCE = "user-language";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Initialize i18n with a simple configuration first
// Start with fallback, will load saved language afterwards
i18n.use(initReactI18next).init({
  lng: "en", // Default to English initially, will be overridden by saved preference
  fallbackLng: "en",
  compatibilityJSON: "v4",
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // This is important for React Native
  },
});

// Load saved language preference and set RTL after initialization
const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_PREFERENCE);
    
    console.log("🌍 Loading saved language on app start:", {
      saved: savedLanguage,
      current: i18n.language,
      currentRTL: I18nManager.isRTL,
      deviceLocale: Localization.getLocales()[0]?.languageCode,
    });
    
    // Determine which language to use
    let languageToUse = "en"; // Default fallback
    
    if (savedLanguage) {
      // User has explicitly chosen a language - use it
      languageToUse = savedLanguage;
      console.log("✅ Using saved language preference:", savedLanguage);
    } else {
      // No saved preference, check device locale
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;
      if (deviceLanguage?.startsWith("ar")) {
        languageToUse = "ar";
        console.log("📱 Using device locale (Arabic)");
      } else {
        languageToUse = "en";
        console.log("📱 Using device locale (English/default)");
      }
    }
    
    // Change language if different from current
    if (languageToUse !== i18n.language) {
      await i18n.changeLanguage(languageToUse);
      console.log("🔄 Changed language to:", languageToUse);
    }
    
    // Set RTL based on the language we're using
    const shouldBeRTL = languageToUse === "ar";
    
    console.log("🔀 Setting RTL:", {
      language: languageToUse,
      shouldBeRTL,
      currentIsRTL: I18nManager.isRTL,
    });
    
    // Force RTL setting based on language
    I18nManager.forceRTL(shouldBeRTL);
    I18nManager.allowRTL(shouldBeRTL);
    
    console.log("✅ RTL configured. Will take effect on next app launch:", shouldBeRTL);
    console.log("⚠️ Current RTL state (won't change until restart):", I18nManager.isRTL);
  } catch (e) {
    console.error("❌ Failed to load saved language:", e);
  }
};

// Load saved language
loadSavedLanguage();

// Function to save language preference
export const saveLanguagePreference = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE, language);
    await i18n.changeLanguage(language);
  } catch (e) {
    console.error("Failed to save language:", e);
  }
};

export default i18n;
