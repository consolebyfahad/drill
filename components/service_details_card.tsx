import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import DashedSeprator from "./dashed_seprator";
import { Colors } from "../constants/Colors";

// Updated Order type to match the actual data structure
type Order = {
  id?: string;
  order_no?: string;
  category?: {
    name: string;
    image: string;
  };
  status?: string;
  amount?: string;
  discount?: string;
  timestamp?: string;
  created_at?: string;
  provider?: {
    name: string;
    image: string;
  };
  payment_method?: string;
  paymentStatus?: string;
  rating?: string;
  tip?: string;
  image_url?: string;
  images?: string;
};

type ServiceDetailsCardProps = {
  order: Order;
  orderScreen?: boolean;
  onPress?: () => void;
};

export default function ServiceDetailsCard({
  order,
  orderScreen,
  onPress,
}: ServiceDetailsCardProps) {
  // Function to get the image source
  const getImageSource = () => {
    if (order.images && order.image_url) {
      return { uri: `${order.image_url}${order.images}` };
    } else if (order.category?.image) {
      return { uri: `${order.image_url}${order.category.image}` };
    } else {
      return require("../assets/images/default-profile.png");
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* Order Top Section */}
      <View style={styles.orderTopSection}>
        <Image
          source={getImageSource()}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.title}>
              {order.category?.name || "Service Order"}
            </Text>
            <Text style={[styles.status, getStatusStyle(order.status)]}>
              {order.status}
            </Text>
          </View>
          <Text style={styles.orderId}>
            Order ID: <Text style={styles.orderIdValue}>{order.order_no}</Text>
          </Text>
          <Text style={styles.amount}>
            SAR {order.amount || "0.00"}{" "}
            {order.discount && (
              <Text style={styles.discount}>({order.discount}%)</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Order Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>
            {order.timestamp || order.created_at || "N/A"}
          </Text>
        </View>
        <DashedSeprator />

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Provider</Text>
          <Text style={styles.value}>
            {order.provider?.name || "Not assigned yet"}
          </Text>
        </View>
        <DashedSeprator />

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Payment Status</Text>
          <Text style={styles.paymentStatus}>
            {order.paymentStatus || "Pending"}
          </Text>
        </View>

        {order.status === "completed" && orderScreen && (
          <>
            <DashedSeprator />
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Rating</Text>
              <View style={styles.ratingContainer}>
                {/* Use icon component or image for star */}
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.value}>{order.rating || "0"}</Text>
              </View>
            </View>
            <DashedSeprator />
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Tipped</Text>
              <Text style={styles.tip}>SAR {order.tip || "0.00"}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Function to get different status styles
const getStatusStyle = (status) => {
  switch (status?.toLowerCase()) {
    case "accepted":
      return { backgroundColor: Colors.success100, color: Colors.success };
    case "pending":
      return { backgroundColor: "#FFF3CD", color: "#856404" };
    case "completed":
      return { backgroundColor: "#D4EDDA", color: "#155724" };
    case "cancelled":
      return { backgroundColor: "#F8D7DA", color: "#721C24" };
    default:
      return { backgroundColor: Colors.primary100, color: Colors.secondary };
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary300,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
  },
  orderTopSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  image: {
    height: 62,
    width: 62,
    borderRadius: 8,
    backgroundColor: Colors.white,
    padding: 8,
  },
  orderInfo: {
    flex: 1,
    gap: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.secondary,
  },
  status: {
    padding: 8,
    fontSize: 14,
    fontWeight: "500",
    borderRadius: 8,
  },
  orderId: {
    fontSize: 14,
    color: Colors.secondary300,
  },
  orderIdValue: {
    fontWeight: "500",
  },
  amount: {
    fontSize: 14,
    color: Colors.secondary,
  },
  discount: {
    color: Colors.success,
  },
  detailsContainer: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: {
    color: Colors.secondary300,
    fontSize: 14,
  },
  value: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  paymentStatus: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    color: "#FFD700",
    fontSize: 16,
  },
  tip: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "500",
  },
});
