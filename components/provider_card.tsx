import { View, Text, Image, StyleSheet, Linking } from "react-native";
import React from "react";
import DashedSeparator from "./dashed_seprator";
import Button from "./button";
import { Colors } from "../constants/Colors";
import { router } from "expo-router";

// Define the provider type based on what we've seen in the OrderType
type ProviderType = {
  id: string;
  name: string;
  phone: string;
  address: string;
  image?: string;
  email?: string;
  gender?: string;
  // Add other properties as needed
};

type ProviderCardProps = {
  provider: ProviderType;
  image_url?: string;
};

export default function ProviderCard({
  provider,
  image_url,
}: ProviderCardProps) {
  const handleCall = () => {
    if (provider.phone) {
      const phoneNumber = `tel:${provider.phone}`;
      Linking.openURL(phoneNumber);
    } else {
      console.warn("No phone number available for provider.");
    }
  };

  const handleChat = () => {
    router.push("/order/order_place");
  };

  const handleTrack = () => {
    const providerJson = JSON.stringify(provider);
    router.push({
      pathname: "/order/track",
      params: {
        provider: providerJson,
        image_url: image_url || "",
      },
    });
  };

  // Get provider initials for fallback avatar
  const getInitials = () => {
    if (!provider.name) return "P";
    return provider.name.charAt(0).toUpperCase();
  };

  // Get provider image or use fallback
  const getProviderImage = () => {
    if (provider.image && image_url && provider.image !== "undefined") {
      return { uri: `${image_url}${provider.image}` };
    }
    return require("../assets/images/user.png"); // Make sure this path is correct
  };

  // Calculate rating - this would normally come from the API
  // For now, we'll just provide a placeholder
  const rating = "4.9";
  const reviewCount = "120+";

  return (
    <View style={styles.providerContainer}>
      <View style={styles.providerHeader}>
        {/* Provider image */}
        {provider.image && image_url && provider.image !== "undefined" ? (
          <Image source={getProviderImage()} style={styles.providerImage} />
        ) : (
          <View
            style={[styles.providerImage, styles.providerInitialsContainer]}
          >
            <Text style={styles.providerInitials}>{getInitials()}</Text>
          </View>
        )}

        {/* Provider info */}
        <View style={styles.providerInfo}>
          <Text style={styles.providerName}>
            {provider.name || "Unknown Provider"}
          </Text>
          <Text style={styles.grayText}>
            ⭐ {rating} ({reviewCount} reviews) | Provider
          </Text>
          {provider.phone && (
            <Text style={styles.providerContact}>{provider.phone}</Text>
          )}
        </View>
      </View>

      <DashedSeparator />

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <Button
          Icon={
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📞</Text>
            </View>
          }
          fullWidth={false}
          width={"30%"}
          title="Call"
          bgColor="white"
          textSize={13}
          paddingvertical={12}
          variant="secondary"
          onPress={handleCall}
        />
        <Button
          Icon={
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>💬</Text>
            </View>
          }
          fullWidth={false}
          width={"30%"}
          title="Chat"
          textSize={13}
          paddingvertical={12}
          variant="primary"
          onPress={handleChat}
        />
        <Button
          Icon={
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🗺️</Text>
            </View>
          }
          fullWidth={false}
          width={"30%"}
          title="Directions"
          bgColor="white"
          textSize={13}
          paddingvertical={12}
          variant="secondary"
          onPress={handleTrack}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  providerContainer: {
    padding: 16,
    backgroundColor: Colors.primary300,
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
  providerInitialsContainer: {
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  providerInitials: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  providerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  providerName: {
    fontWeight: "600",
    color: Colors.secondary,
    fontSize: 18,
    marginBottom: 4,
  },
  providerContact: {
    color: Colors.secondary300,
    fontSize: 14,
    marginTop: 2,
  },
  grayText: {
    color: Colors.secondary,
    fontSize: 14,
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
  },
});
