import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  I18nManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "~/components/header";
import { Colors } from "~/constants/Colors";

type LanguageCode = "en" | "ar";

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageOptionProps {
  language: Language;
  isSelected: boolean;
  onPress: () => void;
}

export default function Language() {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Update local state when i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const languages: Language[] = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
    },
    {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      flag: "🇸🇦",
    },
  ];

  const changeLanguage = async (languageCode: LanguageCode): Promise<void> => {
    if (i18n.language === languageCode) {
      return;
    }

    try {
      // Determine if RTL change is needed
      const newIsRTL = languageCode === "ar";
      const currentIsRTL = I18nManager.isRTL;
      const needsDirectionChange = currentIsRTL !== newIsRTL;

      console.log("🔄 Language change requested:", {
        from: i18n.language,
        to: languageCode,
        currentIsRTL,
        newIsRTL,
        needsDirectionChange,
      });

      // IMPORTANT: Save language preference FIRST
      await AsyncStorage.setItem("user-language", languageCode);
      console.log(
        "💾 Saved language preference to AsyncStorage:",
        languageCode
      );

      // Then change the language
      await i18n.changeLanguage(languageCode);
      console.log("✅ Changed i18n language to:", languageCode);

      if (needsDirectionChange) {
        // Force RTL/LTR based on language
        I18nManager.forceRTL(newIsRTL);
        I18nManager.allowRTL(newIsRTL);

        console.log("Direction changed:", {
          newIsRTL,
          afterChange: I18nManager.isRTL,
          note: "RTL change only takes effect after complete app restart (kill + relaunch)",
        });

        // Alert user about app reload requirement with clear instructions
        Alert.alert(
          newIsRTL ? "اللغة" : "Language",
          newIsRTL
            ? "تم حفظ اللغة!\n\nلتطبيق تغيير الاتجاه:\n1. أغلق التطبيق تماماً (اسحبه من قائمة التطبيقات الأخيرة)\n2. أعد فتح التطبيق\n\nسيظهر التطبيق بالاتجاه الصحيح."
            : "Language saved!\n\nTo apply layout direction change:\n1. COMPLETELY close the app (swipe it away from recent apps)\n2. Reopen the app\n\nThe app will then show in the correct direction.",
          [
            {
              text: newIsRTL ? "فهمت" : "Got it",
              onPress: () => {
                console.log(
                  "User needs to restart app for RTL/LTR to take effect"
                );
              },
            },
          ]
        );
      } else {
        // Language changed without direction change
        Alert.alert(
          t("success") || "Success",
          t("language.languageChanged") || "Language changed successfully!",
          [{ text: t("ok") || "OK" }]
        );
      }
    } catch (error) {
      console.error("Failed to change language:", error);
      Alert.alert(
        t("error") || "Error",
        t("language.changeError") ||
          "Failed to change language. Please try again."
      );
    }
  };

  function LanguageOption({
    language,
    isSelected,
    onPress,
  }: LanguageOptionProps) {
    return (
      <TouchableOpacity
        style={[styles.languageOption, isSelected && styles.selectedOption]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select ${language.name} language`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.languageContent}>
          <Text
            style={styles.flag}
            accessibilityLabel={`${language.name} flag`}
          >
            {language.flag}
          </Text>
          <View style={styles.languageText}>
            <Text
              style={[styles.languageName, isSelected && styles.selectedText]}
            >
              {language.name}
            </Text>
            <Text
              style={[styles.nativeName, isSelected && styles.selectedText]}
            >
              {language.nativeName}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkIcon} accessibilityLabel="Selected">
              ✓
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("language.language") || "Language"} backBtn />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t("language.selectLanguage") || "Select your preferred language"}
        </Text>
        <View style={styles.languageList}>
          {languages.map((language) => (
            <LanguageOption
              key={language.code}
              language={language}
              isSelected={currentLang === language.code}
              onPress={() => changeLanguage(language.code)}
            />
          ))}
        </View>
        <Text style={styles.note}>
          {t("language.languageChanged") || "Language will change immediately!"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 24,
  },
  languageList: {
    marginBottom: 30,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
    elevation: 2,
    shadowOpacity: 0.1,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: "center",
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
    lineHeight: 22,
  },
  nativeName: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 18,
  },
  selectedText: {
    color: "#2196f3",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2196f3",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkIcon: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
