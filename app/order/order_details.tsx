import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import ServiceDetailsCard from "../../components/service_details_card";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import DashedSeparator from "../../components/dashed_seprator";
import ProviderCard from "../../components/provider_card";

// Define the complete OrderType
export type OrderType = {
  id: string;
  order_no: string;
  user_id: string;
  cat_id: string;
  package_id: string;
  to_id: string;
  description: string;
  date: string;
  lat: string;
  lng: string;
  address: string;
  images: string;
  status: string;
  created_at: string;
  timestamp: string;
  promo_code: string;
  distance: number;
  image_url: string;
  payment_method: string;
  method_details: string;
  paymentStatus?: string;
  amount?: string;
  category?: {
    id: string;
    name: string;
    image: string;
    status: string;
    timestamp: string;
    translations: string;
  };
  provider?: {
    id: string;
    email: string;
    password: string;
    name: string;
    dob: string;
    user_type: string;
    address: string;
    postal: string;
    image: string;
    phone: string;
    gender: string;
    lat: string;
    lng: string;
    country: string;
    state: string;
    city: string;
    status: string;
    company_number: string;
    secondary_email: string;
    tax_number: string;
    company_category: string;
    company_code: string;
    iqama_id: string;
    documents: string;
    online_status: string;
    company_verified: string;
    platform_status: string;
    balance: string;
    social_token: string;
    company_id: string;
    timestamp: string;
  };
};

interface OrderDetailsProps {
  order: OrderType;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Format date strings for better display
  const formatDateTime = (dateTimeStr: string) => {
    try {
      // Try to parse the date string
      const date = new Date(dateTimeStr);
      // Return a formatted time string
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateTimeStr; // Return original if parsing fails
    }
  };

  const orderTimestamp = formatDateTime(order.created_at);

  // Add a mock order accepted time for demonstration
  // In a real app, you'd get this from the API
  const orderAcceptedTime = orderTimestamp
    ? new Date(
        new Date(order.created_at).getTime() + 30 * 60000
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Not yet accepted";

  return (
    <ScrollView
      style={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ServiceDetailsCard order={order} />
      <View style={styles.orderDetailsContainer}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => setShowOrderDetails(!showOrderDetails)}
        >
          <Text style={styles.sectionTitle}>Order Details</Text>
          <Ionicons
            name={showOrderDetails ? "chevron-down" : "chevron-up"}
            size={20}
            color={Colors.secondary300}
          />
        </TouchableOpacity>
        {showOrderDetails && (
          <View style={styles.orderDetails}>
            <View style={styles.rowBetween}>
              <Text style={styles.boldText}>Package</Text>
              <Text style={styles.blueText}>
                {order.package_id === "2"
                  ? "Express Service"
                  : "Standard Service"}
              </Text>
            </View>
            <DashedSeparator />
            <View style={styles.rowBetween}>
              <Text style={styles.boldText}>Problem Image</Text>
              {order.images && order.images !== "undefined" ? (
                <Image
                  source={{ uri: `${order.image_url}${order.images}` }}
                  style={styles.problemImage}
                />
              ) : (
                <View style={[styles.problemImage, styles.noImage]}>
                  <Text style={{ color: Colors.secondary300 }}>No Image</Text>
                </View>
              )}
            </View>
            <Text style={[styles.boldText, { marginBottom: 4 }]}>
              Detail About Problem
            </Text>
            <Text style={styles.grayText}>
              {order.description || "No description provided."}
            </Text>
            <DashedSeparator />
            <View style={styles.rowBetween}>
              <Text style={styles.grayText}>Order Placed:</Text>
              <Text style={styles.grayText}>{order.timestamp}</Text>
            </View>
            <DashedSeparator />
            <View style={styles.rowBetween}>
              <Text style={styles.grayText}>Order Accepted: </Text>
              <Text style={styles.grayText}>
                {order.to_id !== "0" ? orderAcceptedTime : "Not yet accepted"}
              </Text>
            </View>
            <DashedSeparator />
            <View style={styles.rowBetween}>
              <Text style={styles.grayText}>Payment Method: </Text>
              <Text style={styles.grayText}>{order.payment_method}</Text>
            </View>
            <DashedSeparator />
            <View style={styles.rowBetween}>
              <Text style={styles.grayText}>Payment Status: </Text>
              <Text style={styles.grayText}>
                {order.paymentStatus || "Pending"}
              </Text>
            </View>
          </View>
        )}
      </View>
      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
        About Provider
      </Text>

      {order.provider ? (
        <ProviderCard provider={order.provider} image_url={order.image_url} />
      ) : (
        <View style={styles.noProviderContainer}>
          <Text style={styles.noProviderText}>
            No provider assigned yet. We'll notify you when a provider accepts
            your request.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDetailsContainer: {
    backgroundColor: Colors.primary300,
    marginTop: 24,
    borderRadius: 25,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.secondary,
  },
  orderDetails: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  boldText: {
    fontWeight: "500",
    color: Colors.secondary300,
  },
  blueText: {
    fontWeight: "bold",
    color: Colors.secondary,
  },
  grayText: {
    color: Colors.secondary,
  },
  problemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: Colors.primary300,
    justifyContent: "center",
    alignItems: "center",
  },
  noProviderContainer: {
    padding: 16,
    backgroundColor: Colors.primary300,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  noProviderText: {
    color: Colors.secondary,
    textAlign: "center",
    fontWeight: "500",
  },
});
