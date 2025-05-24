// Provider app
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import Header from "@/components/header";
import OrderDetails from "./order_details";
import ChatScreen from "./chat_screen";
import Button from "@/components/button";
import { Colors } from "~/constants/Colors";
import Popup from "~/components/popup";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { apiCall } from "~/utils/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { OrderType } from "~/types/dataTypes";
import {
  getFCMToken,
  requestFCMPermission,
  setupNotificationListeners,
} from "~/utils/notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "~/components/ToastProvider";
import { FONTS } from "~/constants/Fonts";

type PopupType = "timeup" | "tipup" | "orderComplete" | "review";

interface NotificationData {
  order_id?: string;
  status?: string;
  message?: string;
}

interface UserLocationData {
  userId: string | null;
  latitude: string | null;
  longitude: string | null;
}

const OrderPlace: React.FC = () => {
  const { showToast } = useToast();
  const { orderId, tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<string>(
    tab ? String(tab) : "Details"
  );
  const [popupType, setPopupType] = useState<PopupType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderType | null>(null);
  const [tipAmount, setTipAmount] = useState("");
  const [userLocationData, setUserLocationData] = useState<UserLocationData>({
    userId: null,
    latitude: null,
    longitude: null,
  });

  const showPopup = popupType !== null;

  // Single useEffect to initialize all data
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        // Initialize FCM
        await requestFCMPermission();
        const token = await getFCMToken();
        console.log("📲 Provider OrderPlace - User FCM Token:", token);

        // Get all required data from AsyncStorage
        const [storedUserId, storedLatitude, storedLongitude] =
          await Promise.all([
            AsyncStorage.getItem("user_id"),
            AsyncStorage.getItem("latitide"), // Note: keeping original typo to match existing code
            AsyncStorage.getItem("longitude"),
          ]);

        // Set user location data
        setUserLocationData({
          userId: storedUserId,
          latitude: storedLatitude,
          longitude: storedLongitude,
        });

        console.log("📍 User Data:", {
          userId: storedUserId,
          latitude: storedLatitude,
          longitude: storedLongitude,
        });
      } catch (error) {
        console.error("Error initializing app data:", error);
        showToast("Failed to initialize application data", "error");
      }
    };

    const handleNotificationPress = async (data: NotificationData) => {
      console.log("🚨 Provider OrderPlace - Notification received:", data);

      if (data?.order_id === String(orderId)) {
        // Refresh order details when notification is received
        await getOrderDetails();

        // Show toast notification for the received status
        if (data?.status && data?.message) {
          showToast(data.message, "info");
        }

        // Handle different status notifications
        if (data?.status === "tipped" && data.message) {
          const tipMatch = data.message.match(/\$(\d+(\.\d+)?)/);
          if (tipMatch) {
            setTipAmount(tipMatch[1]);
            setPopupType("tipup");
            showToast(`You received a tip of $${tipMatch[1]}!`, "success");
          }
        } else if (data?.status === "completed") {
          setPopupType("review");
          showToast("Order has been completed by customer", "success");
        } else if (data?.status === "time_exceeded") {
          setPopupType("timeup");
          showToast("Time limit exceeded for this order", "warning");
        } else if (data?.status === "started") {
          showToast("Customer has started the service", "info");
        } else if (data?.status === "cancelled") {
          showToast("Order has been cancelled by customer", "warning");
        }
      }
    };

    initializeAppData();
    const unsubscribe = setupNotificationListeners(handleNotificationPress);

    return () => {
      unsubscribe();
    };
  }, [orderId, showToast]);

  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        getOrderDetails();
      }
      return () => {};
    }, [orderId])
  );

  const getOrderDetails = async () => {
    if (!orderId) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("id", String(orderId));

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orderData = response.data[0];

        if (order && order.status !== orderData.status) {
          handleOrderStatusChange(order.status, orderData.status);
        }

        setOrder(orderData);
      } else {
        showToast("No order details found", "error");
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      showToast("Failed to fetch order details", "error");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderStatusChange = (oldStatus: string, newStatus: string) => {
    console.log(`Order status changed from ${oldStatus} to ${newStatus}`);

    // Show appropriate notifications based on status changes
    if (newStatus === "started") {
      showToast("Customer has started the service", "info");
    } else if (newStatus === "completed") {
      setPopupType("review");
      showToast("Order has been completed", "success");
    } else if (newStatus === "tipped") {
      // If tip amount is available in the order data, use it
      const tipValue = order?.tip_amount || "0";
      setTipAmount(tipValue);
      setPopupType("tipup");
      showToast(`You received a tip of $${tipValue}!`, "success");
    } else if (newStatus === "cancelled") {
      showToast("Order has been cancelled", "warning");
    }
  };

  const handleCancel = async () => {
    if (!userLocationData.userId) {
      showToast("User information not available", "error");
      return;
    }

    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        onPress: async () => {
          if (orderId) {
            setIsLoading(true);

            const formData = new FormData();
            formData.append("type", "add_data");
            formData.append("table_name", "order_history");
            formData.append("user_id", userLocationData.userId || "");
            formData.append("lat", userLocationData.latitude || "");
            formData.append("lng", userLocationData.longitude || "");
            formData.append("order_id", String(orderId));
            formData.append("status", "cancelled");

            try {
              const response = await apiCall(formData);
              if (response && response.result === true) {
                showToast("Order has been cancelled", "success");
                router.replace("/(tabs)");
              } else {
                showToast("Failed to cancel order", "error");
              }
            } catch (error) {
              console.error("Error cancelling order:", error);
              showToast(
                "An error occurred while cancelling the order",
                "error"
              );
            } finally {
              setIsLoading(false);
            }
          }
        },
      },
    ]);
  };

  const handleAlert = async () => {
    if (!orderId || !userLocationData.userId) {
      showToast("Required information not available", "error");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("type", "add_data");
    formData.append("table_name", "order_history");
    formData.append("order_id", String(orderId));
    formData.append("lat", userLocationData.latitude || "");
    formData.append("lng", userLocationData.longitude || "");
    formData.append("user_id", userLocationData.userId);
    formData.append("status", "arrived");

    console.log("Alert FormData:", {
      orderId: String(orderId),
      lat: userLocationData.latitude,
      lng: userLocationData.longitude,
      userId: userLocationData.userId,
    });

    try {
      const response = await apiCall(formData);
      if (response && response.result === true) {
        showToast("Alert sent to customer", "success");
      } else {
        showToast("Failed to send alert", "error");
      }
    } catch (error) {
      console.error("Error sending alert:", error);
      showToast("An error occurred while sending alert", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!orderId || !userLocationData.userId) {
      showToast("Required information not available", "error");
      return;
    }

    setIsLoading(true);

    // Update order status to completed
    const formData = new FormData();
    formData.append("type", "add_data");
    formData.append("table_name", "order_history");
    formData.append("order_id", String(orderId));
    formData.append("lat", userLocationData.latitude || "");
    formData.append("lng", userLocationData.longitude || "");
    formData.append("user_id", userLocationData.userId);
    formData.append("status", "completed");

    try {
      const response = await apiCall(formData);
      if (response && response.result === true) {
        // After marking as complete, show review popup
        setPopupType("review");
      } else {
        showToast("Failed to complete order", "error");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      showToast("An error occurred while completing the order", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOrderCompleted = () => {
    // Navigate back to tabs after order completion
    router.replace("/(tabs)");
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
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading order details...</Text>
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
            backAddress={"/(tabs)"}
          />
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>No order details available</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  console.log("Order Status:", order?.status, "Active Tab:", activeTab);

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
            onPress={() => handleTabChange("Details")}
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
            onPress={() => handleTabChange("Chat")}
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

      {activeTab === "Details" && order?.status !== "completed" && (
        <View style={styles.footerButtons}>
          {order?.status === "arrived" || order?.status === "started" ? (
            <View style={styles.buttonContainer}>
              {/* <Button
                title="Cancel"
                variant="secondary"
                fullWidth={false}
                width="48%"
                onPress={handleCancel}
              /> */}
              <Button
                title={order.status === "arrived" ? "Send Alert" : "Complete"}
                variant="primary"
                // fullWidth={false}
                // width="48%"
                onPress={
                  order.status === "arrived" ? handleAlert : handleComplete
                }
              />
            </View>
          ) : (
            <Button
              title="Cancel Order"
              variant="primary"
              fullWidth={false}
              width="100%"
              onPress={handleCancel}
            />
          )}
        </View>
      )}

      {/* Popup with Background Overlay */}
      {showPopup && (
        <Modal transparent visible={showPopup} animationType="slide">
          <View style={styles.overlay}>
            <TouchableOpacity
              style={styles.overlayBackground}
              onPress={() => setPopupType(null)}
            />
            <View style={styles.popupContainer}>
              <Popup
                type={popupType as PopupType}
                setShowPopup={setPopupType}
                orderId={orderId}
                tipAmount={tipAmount}
                onComplete={handleOrderCompleted}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primary300,
    borderRadius: 25,
    marginBottom: 16,
  },
  activeTab: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    padding: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  inactiveTabText: {
    color: Colors.secondary300,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  inactiveTab: {
    fontSize: 16,
    fontFamily: FONTS.regular,
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: FONTS.regular,
  },
  errorText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
});

export default OrderPlace;
