import React, { useState, useCallback } from "react";
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

type PopupType = "timeup" | "tipup" | "orderComplete" | "review";

const OrderPlace: React.FC = () => {
  const { orderId, tab } = useLocalSearchParams();
  console.log(tab);
  const [activeTab, setActiveTab] = useState<string>(
    tab ? String(tab) : "Details"
  );
  const [popupType, setPopupType] = useState<PopupType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<OrderType | null>(null);

  // Show or hide popup based on popupType
  const showPopup = popupType !== null;

  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        getOrderDetails(String(orderId));
      }
    }, [orderId])
  );

  const getOrderDetails = async (id: string) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("id", id);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orderData = response.data[0];
        setOrder(orderData);
      } else {
        Alert.alert("Error", "No order details found");
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      Alert.alert("Error", "Failed to fetch order details");
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPopupType("tipup");
  };

  const handleAlert = () => {};
  const handleComplete = () => {
    router.push({
      pathname: "/order/add_extra",
      params: { orderId: orderId },
    });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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

      {activeTab === "Details" && (
        <View style={styles.footerButtons}>
          {order?.status === "arrived" || order?.status === "started" ? (
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                variant="secondary"
                fullWidth={false}
                width="48%"
                onPress={handleCancel}
              />
              <Button
                title={order.status === "arrived" ? "Send Alert" : "Complete"}
                variant="primary"
                fullWidth={false}
                width="48%"
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
    fontWeight: "bold",
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
    fontWeight: "500",
  },
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.secondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.secondary300,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
});

export default OrderPlace;
