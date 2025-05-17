import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import ServiceDetailsCard from "../../components/service_details_card";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import ProviderCard from "../../components/provider_card";
import { OrderType } from "~/types/dataTypes";
import OrderDetailsSection from "~/components/order_details";

export default function OrderDetails({ order }: OrderType) {
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  console.log("order", order);
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
        {showOrderDetails && <OrderDetailsSection order={order} />}
      </View>
      <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
        About Customer
      </Text>
      <ProviderCard order={order} />
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
