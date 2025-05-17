import Arrow from "@/assets/svgs/backarrow.svg";
import Button from "@/components/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";
import { getLocationPermission } from "~/utils/location";
import {
  requestFCMPermission,
  getFCMToken,
  setupNotificationListeners,
} from "~/utils/notification";
import * as Device from "expo-device";

export default function AccessLocation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBrowse = () => {
    router.push("/(tabs)");
  };

  const getDeviceInfo = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    const allData = Object.fromEntries(items);
    console.log("allData", allData);
    try {
      // Get device model
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
        brand: "unknown",
        osVersion: "unknown",
      };
    }
  };

  useEffect(() => {
    // Fix: Added proper async function implementation
    const setupNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (!userId) {
          console.warn("User ID not found in AsyncStorage");
          return;
        }

        // FCM
        const permissionGranted = await requestFCMPermission();
        if (permissionGranted) {
          const token = await getFCMToken();
          const deviceInfo = await getDeviceInfo();
          const formData = new FormData();
          formData.append("type", "update_noti");
          formData.append("user_id", userId);
          formData.append("devicePlatform", deviceInfo.platform);
          formData.append("deviceRid", token ?? "");
          formData.append("deviceModel", deviceInfo.model);
          try {
            const response = await apiCall(formData);
            console.log("FCM registration response:", response);
          } catch (error) {
            console.error("FCM registration failed:", error);
          }
        } else {
          console.log("FCM permission not granted");
        }
      } catch (error) {
        console.error("Error setting up notifications:", error);
      }
    };

    const handleNotificationPress = (data: any) => {
      console.log("🔔 Notification Pressed:", data);
      // Navigate based on data, e.g.:
      // if (data.screen) router.push(`/${data.screen}`);
    };

    setupNotifications();

    const unsubscribe = setupNotificationListeners(handleNotificationPress);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLocation = async () => {
    setLoading(true);
    try {
      const location = await getLocationPermission();
      if (location) {
        console.log("📍 User location:", location.coords);
        router.push("/(tabs)");
      }
    } catch (error) {
      console.error("Location fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/auth/verified")}
          style={styles.backButton}
        >
          <Arrow />
        </TouchableOpacity>
        <Text style={styles.headerText}>Allow Location Access</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Image & Text Content */}
      <View style={styles.content}>
        <Image
          source={require("@/assets/images/location.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.textContainer}>
          <Text style={styles.title}>Access Location</Text>
          <Text style={styles.subtitle}>
            Allow us to access your location to provide better services near
            you. This helps us show relevant offers and businesses in your area.
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {/* Allow Location Button */}
        <Button
          title={loading ? "Processing..." : "Allow Access"}
          onPress={handleLocation}
          disabled={loading}
        />
        {/* "Do it Later" Option */}
        <View style={styles.laterContainer}>
          <Text style={styles.laterBaseText}>Do it</Text>
          <TouchableOpacity onPress={handleBrowse}>
            <Text style={styles.laterText}> Later</Text>
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
    padding: 16,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 32,
  },
  backButton: {
    padding: 8, // Increased touch target
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.secondary,
  },
  content: {
    alignItems: "center",
    marginBottom: 80,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.secondary,
    marginBottom: 32,
    lineHeight: 22, // Improved readability
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16, // Added bottom margin
  },
  laterContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  laterBaseText: {
    fontSize: 15, // Match size with laterText
    color: Colors.secondary,
  },
  laterText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  loader: {
    marginTop: 8,
  },
});
