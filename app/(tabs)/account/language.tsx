import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "~/components/header";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface LanguageOptionProps {
  language: Language;
  isSelected: boolean;
  onPress: () => void;
}

const Language: React.FC = () => {
  const { t, i18n } = useTranslation();

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

  const changeLanguage = async (languageCode: string): Promise<void> => {
    if (i18n.language === languageCode) {
      return;
    }

    try {
      await i18n.changeLanguage(languageCode);
    } catch (error) {
      console.error("Failed to change language:", error);
      Alert.alert(
        t("error") || "Error",
        t("language.changeError") ||
          "Failed to change language. Please try again."
      );
    }
  };

  const LanguageOption: React.FC<LanguageOptionProps> = ({
    language,
    isSelected,
    onPress,
  }) => (
    <TouchableOpacity
      style={[styles.languageOption, isSelected && styles.selectedOption]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Select ${language.name} language`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.languageContent}>
        <Text style={styles.flag} accessibilityLabel={`${language.name} flag`}>
          {language.flag}
        </Text>
        <View style={styles.languageText}>
          <Text
            style={[styles.languageName, isSelected && styles.selectedText]}
          >
            {language.name}
          </Text>
          <Text style={[styles.nativeName, isSelected && styles.selectedText]}>
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

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("language.language") || "Language"} backBtn />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {t("language.selectLanguage") || "Select your preferred language"}
        </Text>
        <View style={styles.languageList}>
          {languages.map((language: Language) => (
            <LanguageOption
              key={language.code}
              language={language}
              isSelected={i18n.language === language.code}
              onPress={() => changeLanguage(language.code)}
            />
          ))}
        </View>
        <Text style={styles.note}>
          {t("language.languageNote") ||
            "The app will restart to apply language changes"}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ffffff",
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

export default Language;
