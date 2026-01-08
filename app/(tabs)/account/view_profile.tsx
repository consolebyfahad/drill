import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import ServiceDetailsCard from "@/components/service_details_card";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import Header from "@/components/header";
import Button from "@/components/button";
import Seprator from "@/components/seprator";
import { Colors } from "@/constants/Colors";
import Star from "@/assets/svgs/Star.svg";
import LocationIcon from "@/assets/svgs/locationIcon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "~/utils/api";
import { SafeAreaView } from "react-native-safe-area-context";
import Verify from "@/assets/svgs/verify.svg";
import defaultProfile from "@/assets/images/default-profile.png";
import { FONTS } from "~/constants/Fonts";

type Order = {
  id: string;
  order_no: string;
  user_id: string;
  cat_id: string;
  cat_name: string;
  to_id: string;
  address: string;
  lat: string;
  lng: string;
  date: string;
  images: string;
  description: string;
  package_id: string;
  package_name: string;
  order_price: string;
  discount: string;
  payment_method: string;
  method_details: string;
  promo_code: string;
  status: string;
  timestamp: string;
  created_at: string;
  distance: number;
  provider: string;
  title?: string;
  amount?: string;
  paymentStatus?: string;
  image?: any;
};

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

export default function ViewProfile() {
  const { t } = useTranslation();
  const [showAllOrders, setShowAllOrders] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [accountType, setAccountType] = useState("");
  const navigation = useNavigation();
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
      fetchUserProfile();
    }, [])
  );

  const fetchOrders = async (userId?: string) => {
    setIsLoading(true);
    const storedUserId = userId || (await AsyncStorage.getItem("user_id"));

    if (!storedUserId) {
      console.error("User ID not found");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("user_id", storedUserId);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        // Filter completed orders only
        const completedOrders = response.data.filter(
          (order: any) => order.status?.toLowerCase() === "completed"
        );

        const transformedOrders = completedOrders.map((order: any) => ({
          ...order,
          title: order.cat_name || "Service",
          amount: order.order_price || "0",
          discount: order.discount || "0",
          paymentStatus: order.payment_method || "Unknown",
          provider:
            order.to_id !== "0"
              ? order.provider || "Assigned Provider"
              : "Waiting for provider",
          image: require("@/assets/images/cleaning_service.png"),
        }));

        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

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
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleEditProfile = () => {
    router.push("/account/edit_profile");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <Header title={t("profile.viewProfile")} backBtn={true} />

        <View style={styles.profileContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={user.image ? { uri: user.image } : defaultProfile}
              style={styles.profileImage}
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

          <Text style={styles.userName}>{user.name || "Unnamed User"}</Text>

          <View style={styles.ratingContainer}>
            <Star />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.reviewCount}>(120+ {t("profile.reviews")})</Text>
          </View>
          <Text style={styles.userEmail}>
            {t("profile.totalEarning")}{user.balance}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {accountType === "employee" && (
            <View style={styles.verification}>
              <Text style={styles.userEmail}>{t("profile.companyVerification")}</Text>
              <Verify />
            </View>
          )}
          {user.platform_status === "1" && (
            <View style={styles.verification}>
              <Text style={styles.userEmail}>{t("profile.platformVerification")}</Text>
              <Verify />
            </View>
          )}
          <View style={styles.locationContainer}>
            <LocationIcon />
            <Text style={styles.locationText}>
              {user.address || "Your City"}, {user.city || "Your Country"}
            </Text>
          </View>
        </View>

        <Button
          variant="secondary"
          title={t("profile.editProfile")}
          onPress={handleEditProfile}
        />

        <Seprator />

        <TouchableOpacity
          onPress={() => setShowAllOrders(!showAllOrders)}
          style={styles.orderToggle}
        >
          <Text style={styles.orderTitle}>
            {t("profile.completedOrders")}{" "}
            <Text style={styles.orderCount}>({orders.length})</Text>
          </Text>
          <Ionicons
            name={showAllOrders ? "chevron-down" : "chevron-forward"}
            size={20}
            color={Colors.secondary}
          />
        </TouchableOpacity>

        {isLoading ? (
          <Text style={styles.loadingText}>{t("profile.loadingOrders")}</Text>
        ) : (
          showAllOrders &&
          (orders.length > 0 ? (
            orders.map((order, index) => (
              <ServiceDetailsCard key={index} order={order} />
            ))
          ) : (
            <Text style={styles.noOrdersText}>{t("profile.noOrdersFound")}</Text>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    paddingHorizontal: 24,
  },
  profileContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 999,
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    height: 96,
    width: 96,
    borderRadius: 999,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "green",
    height: 24,
    width: 24,
    borderRadius: 999,
    borderWidth: 1,
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingText: {
    fontWeight: "500",
    color: Colors.secondary,
  },
  reviewCount: {
    color: Colors.gray300,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  balance: {
    color: Colors.secondary300,
    fontSize: 17,
    fontFamily: FONTS.regular,
  },
  userEmail: {
    color: Colors.secondary300,
    fontSize: 17,
    fontFamily: FONTS.regular,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    color: Colors.secondary300,
    fontSize: 17,
    fontFamily: FONTS.regular,
  },
  verification: {
    flexDirection: "row",
    alignContent: "center",
    gap: 4,
  },
  orderToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTitle: {
    fontWeight: "bold",
  },
  orderCount: {
    fontSize: 14,
    color: Colors.secondary300,
    fontFamily: FONTS.regular,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.secondary300,
  },
  noOrdersText: {
    textAlign: "center",
    marginTop: 20,
    color: Colors.secondary300,
  },
});
