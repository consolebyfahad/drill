import Header from "@/components/header";
import ServiceDetailsCard from "@/components/service_details_card";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "~/constants/Fonts";
import { apiCall } from "~/utils/api";

export type OrderApiResponse = {
  id: string;
  order_no: string;
  created_at: string;
  timestamp: string;
  status: string;
  payment_method: string;
  payment_status?: string;
  amount?: string;
  discount?: string;
  address: string;
  description: string;
  image_url?: string;
  images?: string;
  cat_id: string;
  rating?: string;
  tipped?: string;
  user?: {
    id: string;
    name: string;
    image?: string;
  };
  provider?: {
    id: string;
    name: string;
    image?: string;
  };
  category?: {
    id: string;
    name: string;
    image?: string;
  };
  package?: any;
};

export type Order = {
  id: string;
  title?: string;
  orderId?: string;
  status: string;
  amount?: string;
  discount?: string;
  date?: string;
  customer?: string;
  provider?: string;
  paymentStatus?: string;
  rating?: string;
  tip?: string;
  image?: any; // React Native image source
  imageUrl?: string;
};

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [items, setItems] = useState([
    { label: t("status_all"), value: "All" },
    { label: t("status_pending"), value: "pending" },
    { label: t("status_completed"), value: "completed" },
    { label: t("status_accepted"), value: "accepted" },
    { label: t("status_cancelled"), value: "cancelled" },
  ]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const fetchOrders = async () => {
    setIsLoading(true);
    const userId = await AsyncStorage.getItem("user_id");
    const userType = await AsyncStorage.getItem("user_type");
    console.log(userType);
    console.log(userId);
    if (!userId) {
      setIsLoading(false);
      throw new Error("User ID not found");
    }

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append(userType === "employee" ? "to_id" : "company_id", userId);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orders = response.data;
        setOrders(orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
      Alert.alert(t("error"), t("errorLoadOrders"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderScreen = (order: Order) => {
    router.push({
      pathname: "/order/order_place",
      params: {
        orderId: order.id,
      },
    });
  };

  // Filter orders based on selected status
  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === filterStatus.toLowerCase()
        );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Header title={t("orders")} />

        {/* Dropdown Picker */}
        <View style={styles.dropdownContainer}>
          <DropDownPicker
            open={open}
            value={filterStatus}
            items={items}
            setOpen={setOpen}
            setValue={setFilterStatus}
            setItems={setItems}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropDownContainerStyle={styles.dropdownList}
            listItemContainerStyle={styles.dropdownItem}
            placeholder={t("filterByStatus")}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            open && { paddingTop: 120 }, // Add padding when dropdown is open
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ordersContainer}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>{t("loadingOrders")}</Text>
              </View>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <ServiceDetailsCard
                  key={`order-${order.id}`}
                  order={order}
                  orderScreen={true}
                  onPress={() => handleOrderScreen(order)}
                />
              ))
            ) : (
              <View style={styles.noOrdersContainer}>
                <Text style={styles.noOrdersText}>{t("noOrdersFound")}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  innerContainer: {
    padding: 16,
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  ordersContainer: {
    marginTop: 8,
  },
  dropdownContainer: {
    marginVertical: 16,
    zIndex: 5000,
  },
  dropdown: {
    backgroundColor: Colors.primary300,
    borderWidth: 0,
    borderRadius: 16,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.secondary,
  },
  dropdownList: {
    backgroundColor: "#fff",
    borderColor: Colors.gray200,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    height: 50,
    justifyContent: "center",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.secondary,
  },
  noOrdersContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  noOrdersText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
});
