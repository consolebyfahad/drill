import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";
import { useFocusEffect, useRouter } from "expo-router";
import Clipboard from "@react-native-clipboard/clipboard";
import Orderbreakdown from "@/assets/svgs/orderbreakdown.svg";
import { FONTS } from "~/constants/Fonts";
type User = {
  id: string;
  name: string;
  image: string;
  verified: boolean;
  company_number: string;
  company_code: string;
  user_type: string;
};

type OrderStats = {
  active: number;
  completed: number;
  cancelled: number;
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

const CompanyHome = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [copied, setCopied] = useState(false);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    active: 0,
    completed: 0,
    cancelled: 0,
  });

  const [imageBaseUrl] = useState<string>(
    "https://7tracking.com/saudiservices/images/"
  );

  const loadData = useCallback(async () => {
    try {
      await Promise.all([fetchCompanyProfile(), fetchOrders()]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const fetchCompanyProfile = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("user_id");
      if (!storedUserId) throw new Error("User ID not found");

      const formData = new FormData();
      formData.append("type", "company_dashboard");
      formData.append("user_id", storedUserId);

      const response = await apiCall(formData);

      if (response.user) {
        const profileData = response.user;
        setUser({
          id: profileData.id || "",
          name: profileData.name || "",
          image: profileData.image || "",
          verified: profileData.company_verified === "1",
          company_number: profileData.company_number || "",
          company_code: profileData.company_code || "",
          user_type: profileData.user_type || "",
        });

        // Set order stats
        setOrderStats({
          active: parseInt(response.active_orders) || 0,
          completed: parseInt(response.completed_orders) || 0,
          cancelled: parseInt(response.cancelled_orders) || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching company profile:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) return;

      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "orders");
      formData.append("company_id", userId);

      const response = await apiCall(formData);

      if (response && response.data && response.data.length > 0) {
        const transformedOrders = response.data.map((order: any) => {
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

  const copyCompanyNumber = async () => {
    if (user?.company_code) {
      try {
        await Clipboard.setString(user.company_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const handleOrderPress = (order: Order) => {
    // router.push({
    //   pathname: "/order_place",
    //   params: { orderId: order.id },
    // });
  };

  // Component for the order breakdown stats
  const OrderBreakdown = ({ stats }: { stats: OrderStats }) => (
    <View style={styles.orderBreakdownContainer}>
      <View style={styles.orderBreakdownHeader}>
        {/* <MaterialIcons name="inventory" size={24} color={Colors.primary} /> */}
        <Orderbreakdown />
        <Text style={styles.orderBreakdownTitle}>
          {t("ordersBreakdown") || "Orders Breakdown"}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>{t("active") || "Active"}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>
            {t("status_completed") || "Completed"}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.cancelled}</Text>
          <Text style={styles.statLabel}>{t("cancelled") || "Cancelled"}</Text>
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
        <Text style={styles.orderNumber}>
          {t("orderNumber") || "Order#"} {order.orderNo}
        </Text>
        <Text style={styles.employeeName}>
          {t("provider") || "Provider"}: {order.provider}
        </Text>
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
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} />
          }
        >
          {/* Top Profile Header */}
          <View style={styles.profileHeaderContainer}>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                {user?.image ? (
                  <Image
                    source={{ uri: getImageUrl(user.image) || "" }}
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
                <View>
                  <Text style={styles.companyName}>
                    {user?.name || t("yourCompany") || "Your Company"}
                  </Text>

                  <Text style={styles.companyNumberLabel}>
                    {t("account.companyNumber") || "Company#"}{" "}
                    {user?.company_code || "N/A"}
                  </Text>
                </View>

                {copied ? (
                  <Text style={styles.copiedText}>
                    {t("copied") || "Copied!"}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={copyCompanyNumber}
                    style={styles.copy}
                  >
                    <Ionicons
                      name="copy-outline"
                      size={20}
                      color="#FFFFFF"
                      style={{ transform: [{ scaleX: -1 }] }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Ratings */}
            <View style={styles.ratingsContainer}>
              <Ionicons name="star" size={22} color="#ffff" />
              <Text style={styles.ratingsText}>
                4.9 (120+ {t("review") || "review"})
              </Text>
            </View>
          </View>

          {/* Order Breakdown */}
          <OrderBreakdown stats={orderStats} />

          {/* Recent Orders */}
          <View style={styles.recentOrdersHeader}>
            <Text style={styles.recentOrdersTitle}>{t("recentOrders")}</Text>
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
              <Text style={styles.noOrdersText}>{t("noRecentOrders")}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  scrollContainer: {
    flexGrow: 1,
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
    flex: 1,
    width: "100%",
    backgroundColor: "#002f9c",
    borderRadius: 20,
    padding: 24,
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
    fontFamily: FONTS.bold,
  },
  profileInfo: {
    width: "70%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyName: {
    color: Colors.white,
    fontSize: 30,
    fontFamily: FONTS.bold,
    marginBottom: 5,
  },
  companyNumberLabel: {
    color: "#a6b3d6",
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  copiedText: {
    width: "70%",
    color: "#4CAF50",
    fontSize: 14,
    fontStyle: "italic",
    fontFamily: FONTS.regular,
  },
  copy: {
    width: "20%",
    backgroundColor: "#3359b0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
  },
  ratingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  ratingsText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
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
    color: Colors.secondary,
    fontSize: 18,
    fontFamily: FONTS.medium,
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
    fontFamily: FONTS.bold,
    color: Colors.secondary,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.semiBold,
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
    fontFamily: FONTS.semiBold,
    color: Colors.secondary,
  },
  employeeName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  packageContainer: {
    padding: 8,
  },
  packageType: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  noOrdersContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  noOrdersText: {
    fontSize: 16,
    color: "#666",
    fontFamily: FONTS.medium,
  },
});

export default CompanyHome;
