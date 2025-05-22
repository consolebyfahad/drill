import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Header from "@/components/header";
import Button from "@/components/button";
import Seprator from "@/components/seprator";
import { Colors } from "@/constants/Colors";
import AccountStatus from "@/assets/svgs/profile/security.svg";
// import Notification from "@/assets/svgs/Notification.svg";
import Rating from "@/assets/svgs/emptyStar.svg";
import About from "@/assets/svgs/info.svg";
import Support from "@/assets/svgs/profile/support.svg";
import Language from "@/assets/svgs/language.svg";
import Wallet from "@/assets/svgs/profile/Wallet.svg";
import Verify from "@/assets/svgs/verify.svg";
import Employee from "@/assets/svgs/employee.svg";
import Logout from "@/assets/svgs/Logout.svg";
import { apiCall } from "~/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultProfile from "@/assets/images/default-profile.png";
import { SafeAreaView } from "react-native-safe-area-context";
// import { requestFCMPermission } from "~/utils/notification";
import messaging from "@react-native-firebase/messaging";
import { FONTS } from "~/constants/Fonts";

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  dob: string;
  user_type: string;
  address: string;
  postal: string;
  image: string;
  phone: string;
  gender: string;
  lat: string;
  lng: string;
  country: string;
  state: string;
  city: string;
  status: string;
  company_number: string;
  secondary_email: string;
  tax_number: string;
  company_category: string;
  company_code: string;
  iqama_id: string;
  documents: string;
  online_status: string;
  company_verified: string;
  platform_status: string;
  balance: string;
  social_token: string;
  company_id: string;
  timestamp: string;
};

export default function Account() {
  // const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [accountType, setAccountType] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    password: "",
    dob: "",
    user_type: "",
    address: "",
    postal: "",
    image: "",
    phone: "",
    gender: "",
    lat: "",
    lng: "",
    country: "",
    state: "",
    city: "",
    status: "",
    company_number: "",
    secondary_email: "",
    tax_number: "",
    company_category: "",
    company_code: "",
    iqama_id: "",
    documents: "",
    online_status: "",
    company_verified: "",
    platform_status: "",
    balance: "",
    social_token: "",
    company_id: "",
    timestamp: "",
  });

  useFocusEffect(
    useCallback(() => {
      fetchAccountType();
      fetchUserProfile();
      // checkNotificationPermission();
    }, [])
  );

  const fetchAccountType = async () => {
    try {
      const account = await AsyncStorage.getItem("account_type");
      if (account) {
        setAccountType(account);
        console.log("Account type:", account);
      }
    } catch (error) {
      console.error("Error fetching account type:", error);
    }
  };

  // Check if notification permissions are granted
  // const checkNotificationPermission = async () => {
  //   try {
  //     const authStatus = await messaging().hasPermission();
  //     console.log("Notification permission status:", authStatus);

  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     setNotificationsEnabled(enabled);
  //   } catch (error) {
  //     console.error("Error checking notification permission:", error);
  //     setNotificationsEnabled(false);
  //   }
  // };

  // const handleNotificationToggle = async (value: boolean) => {
  //   if (value) {
  //     try {
  //       const authStatus = await messaging().hasPermission();

  //       if (authStatus === messaging.AuthorizationStatus.NOT_DETERMINED) {
  //         const permissionGranted = await requestFCMPermission();
  //         if (permissionGranted) {
  //           setNotificationsEnabled(true);
  //           await updateNotificationSettings(true);
  //         } else {
  //           setNotificationsEnabled(false);
  //         }
  //       } else if (authStatus === messaging.AuthorizationStatus.DENIED) {
  //         showSettingsAlert();
  //       } else {
  //         setNotificationsEnabled(true);
  //         await updateNotificationSettings(true);
  //       }
  //     } catch (error) {
  //       console.error("Error toggling notifications:", error);
  //       setNotificationsEnabled(false);
  //     }
  //   } else {
  //     setNotificationsEnabled(false);
  //     await updateNotificationSettings(false);
  //     showDisableNotificationsInfo();
  //   }
  // };

  // const updateNotificationSettings = async (enabled: boolean) => {
  //   try {
  //     const userId = await AsyncStorage.getItem("user_id");
  //     if (!userId) return;

  //     const formData = new FormData();
  //     formData.append("type", "update_notification_settings");
  //     formData.append("user_id", userId);
  //     formData.append("notifications_enabled", enabled ? "1" : "0");

  //     const response = await apiCall(formData);
  //     console.log("Notification settings updated:", response);
  //   } catch (error) {
  //     console.error("Failed to update notification settings:", error);
  //   }
  // };

  // const showSettingsAlert = () => {
  //   Alert.alert(
  //     "Notifications Permission",
  //     "To receive notifications, please enable permission in your device settings.",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Open Settings",
  //         onPress: () => {
  //           Platform.OS === "ios"
  //             ? Linking.openURL("app-settings:")
  //             : Linking.openSettings();
  //         },
  //       },
  //     ]
  //   );
  // };

  // const showDisableNotificationsInfo = () => {
  //   Alert.alert(
  //     "Notifications Disabled",
  //     "You have disabled notifications. To change this, you can go to your device settings.",
  //     [
  //       { text: "OK", style: "cancel" },
  //       {
  //         text: "Open Settings",
  //         onPress: () => {
  //           Platform.OS === "ios"
  //             ? Linking.openURL("app-settings:")
  //             : Linking.openSettings();
  //         },
  //       },
  //     ]
  //   );
  // };

  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found");

      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("user_id", userId);

      const response = await apiCall(formData);

      if (response.profile || response.user) {
        const profileData = response.profile || response.user;
        setUser(profileData);

        if (profileData.user_type) {
          setAccountType(profileData.user_type);
          await AsyncStorage.setItem("account_type", profileData.user_type);
        }

        // if (profileData.notifications_enabled) {
        //   setNotificationsEnabled(profileData.notifications_enabled === "1");
        // }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleNavigation = (title: string) => {
    switch (title) {
      case "Employees":
        router.push("/account/employee");
        break;
      case "Wallet":
        router.push("/account/wallet");
        break;
      case "Rate Us":
        // Handle rate us functionality (e.g., open app store)
        if (Platform.OS === "ios") {
          Linking.openURL("https://apps.apple.com/app/YOUR_APP_ID");
        } else {
          Linking.openURL(
            "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"
          );
        }
        break;
      case "About App":
        router.push("/account/about");
        break;
      case "Language":
        router.push("/account/language");
        break;
      case "Support":
        router.push("/account/support");
        break;
      case "Logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            // Navigate to login screen
            router.replace("/welcome");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleProfile = () => {
    router.push("/account/view_profile");
  };

  const handleEditProfile = () => {
    router.push("/account/edit_profile");
  };

  // const renderNotificationIcon = () => {
  //   return (
  //     <View style={{ position: "relative" }}>
  //       <Notification />
  //       {!notificationsEnabled && (
  //         <View style={styles.notificationDisabledIndicator} />
  //       )}
  //     </View>
  //   );
  // };

  // Update the icon map to include all necessary icons
  const iconMap: { [key: string]: JSX.Element } = {
    Account: <AccountStatus />,
    Employee: <Employee />,
    Wallet: <Wallet />,
    // Notification: renderNotificationIcon(),
    "Rate Us": <Rating />,
    "About App": <About />,
    Language: <Language />,
    Support: <Support />,
    Logout: <Logout />,
  };

  // Create the menu items
  const getMenuItems = () => {
    const baseMenuItems = [
      {
        icon: "Account",
        title: "Account Status",
        right:
          accountType === "company"
            ? user.platform_status === "1"
              ? "Verified"
              : "Unverified"
            : accountType === "employee"
            ? user.platform_status === "1" && user.company_verified === "1"
              ? "Verified"
              : user.platform_status === "1" || user.company_verified === "1"
              ? "1/2 Verified"
              : "Unverified"
            : "Unverified",
        rightColor:
          user.platform_status === "1" ? Colors.success : Colors.danger,
      },
      ...(accountType === "company"
        ? [
            {
              icon: "Wallet",
              title: "Wallet",
              extraRight: "chevron-forward",
            },
          ]
        : []),
      ,
    ];

    // Only show Employees for company accounts
    if (accountType === "company") {
      baseMenuItems.push({
        icon: "Employee",
        title: "Employees",
        extraRight: "chevron-forward",
      });
    }

    // Add the rest of the menu items
    baseMenuItems.push(
      // { icon: "Notification", title: "Notification", right: "toggle" },
      { icon: "Rate Us", title: "Rate Us", extraRight: "chevron-forward" },
      { icon: "About App", title: "About App", extraRight: "chevron-forward" },
      { icon: "Language", title: "Language", extraRight: "chevron-forward" },
      { icon: "Support", title: "Support", extraRight: "chevron-forward" },
      { icon: "Logout", title: "Logout", extraRight: "chevron-forward" }
    );

    return baseMenuItems;
  };

  // Get dynamic menu items based on account type
  const menuItems = getMenuItems();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Account" homeScreen={false} icon={false} />
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={user.image ? { uri: user.image } : defaultProfile}
              style={styles.image}
              resizeMode="cover"
              onError={({ nativeEvent }) => {
                console.warn("Image failed to load", nativeEvent.error);
              }}
            />
            {user.platform_status === "1" &&
              (accountType === "company" ||
                (accountType === "employee" &&
                  user.company_verified === "1")) && (
                <Verify style={styles.verifiedIcon} />
              )}
            {user.online_status === "1" && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          {accountType === "employee" ? (
            <Text style={styles.userEmail}>{user.email}</Text>
          ) : (
            <Text style={styles.userEmail}>Balance: SAR {user.balance}</Text>
          )}
          {accountType === "company" && user.company_code && (
            <Text style={styles.companyCode}>
              Company#: {user.company_code}
            </Text>
          )}
        </View>
        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Button
            title="View Profile"
            width="48%"
            fullWidth={false}
            onPress={handleProfile}
          />
          <Button
            title="Edit Profile"
            width="48%"
            fullWidth={false}
            variant="secondary"
            onPress={handleEditProfile}
          />
        </View>
        <Seprator />
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <View key={index}>
            {/* Handle Notification Toggle Separately */}
            {/* {item.title === "Notification" ? (
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  {iconMap[item.icon]}
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: "#ccc", true: Colors.success }}
                  thumbColor="white"
                />
              </View>
            ) : ( */}
            <TouchableOpacity
              onPress={() => handleNavigation(item.title)}
              activeOpacity={0.7}
            >
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  {iconMap[item.icon]}
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
                <View style={styles.rowRight}>
                  {item.right && item.right !== "toggle" && (
                    <Text
                      style={[
                        styles.itemRightText,
                        { color: item.rightColor || Colors.secondary300 },
                      ]}
                    >
                      {item.right}
                    </Text>
                  )}
                  {item.extraRight && (
                    <Ionicons
                      name={item.extraRight as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={Colors.secondary300}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>
            {/* )} */}
            <Seprator />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 44,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  profileContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  imageWrapper: {
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 999,
    position: "relative",
    marginBottom: 16,
  },
  image: {
    width: 96,
    height: 96,
    borderRadius: 999,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.success,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "white",
  },
  verifiedIcon: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  userName: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
  },
  userEmail: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary300,
  },
  companyCode: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary300,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemText: {
    fontSize: 15,
    color: Colors.secondary,
    fontFamily: FONTS.medium,
  },
  itemRightText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  // notificationDisabledIndicator: {
  //   position: "absolute",
  //   top: 0,
  //   right: -2,
  //   width: 10,
  //   height: 10,
  //   borderRadius: 5,
  //   backgroundColor: Colors.danger,
  //   borderWidth: 1,
  //   borderColor: Colors.white,
  // },
});
