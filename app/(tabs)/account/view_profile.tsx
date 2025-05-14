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
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
  phone: string;
  dob: string;
  address: string;
  city: string;
  zip: string;
  image: string | any;
  balance: string;
  gender: string;
  lat: string;
  lng: string;
  state: string;
  status: string;
  timestamp: string;
  user_type: string;
};

export default function ViewProfile(): JSX.Element {
  const [showAllOrders, setShowAllOrders] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();
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
    balance: "0",
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
      console.log(userId);
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("user_id", userId);

      const response = await apiCall(formData);
      if (response.profile || response.user) {
        const profileData = response.profile || response.user;
        setUser({
          id: profileData.id || "",
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          dob: profileData.dob !== "0000-00-00" ? profileData.dob : "",
          address: profileData.address || "",
          city: profileData.city || "",
          zip: profileData.postal || "",
          image: profileData.image || "",
          balance: profileData.balance || "0",
          gender: profileData.gender || "",
          lat: profileData.lat || "",
          lng: profileData.lng || "",
          state: profileData.state || "",
          status: profileData.status || "",
          timestamp: profileData.timestamp || "",
          user_type: profileData.user_type || "",
        });

        // After getting user profile, fetch orders
        fetchOrders(profileData.id);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      Alert.alert("Error", "Failed to load profile information");
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
        <Header title="View Profile" backBtn={true} />

        <View style={styles.profileContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                typeof user.image === "string" && user.image
                  ? { uri: user.image }
                  : require("@/assets/images/default-profile.png")
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
            {user.status === "1" && <View style={styles.onlineIndicator} />}
            {user.user_type === "verified" && (
              <MaterialIcons
                style={styles.verifiedIcon}
                name="verified"
                size={24}
                color="#2AB749"
              />
            )}
          </View>

          <Text style={styles.userName}>{user.name || "Unnamed User"}</Text>

          <View style={styles.ratingContainer}>
            <Star />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.reviewCount}>(120+ reviews)</Text>
          </View>

          <Text style={styles.balance}>Balance: SAR {user.balance}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.locationContainer}>
            <LocationIcon />
            <Text style={styles.locationText}>
              {user.address || "Your City"}, {user.city || "Your Country"}
            </Text>
          </View>
        </View>

        <Button
          variant="secondary"
          title="Edit Profile"
          onPress={handleEditProfile}
        />

        <Seprator />

        <TouchableOpacity
          onPress={() => setShowAllOrders(!showAllOrders)}
          style={styles.orderToggle}
        >
          <Text style={styles.orderTitle}>
            Completed Orders{" "}
            <Text style={styles.orderCount}>({orders.length})</Text>
          </Text>
          <Ionicons
            name={showAllOrders ? "chevron-down" : "chevron-forward"}
            size={20}
            color={Colors.secondary}
          />
        </TouchableOpacity>

        {isLoading ? (
          <Text style={styles.loadingText}>Loading orders...</Text>
        ) : (
          showAllOrders &&
          (orders.length > 0 ? (
            orders.map((order, index) => (
              <ServiceDetailsCard key={index} order={order} />
            ))
          ) : (
            <Text style={styles.noOrdersText}>No orders found</Text>
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
    padding: 16,
    paddingBottom: 160,
  },
  profileContainer: {
    alignItems: "flex-start",
    marginBottom: 24,
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: "green",
    borderRadius: 999,
    position: "relative",
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
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.secondary,
    marginTop: 12,
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
  },
  balance: {
    color: Colors.secondary300,
    fontSize: 18,
  },
  userEmail: {
    color: Colors.secondary300,
    fontSize: 16,
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
    fontSize: 16,
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
    fontWeight: "normal",
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
