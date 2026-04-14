import Header from "@/components/header";
import { PRIVACY_POLICY_URL } from "~/config";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";
import { ms, s, vs } from "~/utils/responsive";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t("privacy.title")} backBtn={true} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t("privacy.introduction")}</Text>
        <Text style={styles.text}>{t("privacy.introductionText")}</Text>

        <Text style={styles.heading}>{t("privacy.informationWeCollect")}</Text>
        <Text style={styles.text}>{t("privacy.informationWeCollectText")}</Text>

        <Text style={styles.subheading}>{t("privacy.personalInformation")}</Text>
        <Text style={styles.text}>{t("privacy.personalInformationText")}</Text>

        <Text style={styles.subheading}>{t("privacy.usageInformation")}</Text>
        <Text style={styles.text}>{t("privacy.usageInformationText")}</Text>

        <Text style={styles.subheading}>{t("privacy.deviceInformation")}</Text>
        <Text style={styles.text}>{t("privacy.deviceInformationText")}</Text>

        <Text style={styles.heading}>{t("privacy.howWeUse")}</Text>
        <Text style={styles.text}>{t("privacy.howWeUseText")}</Text>

        <Text style={styles.heading}>{t("privacy.dataSharing")}</Text>
        <Text style={styles.text}>{t("privacy.dataSharingText")}</Text>

        <Text style={styles.heading}>{t("privacy.dataSecurity")}</Text>
        <Text style={styles.text}>{t("privacy.dataSecurityText")}</Text>

        <Text style={styles.heading}>{t("privacy.yourRights")}</Text>
        <Text style={styles.text}>{t("privacy.yourRightsText")}</Text>

        <Text style={styles.heading}>{t("privacy.changes")}</Text>
        <Text style={styles.text}>{t("privacy.changesText")}</Text>

        <Text style={styles.heading}>{t("privacy.contactUs")}</Text>
        <Text style={styles.text}>{t("privacy.contactUsText")}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("privacy.lastUpdated")}</Text>
          {PRIVACY_POLICY_URL ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(PRIVACY_POLICY_URL!)}
              style={styles.viewOnlineLink}
            >
              <Text style={styles.viewOnlineText}>{t("privacy.viewOnline")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: s(12), backgroundColor: Colors.white },
  scrollView: { flex: 1, paddingHorizontal: s(12) },
  contentContainer: { paddingBottom: vs(24) },
  heading: {
    fontSize: ms(19),
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    marginTop: vs(20),
    marginBottom: vs(10),
  },
  subheading: {
    fontSize: ms(15),
    fontFamily: FONTS.semiBold,
    color: Colors.primary,
    marginTop: vs(14),
    marginBottom: vs(7),
  },
  text: {
    fontSize: ms(13),
    fontFamily: FONTS.regular,
    color: Colors.secondary100,
    lineHeight: ms(22),
    marginBottom: vs(7),
  },
  footer: {
    marginTop: vs(28),
    paddingTop: vs(14),
    borderTopWidth: 1,
    borderTopColor: Colors.gray,
  },
  footerText: {
    fontSize: ms(12),
    fontFamily: FONTS.medium,
    color: Colors.secondary300,
    textAlign: "center",
  },
  viewOnlineLink: { marginTop: vs(10) },
  viewOnlineText: {
    fontSize: ms(13),
    fontFamily: FONTS.semiBold,
    color: Colors.primary,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
