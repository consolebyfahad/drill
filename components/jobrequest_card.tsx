import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "~/constants/Colors";
import Button from "./button";
import { FONTS } from "~/constants/Fonts";

interface JobRequestCardProps {
  userName?: string;
  serviceTitle?: string;
  packageTitle?: string;
  distance?: string;
  duration?: string;
  jobLocation?: string;
  currentLocation?: string;
  serviceImage?: any;
  onAccept?: () => void;
  onDecline?: () => void;
  maxHeight?: number;
  screenWidth?: number;
}

const JobRequestCard: React.FC<JobRequestCardProps> = ({
  userName,
  serviceTitle,
  packageTitle,
  distance,
  duration,
  jobLocation,
  currentLocation,
  serviceImage,
  onAccept = () => {},
  onDecline = () => {},
  maxHeight = 400,
  screenWidth = 375,
}) => {
  const styles = StyleSheet.create({
    container: {
      borderRadius: 16,
      padding: screenWidth * 0.04,
      backgroundColor: "#F0F8FF",
      borderWidth: 1,
      borderColor: "#4169E1",
      margin: screenWidth * 0.04,
      maxHeight: maxHeight,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      fontSize: screenWidth * 0.038,
      fontFamily: FONTS.semiBold,
      color: "#333",
      marginBottom: screenWidth * 0.04,
      textAlign: "left",
    },
    serviceIconContainer: {
      width: screenWidth * 0.12,
      height: screenWidth * 0.16,
      borderRadius: 8,
      backgroundColor: Colors.white,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    locationContainer: {
      backgroundColor: "white",
      borderRadius: 12,
      padding: screenWidth * 0.04,
      marginBottom: screenWidth * 0.04,
      maxHeight: maxHeight * 0.4, // 40% of available card height
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    serviceCard: {
      backgroundColor: "#4169E1",
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 8,
    },

    serviceIcon: {
      width: 36,
      height: 36,
    },
    serviceDetails: {
      flex: 1,
    },
    serviceTitle: {
      color: Colors.white,
      fontFamily: FONTS.semiBold,
      fontSize: 13,
      marginBottom: 4,
    },
    packageTitle: {
      color: Colors.white,
      fontSize: 11,
      fontFamily: FONTS.regular,
    },
    mapContainer: {
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 12,
      overflow: "hidden",
      width: 120,
    },
    mapImage: {
      width: "100%",
      height: 80,
    },
    mapInfoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 4,
    },
    infoChip: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: "#DDD",
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    infoText: {
      fontSize: 12,
      color: "#333",
      fontFamily: FONTS.regular,
    },

    locationRow: {
      flexDirection: "row",
      marginVertical: 8,
    },
    markerContainer: {
      marginRight: 12,
    },
    locationDetails: {
      flex: 1,
    },
    locationLabel: {
      color: Colors.secondary300,
      fontSize: 12,
      marginBottom: 4,
      fontFamily: FONTS.regular,
    },
    locationAddress: {
      color: Colors.secondary,
      fontSize: 14,
      fontFamily: FONTS.semiBold,
    },
    divider: {
      height: 1,
      backgroundColor: "#EEE",
      marginVertical: 8,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>
        Hello! {userName} you have the job request
      </Text>

      {/* Service and Map Row */}
      <View style={styles.infoRow}>
        {/* Service Details */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceIconContainer}>
            <Image source={serviceImage} style={styles.serviceIcon} />
          </View>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceTitle}>{serviceTitle}</Text>
            <Text style={styles.packageTitle}>
              {packageTitle === "1"
                ? "Basic"
                : packageTitle === "2"
                ? "Standard"
                : packageTitle === "3"
                ? "Premium"
                : ""}
            </Text>
          </View>
        </View>

        {/* Map and Distance Info */}
        <View style={styles.mapContainer}>
          <Image
            source={require("@/assets/images/miniMap.png")}
            style={styles.mapImage}
            defaultSource={require("@/assets/images/miniMap.png")}
          />
          <View style={styles.mapInfoRow}>
            <View style={styles.infoChip}>
              <Text style={styles.infoText}>{distance}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoText}>{duration}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Location Information */}
      <View style={styles.locationContainer}>
        {/* Job Location */}
        <View style={styles.locationRow}>
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={24} color="#4169E1" />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationLabel}>Job Location</Text>
            <Text style={styles.locationAddress}>{jobLocation}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Current Location */}
        <View style={styles.locationRow}>
          <View style={styles.markerContainer}>
            <Ionicons name="navigate-circle" size={24} color="#4169E1" />
          </View>
          <View style={styles.locationDetails}>
            <Text style={styles.locationLabel}>Your Current Location</Text>
            <Text style={styles.locationAddress}>{currentLocation}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button
          title="Decline"
          onPress={onDecline}
          variant="secondary"
          bgColor="white"
          fullWidth={false}
          width="38%"
        />
        <Button
          title="Accept"
          onPress={onAccept}
          fullWidth={false}
          width="58%"
        />
      </View>
    </View>
  );
};

export default JobRequestCard;
