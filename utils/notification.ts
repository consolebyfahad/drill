import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid, Platform } from "react-native";

export const requestFCMPermission = async () => {
  try {
    const hasPermission = await messaging().hasPermission();

    if (hasPermission === -1) {
      const requested = await messaging().requestPermission();
      console.log(`🆕 Permission requested, status: ${requested}`);
      return requested;
    } else if (Platform.OS === "android") {
      const androidPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      console.log(`🤖 Android notification permission: ${androidPermission}`);
    }
    return true;
  } catch (error) {
    console.error("❌ Permission request failed:", error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log("🔑 FCM Token:", token);
    return token;
  } catch (error) {
    console.error("❌ FCM token retrieval failed:", error);
    return null;
  }
};

export const setupNotificationListeners = (
  handleNotificationPress: (data: any) => void
) => {
  // Foreground
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    console.log("📩 Foreground notification received:", remoteMessage);
    if (remoteMessage?.data) {
      handleNotificationPress(remoteMessage.data);
    }
  });

  // Background
  const unsubscribeOnOpenedApp = messaging().onNotificationOpenedApp(
    (remoteMessage) => {
      if (remoteMessage?.data) {
        console.log(
          "📲 App opened from background notification:",
          remoteMessage.data
        );
        handleNotificationPress(remoteMessage.data);
      }
    }
  );

  // Quit state
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data) {
        console.log(
          "🆕 App opened from quit state via notification:",
          remoteMessage.data
        );
        handleNotificationPress(remoteMessage.data);
      }
    });

  // Clean-up function
  return () => {
    unsubscribeOnMessage();
    unsubscribeOnOpenedApp();
  };
};
