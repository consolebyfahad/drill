import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import React, { useState, useCallback, useRef, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import Header from "@/components/header";
import ServiceDetailsCard from "@/components/service_details_card";
import { Colors } from "@/constants/Colors";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "~/utils/api";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [filterStatus, setFilterStatus] = useState("All");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (showStatusDropdown) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowStatusDropdown(false));
    } else {
      setShowStatusDropdown(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("user_id");
          if (storedUserId) {
            setUserId(storedUserId);
            fetchOrders(storedUserId);
          }
        } catch (error) {
          console.error("Initialization error:", error);
          Alert.alert("Error", "Failed to initialize orders");
        }
      };
      init();
    }, [])
  );

  const fetchOrders = async (userId: string) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("to_id", userId);

    try {
      const response = await apiCall(formData);
      if (response?.data?.length > 0) {
        const transformed = response.data.map(
          (order: any): Order => ({
            ...order,
            title: order.cat_name || "Service",
            amount: order.order_price || "0",
            discount: order.discount || "0",
            provider:
              order.to_id !== "0"
                ? order.provider || "Assigned Provider"
                : "Waiting for provider",
            rating: order.rating || "0",
            tip: order.tip || "0",
            image_url: order.image_url,
            images: order.images,
          })
        );
        setOrders(transformed);
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
    AsyncStorage.setItem("order_id", order.id).then(() => {
      router.push("/order/order_place");
    });
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
  };

  const filteredOrders =
    filterStatus === "All"
      ? orders
      : orders.filter(
          (order) => order.status?.toLowerCase() === filterStatus.toLowerCase()
        );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <Header title="Orders" icon />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ position: "relative" }}>
            <TouchableOpacity style={styles.dropdown} onPress={toggleDropdown}>
              <Text>{filterStatus}</Text>
              <Ionicons
                name={showStatusDropdown ? "chevron-up" : "chevron-down"}
                size={18}
                color="black"
              />
            </TouchableOpacity>

            {showStatusDropdown && (
              <Animated.View
                style={[
                  styles.dropdownList,
                  {
                    opacity: dropdownAnim,
                    transform: [
                      {
                        scaleY: dropdownAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {["All", "pending", "completed"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleFilterChange(status);
                      toggleDropdown();
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{status}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading orders...</Text>
            </View>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <ServiceDetailsCard
                key={order.id || index.toString()}
                order={{
                  id: order.order_no,
                  title: order.title || `Service #${order.order_no}`,
                  status: order.status,
                  amount: order.amount || "0.00",
                  discount: order.discount || "0",
                  date: order.created_at,
                  provider: order.provider || "Unassigned",
                  paymentStatus: order.payment_method,
                  rating: order.rating || "0",
                  tip: order.tip || "0",
                  image: { uri: order.images },
                }}
                orderScreen
                onPress={() => handleOrderScreen(order)}
              />
            ))
          ) : (
            <View style={styles.noOrdersContainer}>
              <Text>No orders found</Text>
            </View>
          )}
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
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary300,
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
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
  dropdownList: {
    position: "absolute",
    top: 65,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 8,
    zIndex: 10,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "black",
  },
});
