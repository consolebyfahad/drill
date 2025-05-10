import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import DashedSeprator from "./dashed_seprator";
import Star from "@/assets/svgs/Star.svg";
import { Colors } from "@/constants/Colors";

type Order = {
  id?: string;
  title?: string;
  status?: string;
  amount?: string;
  discount?: string;
  date?: string;
  provider?: string;
  paymentStatus?: string;
  rating?: string;
  tip?: string;
  image?: any;
};

type ServiceDetailsCardProps = {
  order: Order;
  orderScreen?: boolean;
  onPress?: any;
};

export default function ServiceDetailsCard({
  order,
  orderScreen,
  onPress,
}: ServiceDetailsCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      {/* Order Top Section */}
      <View style={styles.orderTopSection}>
        <Image source={order.image} style={styles.image} resizeMode="cover" />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.title}>{order.title}</Text>
            <Text style={styles.status}>{order.status}</Text>
          </View>
          <Text style={styles.orderId}>
            Order ID: <Text style={styles.orderIdValue}>{order.id}</Text>
          </Text>
          <Text style={styles.amount}>
            SAR {order.amount}{" "}
            <Text style={styles.discount}>({order.discount}%)</Text>
          </Text>
        </View>
      </View>

      {/* Order Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>Date & Time</Text>
          <Text style={styles.value}>{order.date}</Text>
        </View>
        <DashedSeprator />

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Provider</Text>
          <Text style={styles.value}>{order.provider}</Text>
        </View>
        <DashedSeprator />

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Payment Status</Text>
          <Text style={styles.paymentStatus}>{order.paymentStatus}</Text>
        </View>

        {order.status === "Completed" && orderScreen && (
          <>
            <DashedSeprator />
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Rating</Text>
              <View style={styles.ratingContainer}>
                <Star />
                <Text style={styles.value}>{order.rating}</Text>
              </View>
            </View>
            <DashedSeprator />
            <View style={styles.detailsRow}>
              <Text style={styles.label}>Tipped</Text>
              <Text style={styles.tip}>SAR {order.tip}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
    backgroundColor: Colors.success100,
    color: Colors.success,
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
  tip: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "500",
  },
});
