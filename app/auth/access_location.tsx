import Arrow from "@/assets/svgs/backarrow.svg";
import Button from "@/components/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";
import { ms, s, vs } from "~/utils/responsive";
import { apiCall } from "~/utils/api";
import { fetchAndPersistCoordinates } from "~/utils/location";
import {
  getFCMToken,
  requestFCMPermission,
  setupNotificationListeners,
} from "~/utils/notification";

export default function AccessLocation() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const getDeviceInfo = async () => {
    try {
      let deviceModel = "unknown";
      if (Device.modelName) {
        deviceModel = Device.modelName;
      }
      return {
        platform: Platform.OS || "",
        model: deviceModel,
      };
    } catch (error) {
      console.error("Error getting device info:", error);
      return {
        platform: Platform.OS || "",
        model: "unknown",
      };
    }
  };

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) {
          return;
        }
        const permissionGranted = await requestFCMPermission();
        if (permissionGranted) {
          const token = await getFCMToken();
          const deviceInfo = await getDeviceInfo();
          const formData = new FormData();
          formData.append("type", "update_noti");
          formData.append("user_id", userId);
          formData.append("devicePlatform", deviceInfo.platform);
          formData.append("deviceRid", token || "");
          formData.append("deviceModel", deviceInfo.model);
          try {
            await apiCall(formData);
          } catch (error) {
            console.error("FCM registration failed:", error);
          }
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    const handleNotificationPress = () => {};

    setupNotifications();
    const unsubscribe = setupNotificationListeners(handleNotificationPress);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleBrowse = () => {
    router.replace("/(tabs)");
  };

  const handleLocation = async () => {
    setLoading(true);
    try {
      const coords = await fetchAndPersistCoordinates();
      if (!coords) {
        Alert.alert(
          t("accessLocation.permissionDenied"),
          t("accessLocation.permissionRequired")
        );
        return;
      }
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error fetching location:", error);
      Alert.alert(t("accessLocation.error"), t("accessLocation.errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/auth/verified")} accessibilityRole="button">
          <Arrow />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("accessLocation.headerTitle")}</Text>
        <View style={{ width: s(24) }} />
      </View>

      <View style={styles.content}>
        <Image
          source={require("@/assets/images/location.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>{t("accessLocation.title")}</Text>
          <Text style={styles.subtitle}>{t("accessLocation.subtitle")}</Text>
        </View>
        <Text style={styles.disclosure}>
          {t("accessLocation.dataDisclosure")}{" "}
          <Text
            style={styles.privacyLink}
            onPress={() => router.push("/auth/privacy")}
          >
            {t("accessLocation.privacyPolicy")}
          </Text>
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={
            loading ? t("accessLocation.loading") : t("continue")
          }
          onPress={handleLocation}
          disabled={loading}
        />
        <View style={styles.laterContainer}>
          <Text style={styles.laterBaseText}>{t("accessLocation.doIt")}</Text>
          <TouchableOpacity onPress={handleBrowse} accessibilityRole="button">
            <Text style={styles.laterText}> {t("accessLocation.later")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: s(16),
    paddingVertical: vs(16),
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: vs(24),
  },
  headerText: {
    fontSize: ms(18),
    fontFamily: FONTS.bold,
    textAlign: "center",
    color: Colors.secondary,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  image: {
    width: s(200),
    height: s(200),
    marginBottom: vs(16),
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: s(24),
  },
  title: {
    fontSize: ms(28),
    fontFamily: FONTS.bold,
    marginBottom: vs(8),
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: ms(15),
    textAlign: "center",
    color: Colors.secondary,
    marginBottom: vs(14),
    fontFamily: FONTS.medium,
  },
  disclosure: {
    fontSize: ms(12),
    textAlign: "center",
    color: Colors.secondary300,
    paddingHorizontal: s(16),
    fontFamily: FONTS.regular,
  },
  privacyLink: {
    color: Colors.primary,
    fontFamily: FONTS.semiBold,
    textDecorationLine: "underline",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: vs(16),
  },
  laterContainer: {
    flexDirection: "row",
    paddingVertical: vs(16),
    alignItems: "center",
    justifyContent: "center",
  },
  laterBaseText: {
    fontSize: ms(15),
    fontFamily: FONTS.regular,
    color: Colors.secondary,
  },
  laterText: {
    color: Colors.primary,
    fontFamily: FONTS.semiBold,
    fontSize: ms(15),
  },
});
