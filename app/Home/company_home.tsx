import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";

// Type definitions
type DocumentItem = {
  type: string;
  side: string;
  file: string;
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
  iqamaId: string;
  documentType: string;
  documentFront: string;
  documentBack: string;
  image: string;
  documents: DocumentItem[];
  verified: boolean;
  company_number: string;
  company_code: string;
  user_type: string;
};

type Order = {
  id: string;
  order_number: string;
  employee_name: string;
  package_type: "Express" | "Standard";
  status: "active" | "completed" | "cancelled";
  image?: string;
};

type OrderStats = {
  active: number;
  completed: number;
  cancelled: number;
};

// Sample order data (replace with API data later)
const sampleOrders: Order[] = [
  {
    id: "1",
    order_number: "123KH567091",
    employee_name: "Shazad Khan",
    package_type: "Express",
    status: "active",
    image: require("~/assets/images/logo.png"),
  },
  {
    id: "2",
    order_number: "123KH567091",
    employee_name: "Abdul Malik",
    package_type: "Standard",
    status: "completed",
    image: require("~/assets/images/logo.png"), // Update path as needed
  },
  {
    id: "3",
    order_number: "123KH567091",
    employee_name: "Shazad Khan",
    package_type: "Express",
    status: "active",
    image: require("~/assets/images/logo.png"), // Update path as needed
  },
  {
    id: "4",
    order_number: "123KH567091",
    employee_name: "Shazad Khan",
    package_type: "Express",
    status: "active",
    image: require("~/assets/images/logo.png"), // Update path as needed
  },
  {
    id: "5",
    order_number: "123KH567091",
    employee_name: "Shazad Khan",
    package_type: "Express",
    status: "active",
    image: require("~/assets/images/logo.png"), // Update path as needed
  },
];

// Sample order stats (replace with API data later)
const sampleStats: OrderStats = {
  active: 10,
  completed: 804,
  cancelled: 21,
};

const CompanyHome = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [orderStats, setOrderStats] = useState<OrderStats>(sampleStats);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>(
    "https://7tracking.com/saudiservices/images/"
  );

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem("user_id");
      if (!storedUserId) throw new Error("User ID not found");

      setUserId(storedUserId);
      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("user_id", storedUserId);

      const response = await apiCall(formData);

      if (response.profile || response.user) {
        const profileData = response.profile || response.user;

        // Parse documents if they exist
        let parsedDocuments: DocumentItem[] = [];

        if (
          profileData.documents &&
          typeof profileData.documents === "string"
        ) {
          try {
            // Clean up the escaped string
            const cleaned = profileData.documents
              .replace(/\\"/g, '"')
              .replace(/^"|"$/g, "");

            parsedDocuments = JSON.parse(cleaned);
          } catch (e) {
            console.error("Failed to parse documents:", e);
          }
        }

        let frontDoc = parsedDocuments.find((doc) => doc.side === "front");
        let backDoc = parsedDocuments.find((doc) => doc.side === "back");

        setUser({
          id: profileData.id || "",
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          dob: profileData.dob !== "0000-00-00" ? profileData.dob : "",
          address: profileData.address || "",
          city: profileData.city || "",
          zip: profileData.postal || "",
          iqamaId: profileData.iqama_id || "",
          documentType:
            parsedDocuments.length > 0 ? parsedDocuments[0].type : "Passport",
          documentFront: frontDoc ? frontDoc.file : "",
          documentBack: backDoc ? backDoc.file : "",
          image: profileData.image || "",
          documents: parsedDocuments,
          verified: profileData.company_verified === "1",
          company_number: profileData.company_number || "",
          company_code: profileData.company_code || "",
          user_type: profileData.user_type || "",
        });

        // Here you would also fetch orders and stats
      } else {
        throw new Error(response.message || "Failed to load profile.");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return imageBaseUrl + imagePath;
  };

  const copyCompanyNumber = () => {
    if (user?.company_code) {
      // In a real app, you'd use Clipboard.setString(user.company_code);
      Alert.alert("Copied", "Company number copied to clipboard");
    }
  };

  // Component for the order breakdown stats
  const OrderBreakdown = ({ stats }: { stats: OrderStats }) => (
    <View style={styles.orderBreakdownContainer}>
      <View style={styles.orderBreakdownHeader}>
        <MaterialIcons name="inventory" size={24} color={Colors.primary} />
        <Text style={styles.orderBreakdownTitle}>Orders Breakdown</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>
    </View>
  );

  // Component for each order item
  const OrderItem = ({ order }: { order: Order }) => (
    <View style={styles.orderItemContainer}>
      <View style={styles.orderImageContainer}>
        {order.image ? (
          <Image source={order.image} style={styles.orderImage} />
        ) : (
          <View style={styles.orderImagePlaceholder} />
        )}
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderNumber}>Order# {order.order_number}</Text>
        <Text style={styles.employeeName}>Employee: {order.employee_name}</Text>
      </View>

      <View style={styles.packageContainer}>
        <Text
          style={[
            styles.packageType,
            {
              color:
                order.package_type === "Express"
                  ? Colors.primary
                  : Colors.secondary,
            },
          ]}
        >
          {order.package_type}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Top Profile Header */}
        <View style={styles.profileHeaderContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {user?.image ? (
                <Image
                  source={{ uri: getImageUrl(user.image) }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImagePlaceholderText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.companyName}>
                {user?.name || "Your Servo"}
              </Text>

              <View style={styles.companyNumberContainer}>
                <Text style={styles.companyNumberLabel}>
                  Company# {user?.company_code || "23FR54672342IOU3"}
                </Text>

                <TouchableOpacity onPress={copyCompanyNumber}>
                  <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Ratings */}
          <View style={styles.ratingsContainer}>
            <Ionicons name="star" size={24} color="#FFC107" />
            <Text style={styles.ratingsText}>4.9 (120+ review)</Text>
          </View>
        </View>
        {/* Order Breakdown */}
        <OrderBreakdown stats={orderStats} />

        {/* Recent Orders */}
        <View style={styles.recentOrdersHeader}>
          <Text style={styles.recentOrdersTitle}>Recent Orders</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Ionicons name="arrow-forward" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Order List */}
        {orders.map((order) => (
          <OrderItem key={order.id} order={order} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileHeaderContainer: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
    paddingBottom: 60,
  },
  profileHeader: {
    backgroundColor: "#1c3d87", // Darker blue
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4d74cb",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImagePlaceholderText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  companyName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyNumberLabel: {
    color: "#a6b3d6",
    fontSize: 14,
  },
  ratingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  ratingsText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    color: "#fff",
  },
  orderBreakdownContainer: {
    marginHorizontal: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginTop: -60,
    marginBottom: 20,
  },
  orderBreakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  orderBreakdownTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  recentOrdersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  recentOrdersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
  },
  viewAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  orderItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  orderImageContainer: {
    marginRight: 12,
  },
  orderImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  orderImagePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
  orderDetails: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.secondary,
  },
  employeeName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  packageContainer: {
    padding: 8,
  },
  packageType: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CompanyHome;
