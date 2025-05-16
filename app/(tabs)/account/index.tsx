import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Header from "@/components/header";
import Button from "@/components/button";
import Seprator from "@/components/seprator";
import { Colors } from "@/constants/Colors";
import AccountStatus from "@/assets/svgs/profile/security.svg";
import Notification from "@/assets/svgs/Notification.svg";
import Rating from "@/assets/svgs/emptyStar.svg";
import About from "@/assets/svgs/info.svg";
import Support from "@/assets/svgs/profile/support.svg";
import Language from "@/assets/svgs/language.svg";
import Verify from "@/assets/svgs/verify.svg";
import Employee from "@/assets/svgs/profile/Card.svg"; // Using Card icon for Employee, replace with actual Employee icon
import Logout from "@/assets/svgs/Logout.svg";
import { apiCall } from "~/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import defaultProfile from "@/assets/images/default-profile.png";
import { SafeAreaView } from "react-native-safe-area-context";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  zip: string;
  image: string;
  balance: string;
  country: string;
  gender: string;
  lat: string;
  lng: string;
  state: string;
  status: string;
  timestamp: string;
  user_type: string;
};

export default function Account() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [accountType, setAccountType] = useState("");
  const router = useRouter();
  const [user, setUser] = useState<User>({
    id: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    zip: "",
    image: "",
    balance: "",
    country: "",
    gender: "",
    lat: "",
    lng: "",
    state: "",
    status: "",
    timestamp: "",
    user_type: "",
  });

  useFocusEffect(
    useCallback(() => {
      fetchAccountType();
      fetchUserProfile();
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

  const handleNotificationToggle = async (value: boolean) => {
    console.log("first", value);
  };

  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found");

      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("user_id", userId);

      const response = await apiCall(formData);
      if (response.profile) {
        const profileData = response.profile;
        setUser({
          id: profileData.id || "",
          name: profileData.name || "Username",
          email: profileData.email || "emailaddress",
          phone: profileData.phone || "+92000000000",
          dob: profileData.dob !== "0000-00-00" ? profileData.dob : "",
          address: profileData.address || "",
          city: profileData.city || "",
          zip: profileData.postal || "",
          image: profileData.image || "",
          balance: profileData.balance || "0",
          country: profileData.country || "",
          gender: profileData.gender || "",
          lat: profileData.lat || "",
          lng: profileData.lng || "",
          state: profileData.state || "",
          status: profileData.status || "",
          timestamp: profileData.timestamp || "",
          user_type: profileData.user_type || "",
        });

        // Update account type based on user profile if not already set
        if (profileData.user_type && !accountType) {
          setAccountType(profileData.user_type);
          await AsyncStorage.setItem("account_type", profileData.user_type);
        }
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleNavigation = (title: string) => {
    switch (title) {
      // case "Favourite Buyer":
      //   router.push("/account/favourite_buyer");
      //   break;
      case "Employees":
        router.push("/account/employee");
        break;
      // case "Change Password":
      //   router.push("/account/change_password");
      //   break;
      case "Rate Us":
        // Open rating modal or external link
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
    router.push({
      pathname: "/account/edit_profile",
      params: {
        ...user,
        verified: user.status ? "true" : "false",
      },
    });
  };

  // Update the icon map to include the Employee icon
  const iconMap: { [key: string]: JSX.Element } = {
    Account: <AccountStatus />,
    // FavBuyer: <Favourite />,
    Employee: <Employee />,
    Notification: <Notification />,
    "Rate Us": <Rating />,
    "About App": <About />,
    Support: <Support />,
    Logout: <Logout />,
  };

  // Create the menu items
  const getMenuItems = () => {
    const baseMenuItems = [
      {
        icon: "Account",
        title: "Account Status",
        right: user.state === "1" ? "Verified" : "Unverified",
        rightColor: user.state === "1" ? Colors.success : Colors.danger,
      },
      // This item will be conditionally added based on account type
      {
        icon: "Employee",
        title: "Employees",
        extraRight: "chevron-forward",
      },
      { icon: "Notification", title: "Notification", right: "toggle" },

      { icon: "Rate Us", title: "Rate Us", extraRight: "chevron-forward" },
      { icon: "About App", title: "About App", extraRight: "chevron-forward" },
      { icon: "Support", title: "Support", extraRight: "chevron-forward" },
      { icon: "Logout", title: "Logout", extraRight: "chevron-forward" },
    ];

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
            {user.state === "1" && <Verify style={styles.verifiedIcon} />}
            {user.status === "1" && <View style={styles.onlineIndicator} />}
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
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
            {item.title === "Notification" ? (
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
            ) : (
              <TouchableOpacity onPress={() => handleNavigation(item.title)}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    {iconMap[item.icon]}
                    <Text style={styles.itemText}>{item.title}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    {item.right && (
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
            )}
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
    backgroundColor: Colors.white,
  },
  scrollView: {
    padding: 16,
    flex: 1,
  },
  profileContainer: {
    alignItems: "flex-start",
    marginBottom: 24,
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: 999,
    position: "relative",
  },
  image: {
    width: 96,
    height: 87,
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
    fontSize: 24,
    fontWeight: "700",
    color: Colors.secondary,
    marginTop: 8,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.secondary300,
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
    fontSize: 16,
    color: Colors.secondary,
  },
  itemRightText: {
    fontSize: 14,
  },
});
