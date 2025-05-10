import messaging from "@react-native-firebase/messaging";
import { PermissionsAndroid } from "react-native";

class FCMService {
  async requestPermissionIfNeeded() {
    try {
      const hasPermission = await messaging().hasPermission();

      if (hasPermission === -1) {
        const requested = await messaging().requestPermission();
        console.log(`🆕 Permission requested, status: ${requested}`);
        return requested;
      } else {
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
  }

  async getToken() {
    try {
      const token = await messaging().getToken();
      console.log("🔑 FCM Token:", token);

      if (token) {
        console.log("FCM token", token);
      }
      return token;
    } catch (error) {
      console.error("❌ FCM token retrieval failed:", error);
      return null;
    }
  }
}

const fcmService = new FCMService();
export default fcmService;
