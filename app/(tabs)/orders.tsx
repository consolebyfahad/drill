import Header from "@/components/header";
import ServiceDetailsCard from "@/components/service_details_card";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiCall } from "~/utils/api";

// Order type definition
export type Order = {
  id: string;
  order_no: string;
  created_at: string;
  status: string;
  payment_method: string;
  address: string;
  description: string;
  image_url?: string;
  images?: string;
  cat_id: string;
  // UI specific fields
  title?: string;
  amount?: string;
  discount?: string;
  provider?: string;
  rating?: string;
  tip?: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [items, setItems] = useState([
    { label: "All", value: "All" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
  ]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          const user_id = await AsyncStorage.getItem("user_id");
          setUserId(user_id);
          fetchOrders();
        } catch (error) {
          console.error("Initialization error:", error);
          Alert.alert("Error", "Failed to initialize orders");
        }
      };
      init();
    }, [])
  );

  const fetchOrders = async () => {
    setIsLoading(true);
    const userId = await AsyncStorage.getItem("user_id");

    if (!userId) throw new Error("User ID not found");
    console.log(userId);

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("user_id", userId);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const transformedOrders = response.data.map((order: any) => ({
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

  const handleOrderScreen = (order: Order) => {
    // Store the order ID in AsyncStorage for the order place screen
    AsyncStorage.setItem("order_id", order.id).then(() => {
      router.push("/order/order_place");
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
        <Header title="Orders" icon={true} />

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
            placeholder="Filter by status"
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
          <View>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading orders...</Text>
              </View>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <ServiceDetailsCard
                  key={index}
                  order={{
                    id: order.order_no,
                    title: order.title || `Service `,
                    status: order.status,
                    amount: order.amount || "0.00",
                    discount: order.discount || "0",
                    date: order.created_at,
                    provider: order.provider || "Unassigned",
                    paymentStatus: order.payment_method,
                    rating: order.rating || "0",
                    tip: order.tip || "0",
                    image: { uri: order.image_url },
                  }}
                  orderScreen={true}
                  onPress={() => handleOrderScreen(order)}
                />
              ))
            ) : (
              <View style={styles.noOrdersContainer}>
                <Text>No orders found</Text>
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
    padding: 20,
    alignItems: "center",
  },
  noOrdersContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
