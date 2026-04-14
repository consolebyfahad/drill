import Button from "@/components/button";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";
import { ms, s, vs } from "~/utils/responsive";

export default function Welcome() {
  const { t, ready } = useTranslation();

  if (!ready) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleGetStarted = () => {
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require("../assets/images/onboarding.png")}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{t("welcome")}</Text>
          <Text style={styles.subtitle}>{t("tagline")}</Text>
          <Text style={styles.description}>{t("intro")}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button title={t("getStarted")} onPress={handleGetStarted} />
        <Text
          style={styles.privacyLink}
          onPress={() => router.push("/auth/privacy")}
        >
          {t("login.privacy")}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: s(16),
    paddingBottom: vs(16),
    justifyContent: "space-between",
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: ms(18),
    color: Colors.secondary,
    fontFamily: FONTS.medium,
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: vs(280),
    marginBottom: vs(8),
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: s(12),
  },
  title: {
    fontSize: ms(32),
    marginBottom: vs(6),
    color: Colors.secondary,
    fontFamily: FONTS.bold,
    textAlign: "center",
  },
  subtitle: {
    fontSize: ms(20),
    fontFamily: FONTS.bold,
    marginBottom: vs(10),
    color: Colors.secondary,
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    fontSize: ms(16),
    color: Colors.secondary100,
    paddingHorizontal: s(20),
    fontFamily: FONTS.medium,
  },
  footer: {
    alignItems: "center",
    paddingTop: vs(16),
  },
  privacyLink: {
    marginTop: vs(14),
    fontSize: ms(13),
    fontFamily: FONTS.medium,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
