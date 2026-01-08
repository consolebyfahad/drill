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
import { useTranslation } from "react-i18next";
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
import * as Location from "expo-location";

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
  const { t } = useTranslation();
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
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );
  const hasShownReviewPopupRef = useRef<boolean>(false); // Track if review popup was already shown
  const hasShownTipPopupRef = useRef<boolean>(false); // Track if tip popup was already shown

  const showPopup = popupType !== null;

  // Single useEffect to initialize all data
  useEffect(() => {
    const initializeAppData = async () => {
      try {
        // Initialize FCM
        await requestFCMPermission();
        const token = await getFCMToken();
        console.log("📲 Provider OrderPlace - User FCM Token:", token);

        // Get all required data from AsyncStorage - use correct keys
        const [storedUserId, storedLatitude, storedLongitude] =
          await Promise.all([
            AsyncStorage.getItem("user_id"),
            AsyncStorage.getItem("latitude"), // Fixed: was "latitide" (typo)
            AsyncStorage.getItem("longitude"),
          ]);

        // If location not in AsyncStorage, get current location
        let providerLat = storedLatitude;
        let providerLng = storedLongitude;

        if (!providerLat || !providerLng) {
          console.log(
            "📍 Provider location not in AsyncStorage, getting current location..."
          );
          try {
            const { status } =
              await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
              const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              providerLat = currentLocation.coords.latitude.toString();
              providerLng = currentLocation.coords.longitude.toString();

              // Save to AsyncStorage
              await AsyncStorage.setItem("latitude", providerLat);
              await AsyncStorage.setItem("longitude", providerLng);
              console.log("📍 Provider location saved:", {
                lat: providerLat,
                lng: providerLng,
              });
            }
          } catch (error) {
            console.error("❌ Error getting provider location:", error);
          }
        }

        // Set user location data
        setUserLocationData({
          userId: storedUserId,
          latitude: providerLat,
          longitude: providerLng,
        });

        console.log("📍 Provider OrderPlace - User Data:", {
          userId: storedUserId,
          latitude: providerLat,
          longitude: providerLng,
        });

        // Start continuous location tracking for active order
        if (orderId && storedUserId) {
          startLocationTracking();
        }
      } catch (error) {
        console.error("Error initializing app data:", error);
        showToast(t("order.failedToInitialize"), "error");
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
          if (tipMatch && !hasShownTipPopupRef.current) {
            setTipAmount(tipMatch[1]);
            setPopupType("tipup");
            hasShownTipPopupRef.current = true;
            showToast(`You received a tip of $${tipMatch[1]}!`, "success");
          }
        } else if (data?.status === "completed") {
          // Only show review popup if it hasn't been shown yet
          if (!hasShownReviewPopupRef.current) {
            setPopupType("review");
            hasShownReviewPopupRef.current = true;
          }
          showToast(t("order.orderCompletedByCustomer"), "success");
        } else if (data?.status === "time_exceeded") {
          setPopupType("timeup");
          showToast(t("order.timeLimitExceeded"), "warning");
        } else if (data?.status === "started") {
          showToast(t("order.customerStarted"), "info");
        } else if (data?.status === "cancelled") {
          showToast(t("order.orderCancelledByCustomer"), "warning");
        }
      }
    };

    initializeAppData();
    const unsubscribe = setupNotificationListeners(handleNotificationPress);

    return () => {
      unsubscribe();
      stopLocationTracking();
    };
  }, [orderId, showToast]);

  // Start continuous location tracking for provider
  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("📍 Location permission not granted for tracking");
        return;
      }

      // Stop any existing tracking
      stopLocationTracking();

      console.log("🔄 Starting continuous location tracking for provider...");

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 10000, // Or every 10 seconds
        },
        async (newLocation) => {
          const newLat = newLocation.coords.latitude.toString();
          const newLng = newLocation.coords.longitude.toString();

          // Update AsyncStorage
          await AsyncStorage.setItem("latitude", newLat);
          await AsyncStorage.setItem("longitude", newLng);

          // Update state
          setUserLocationData((prev) => ({
            ...prev,
            latitude: newLat,
            longitude: newLng,
          }));

          console.log("📍 Provider Location Updated (Active Order):", {
            latitude: newLat,
            longitude: newLng,
            order_id: orderId,
            timestamp: new Date().toISOString(),
          });
        }
      );

      locationSubscriptionRef.current = subscription;
    } catch (error) {
      console.error("❌ Error starting location tracking:", error);
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (locationSubscriptionRef.current) {
      locationSubscriptionRef.current.remove();
      locationSubscriptionRef.current = null;
      console.log("🛑 Stopped provider location tracking");
    }
  };

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
      console.log("📦 Provider - Order Details Response:", {
        order_id: orderId,
        has_data: !!response?.data,
        data_length: response?.data?.length || 0,
      });

      if (response && response.data && response.data.length > 0) {
        const orderData = response.data[0];

        console.log("📦 Provider - Order Data:", {
          id: orderData.id,
          status: orderData.status,
          customer_lat: orderData.lat,
          customer_lng: orderData.lng,
          provider_id: orderData.provider?.id,
        });

        if (order && order.status !== orderData.status) {
          handleOrderStatusChange(order.status, orderData.status);
        }

        setOrder(orderData);

        // Continue location tracking if order is active
        if (
          orderData.status !== "completed" &&
          orderData.status !== "cancelled"
        ) {
          startLocationTracking();
        } else {
          stopLocationTracking();
        }
      } else {
        showToast(t("order.noOrderDetailsFound"), "error");
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      showToast(t("order.failedToFetchDetails"), "error");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderStatusChange = (oldStatus: string, newStatus: string) => {
    console.log(`Order status changed from ${oldStatus} to ${newStatus}`);

    // Show appropriate notifications based on status changes
    if (newStatus === "started") {
      showToast(t("order.customerStarted"), "info");
    } else if (newStatus === "completed") {
      // Only show review popup if it hasn't been shown yet (and not triggered by provider)
      if (!hasShownReviewPopupRef.current) {
        setPopupType("review");
        hasShownReviewPopupRef.current = true;
        showToast(t("order.orderCompleted"), "success");
      }
    } else if (newStatus === "tipped") {
      // Only show tip popup if it hasn't been shown yet
      if (!hasShownTipPopupRef.current) {
        const tipValue = order?.tip_amount || "0";
        setTipAmount(tipValue);
        setPopupType("tipup");
        hasShownTipPopupRef.current = true;
        showToast(t("order.orderTipped", { amount: tipValue }), "success");
      }
    } else if (newStatus === "cancelled") {
      showToast(t("order.orderCancelled"), "warning");
    }
  };

  const handleCancel = async () => {
    if (!userLocationData.userId) {
      showToast(t("order.userInfoNotAvailable"), "error");
      return;
    }

    Alert.alert(t("order.cancelOrder"), t("order.cancelConfirm"), [
      {
        text: t("order.no"),
        style: "cancel",
      },
      {
        text: t("order.yes"),
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
                showToast(t("order.orderCancelledSuccess"), "success");
                router.replace("/(tabs)");
              } else {
                showToast(t("order.failedToCancelOrder"), "error");
              }
            } catch (error) {
              console.error("Error cancelling order:", error);
              showToast(t("order.errorCancellingOrder"), "error");
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
      showToast(t("order.requiredInfoNotAvailable"), "error");
      return;
    }

    // Get latest location before sending alert
    let providerLat = userLocationData.latitude;
    let providerLng = userLocationData.longitude;

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      providerLat = currentLocation.coords.latitude.toString();
      providerLng = currentLocation.coords.longitude.toString();

      // Update AsyncStorage and state
      await AsyncStorage.setItem("latitude", providerLat);
      await AsyncStorage.setItem("longitude", providerLng);
      setUserLocationData((prev) => ({
        ...prev,
        latitude: providerLat,
        longitude: providerLng,
      }));

      console.log("📍 Provider - Updated location before sending alert:", {
        lat: providerLat,
        lng: providerLng,
      });
    } catch (error) {
      console.error("❌ Error getting current location:", error);
      // Continue with stored location if current location fails
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("type", "add_data");
    formData.append("table_name", "order_history");
    formData.append("order_id", String(orderId));
    formData.append("lat", providerLat || "");
    formData.append("lng", providerLng || "");
    formData.append("user_id", userLocationData.userId);
    formData.append("status", "arrived");

    console.log("✅ Provider - Sending Arrived Alert:", {
      orderId: String(orderId),
      lat: providerLat,
      lng: providerLng,
      userId: userLocationData.userId,
      status: "arrived",
    });

    try {
      const response = await apiCall(formData);
      if (response && response.result === true) {
        showToast(t("order.alertSentSuccess"), "success");
      } else {
        showToast(t("order.failedToSendAlert"), "error");
      }
    } catch (error) {
      console.error("Error sending alert:", error);
      showToast(t("order.errorSendingAlert"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!orderId || !userLocationData.userId) {
      showToast(t("order.requiredInfoNotAvailable"), "error");
      return;
    }

    // Get latest location before completing
    let providerLat = userLocationData.latitude;
    let providerLng = userLocationData.longitude;

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      providerLat = currentLocation.coords.latitude.toString();
      providerLng = currentLocation.coords.longitude.toString();

      // Update AsyncStorage and state
      await AsyncStorage.setItem("latitude", providerLat);
      await AsyncStorage.setItem("longitude", providerLng);
      setUserLocationData((prev) => ({
        ...prev,
        latitude: providerLat,
        longitude: providerLng,
      }));

      console.log("📍 Provider - Updated location before completing:", {
        lat: providerLat,
        lng: providerLng,
      });
    } catch (error) {
      console.error("❌ Error getting current location:", error);
      // Continue with stored location if current location fails
    }

    setIsLoading(true);

    // Update order status to completed
    const formData = new FormData();
    formData.append("type", "add_data");
    formData.append("table_name", "order_history");
    formData.append("order_id", String(orderId));
    formData.append("lat", providerLat || "");
    formData.append("lng", providerLng || "");
    formData.append("user_id", userLocationData.userId);
    formData.append("status", "completed");

    console.log("✅ Provider - Completing Order:", {
      orderId: String(orderId),
      lat: providerLat,
      lng: providerLng,
      userId: userLocationData.userId,
      status: "completed",
    });

    try {
      const response = await apiCall(formData);
      if (response && response.result === true) {
        console.log("✅ Provider - Order completed successfully");
        stopLocationTracking(); // Stop tracking when order is completed

        // Show review popup only once (provider-triggered completion)
        if (!hasShownReviewPopupRef.current) {
          setPopupType("review");
          hasShownReviewPopupRef.current = true;
          showToast(t("order.orderCompleted"), "success");
        }

        // Refresh order details to get updated status
        await getOrderDetails();
      } else {
        console.error("❌ Provider - Failed to complete order:", response);
        showToast(t("order.orderCompletedError"), "error");
      }
    } catch (error) {
      console.error("❌ Error completing order:", error);
      showToast(t("order.errorCompletingOrder"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOrderCompleted = () => {
    // Reset the popup flags for future orders
    hasShownReviewPopupRef.current = false;
    hasShownTipPopupRef.current = false;
    // Navigate back to tabs after order completion
    router.replace("/(tabs)");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Header
            backBtn={true}
            title={t("order.loading")}
            icon={true}
            support={true}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              {t("order.loadingOrderDetails")}
            </Text>
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
            title={t("order.orderDetails")}
            icon={true}
            support={true}
            backAddress={"/(tabs)"}
          />
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{t("order.noOrderDetails")}</Text>
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
          title={`${t("order.request")}${order.order_no}`}
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
              {t("order.detail")}
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
              {t("order.chat")}
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
                title={
                  order.status === "arrived"
                    ? t("order.sendAlert")
                    : t("order.complete")
                }
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
              title={t("order.cancelOrder")}
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
