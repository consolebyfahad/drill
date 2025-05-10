import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { router } from "expo-router";
import Location from "@/assets/svgs/locationIcon.svg";
import { Colors } from "@/constants/Colors";

export default function SelectedLocation() {
  const handleLocation = () => {
    router.push("/booking/location");
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>Requested Service Location</Text>
        <TouchableOpacity onPress={handleLocation}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.locationContainer}>
        <View style={styles.iconWrapper}>
          <Location />
        </View>
        <Text style={styles.address}>
          2972 Westheimer Rd. Santa Ana, Illinois 85486, Santa Ana, Illinois
          85486
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.secondary,
  },
  changeText: {
    fontSize: 14,
    color: Colors.primary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary300,
    padding: 16,
    borderRadius: 10,
  },
  iconWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
  },
  address: {
    marginLeft: 16,
    color: Colors.gray600,
    flex: 1,
  },
});
