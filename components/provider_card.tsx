import { View, Text, Image, StyleSheet, Linking } from "react-native";
import DashedSeparator from "./dashed_seprator";
import Button from "./button";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";
import Direction from "@/assets/svgs/routing.svg";
import Call from "@/assets/svgs/Calling.svg";
import Chat from "@/assets/svgs/Chat.svg";
import { FONTS } from "~/constants/Fonts";
import { useRoute } from "@react-navigation/native";
// Define types based on the API response structure
type User = {
  id?: any;
  name?: string;
  image?: string;
  phone?: string;
  // Add other user properties as needed
};

type Order = {
  id?: any;
  order_no?: string;
  status?: any;
  amount?: string;
  discount?: string;
  created_at?: string;
  timestamp?: string;
  payment_method?: string;
  payment_status?: string;
  address?: string;
  description?: string;
  image_url?: string;
  package_id?: string;
  user?: User;
  order?: any;
  // Add other order properties as needed
};

interface ProviderCardProps {
  order?: Order;
}

export default function ProviderCard({ order }: ProviderCardProps) {
  // Get customer data from the order.user property
  const customer = order?.user;
  console.log("cus", customer);
  const route = useRoute();
  const isOnTrackScreen = route.name === "order/track";
  if (!customer) {
    return (
      <View style={styles.noProviderContainer}>
        <Text style={styles.noProviderText}>
          No customer information available.
        </Text>
      </View>
    );
  }

  const handleCall = () => {
    if (customer.phone) {
      const phoneNumber = `tel:${customer.phone}`;
      Linking.openURL(phoneNumber);
    } else {
      console.warn("No phone number available for customer.");
    }
  };

  const handleChat = () => {
    router.push({
      pathname: "/order/order_place",
      params: { orderId: order.id, tab: "Chat" },
    });
  };

  // const handleTrack = () => {
  const handleTrack = () => {
    console.log("order?.status", order?.status, isOnTrackScreen);

    if (
      isOnTrackScreen ||
      order?.status === "completed" ||
      order?.status === "started"
    ) {
      console.log("Track button clicked, but navigation is disabled.");
      return;
    }

    router.push({
      pathname: "/order/track",
      params: { orderId: order.id },
    });
  };

  // Get customer profile image
  const customerImage =
    customer.image && order.image_url
      ? { uri: `${order.image_url}${customer.image}` }
      : require("../assets/images/default-profile.png");

  return (
    <View style={styles.providerContainer}>
      <View style={styles.providerHeader}>
        {/* Customer image */}
        <Image source={customerImage} style={styles.providerImage} />

        {/* Customer info */}
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>
            {customer.name || "Unknown Customer"}
          </Text>
          <Text style={styles.grayText}>
            ⭐ {customer.rating} ({customer.reviews})
          </Text>
          <Text style={styles.providerContact}>Customer</Text>
        </View>
      </View>

      <DashedSeparator />

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <Button
          Icon={<Call />}
          fullWidth={false}
          width={"30%"}
          title="Call"
          bgColor="white"
          textSize={12}
          paddingvertical={12}
          variant="secondary"
          onPress={handleCall}
        />
        <Button
          Icon={<Chat />}
          fullWidth={false}
          width={"30%"}
          title="Chat"
          bgColor="white"
          textSize={12}
          paddingvertical={12}
          variant="secondary"
          onPress={handleChat}
        />
        <Button
          Icon={<Direction />}
          fullWidth={false}
          width={"30%"}
          title="Directions"
          textSize={12}
          paddingvertical={12}
          variant="primary"
          onPress={handleTrack}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  providerContainer: {
    padding: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  providerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  providerName: {
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    fontSize: 18,
    marginBottom: 4,
  },
  providerContact: {
    color: Colors.secondary300,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  grayText: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
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
