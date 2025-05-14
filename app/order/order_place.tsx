import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import Header from "@/components/header";
import OrderDetails from "./order_details";
import ChatScreen from "./chat_screen";
import Button from "@/components/button";
import { Colors } from "~/constants/Colors";
import Popup from "~/components/popup";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "~/utils/api";
import { SafeAreaView } from "react-native-safe-area-context";

// Define the interface for order data
export interface OrderType {
  id: string;
  order_no: string;
  user_id: string;
  cat_id: string;
  to_id: string;
  address: string;
  lat: string;
  lng: string;
  date: string;
  images: string;
  description: string;
  package_id: string;
  payment_method: string;
  method_details: string;
  promo_code: string;
  status: string;
  timestamp: string;
  created_at: string;
  distance: number;
  user: UserType;
  image_url: string;
  // Additional fields needed for UI
  title?: string;
  amount?: string;
  discount?: string;
  provider?: ProviderType | null;
  paymentStatus?: string;
}

interface UserType {
  id: string;
  email: string;
  name: string;
  dob: string;
  user_type: string;
  address: string;
  postal: string;
  image: string;
  phone: string;
  gender: string;
  city: string;
  status: string;
  timestamp: string;
  // Other user fields as needed
}

interface ProviderType {
  id: string;
  name: string;
  image: string;
  rating?: number;
  jobsCompleted?: number;
}

type PopupType = "timeup" | "tipup" | "orderComplete" | "review";

const OrderPlace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Details");
  const [popupType, setPopupType] = useState<PopupType | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [detailsScreen, setDetailsScreen] = useState(true);
  const [orderId, setOrderId] = useState<string | 35>(35);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [provider, setProvider] = useState(true);
  // Effect to show popup whenever popupType updates
  useEffect(() => {
    if (popupType) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  }, [popupType]);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        try {
          const storedOrderId = await AsyncStorage.getItem("order_id");
          const userId = await AsyncStorage.getItem("user_id");

          // setOrderId(storedOrderId);
          setUserId(userId);

          if (orderId) {
            getOrderDetails();
          }
        } catch (error) {
          console.error("Initialization error:", error);
          Alert.alert("Error", "Failed to initialize order details");
        }
      };
      init();
    }, [])
  );
  const getOrderDetails = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("user_id", userId);
    formData.append("id", 12);
    console.log(formData);
    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        // console.log("Order details:", JSON.stringify(response.data[0]));

        // const mockProvider =
        //   response.data[0].to_id === "0"
        //     ? null
        //     : {
        //         id: "123",
        //         name: "Test Provider",
        //         image: "provider.jpg",
        //         rating: 4.7,
        //         jobsCompleted: 124,
        //       };

        // const transformedOrder: OrderType = {
        //   ...response.data[0],
        //   title: `Service Request #${response.data[0].order_no}`,
        //   amount: "195.20",
        //   discount: "5",
        //   provider: mockProvider,
        //   paymentStatus:
        //     response.data[0].payment_method === "Visa Card"
        //       ? "Pay Later"
        //       : "Paid",
        // };
        const orderDetails = response.data[0];
        console.log(response);
        setOrder(orderDetails);
      } else {
        Alert.alert("Error", "No order details found");
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      Alert.alert("Error", "Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = () => {
    setPopupType("orderComplete");
  };

  const handleCancel = () => {
    setPopupType("tipup");
  };

  const handleActiveChat = () => {
    setActiveTab("Chat");
    setDetailsScreen(false);
  };

  const handleDetailsScreen = () => {
    setActiveTab("Details");
    setDetailsScreen(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Header
            backBtn={true}
            title="Loading..."
            icon={true}
            support={true}
          />
          <View style={styles.loadingContainer}>
            <Text>Loading order details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Header
            backBtn={true}
            title="Order Details"
            icon={true}
            support={true}
          />
          <View style={styles.loadingContainer}>
            <Text>No order details available</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          backBtn={true}
          title={`Request #${order.order_no}`}
          icon={true}
          support={true}
        />
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={
              activeTab === "Details" ? styles.activeTab : styles.inactiveTab
            }
            onPress={handleDetailsScreen}
          >
            <Text
              style={
                activeTab === "Details"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              Detail
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={activeTab === "Chat" ? styles.activeTab : styles.inactiveTab}
            onPress={handleActiveChat}
          >
            <Text
              style={
                activeTab === "Chat"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              Chat
            </Text>
          </TouchableOpacity>
        </View>
        {activeTab === "Details" ? (
          <OrderDetails order={order} />
        ) : (
          <ChatScreen />
        )}
      </View>

      {detailsScreen && (
        <View style={styles.footerButtons}>
          <Button
            title="Cancel"
            variant="primary"
            fullWidth={false}
            width="100%"
            onPress={handleCancel}
          />
        </View>
      )}

      {/* Popup with Background Overlay */}
      {showPopup && popupType && (
        <Modal transparent visible={showPopup} animationType="slide">
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.overlayBackground}
              onPress={() => setPopupType(null)}
            />
            <View style={styles.popupContainer}>
              <Popup type={popupType} setShowPopup={setPopupType} />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { flex: 1, padding: 16 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primary300,
    borderRadius: 25,
  },
  activeTab: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: { color: Colors.white, fontSize: 16, fontWeight: "500" },
  inactiveTabText: {
    color: Colors.secondary300,
    fontSize: 16,
    fontWeight: "500",
  },
  inactiveTab: {
    fontSize: 16,
    padding: 16,
    borderRadius: 25,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  popupContainer: {
    backgroundColor: Colors.white,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default OrderPlace;
