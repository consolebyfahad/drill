import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";
import { useRouter } from "expo-router";

// Get screen dimensions
const { width, height } = Dimensions.get("window");

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
  image: string;
  verified: boolean;
  company_number: string;
  company_code: string;
  user_type: string;
};

type Order = {
  id?: string;
  orderNo: string;
  amount: string;
  discount: string;
  paymentStatus: string;
  provider: string;
  image: any;
  packageName?: string;
  status?: "active" | "completed" | "cancelled";
};

type OrderStats = {
  active: number;
  completed: number;
  cancelled: number;
};

const CompanyHome = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    active: 0,
    completed: 0,
    cancelled: 0,
  });
  const [imageBaseUrl, setImageBaseUrl] = useState<string>(
    "https://7tracking.com/saudiservices/images/"
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchUserProfile(), fetchOrders()]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");
      if (!storedUserId) throw new Error("User ID not found");

      const formData = new FormData();
      formData.append("type", "company");
      formData.append("user_id", storedUserId);

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
          iqamaId: profileData.iqama_id || "",
          image: profileData.image || "",
          verified: profileData.company_verified === "1",
          company_number: profileData.company_number || "",
          company_code: profileData.company_code || "",
          user_type: profileData.user_type || "",
        });
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchOrders = async () => {
    const userId = await AsyncStorage.getItem("user_id");
    if (!userId) return;

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("company_id", userId);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        let activeCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;

        const transformedOrders = response.data.map((order: any) => {
          // Count orders by status
          if (order.status === "pending") activeCount++;
          else if (order.status === "completed") completedCount++;
          else if (order.status === "cancelled") cancelledCount++;

          // Get image from category if available
          const categoryImage =
            order.category && order.category.image
              ? { uri: imageBaseUrl + order.category.image }
              : require("@/assets/images/cleaning_service.png");

          return {
            id: order.id || "",
            orderNo: order.cat_name || "Service",
            amount: order.order_price || "0",
            discount: order.discount || "0",
            paymentStatus: order.payment_method || "Unknown",
            provider:
              order.provider && order.provider.name
                ? order.provider.name
                : "Waiting for provider",
            packageName: order.package_name || "Standard",
            status: order.status === "pending" ? "active" : order.status,
            image: categoryImage,
          };
        });

        setOrderStats({
          active: activeCount,
          completed: completedCount,
          cancelled: cancelledCount,
        });
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return imageBaseUrl + imagePath;
  };

  const copyCompanyNumber = () => {
    if (user?.company_code) {
      // In a real app, you'd use Clipboard.setString(user.company_code);
      Alert.alert("Copied", "Company number copied to clipboard");
    }
  };

  const handleOrderPress = (order: Order) => {
    // Navigate to order details screen
    router.push({
      pathname: "/order_place",
      params: { orderId: order.id },
    });
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
    <TouchableOpacity
      style={styles.orderItemContainer}
      onPress={() => handleOrderPress(order)}
    >
      <View style={styles.orderImageContainer}>
        {order.image ? (
          <Image source={order.image} style={styles.orderImage} />
        ) : (
          <View style={styles.orderImagePlaceholder} />
        )}
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderNumber}>Order# {order.orderNo}</Text>
        <Text style={styles.employeeName}>Provider: {order.provider}</Text>
      </View>

      <View style={styles.packageContainer}>
        <Text
          style={[
            styles.packageType,
            {
              color:
                order.packageName === "Express"
                  ? Colors.primary
                  : Colors.secondary,
            },
          ]}
        >
          {order.packageName || "Standard"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
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
                  {user?.name || "Your Company"}
                </Text>

                <View style={styles.companyNumberContainer}>
                  <Text style={styles.companyNumberLabel}>
                    Company# {user?.company_number || "N/A"}
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
          {orders.length > 0 ? (
            orders.map((order, index) => (
              <OrderItem key={`order-${index}`} order={order} />
            ))
          ) : (
            <View style={styles.noOrdersContainer}>
              <Text style={styles.noOrdersText}>No recent orders found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  profileHeaderContainer: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
    paddingBottom: 60,
    width: "100%",
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
    borderRadius: 8,
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
  noOrdersContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  noOrdersText: {
    fontSize: 16,
    color: "#666",
  },
});

export default CompanyHome;
