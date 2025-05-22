import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React from "react";
import Edit from "@/assets/svgs/edit.svg";
import { Colors } from "@/constants/Colors";
import { FONTS } from "~/constants/Fonts";

export default function SelectedService() {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/user.png")}
          style={styles.image}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Detection Services</Text>
        <Text style={styles.date}>
          Date: <Text style={styles.dateValue}>16 July 2023</Text>
        </Text>
      </View>
      <TouchableOpacity>
        <Edit />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    padding: 8,
    backgroundColor: Colors.primary200,
    borderRadius: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 18,
    color: Colors.secondary,
    fontFamily: FONTS.semiBold,
  },
  date: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  dateValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary,
  },
});
