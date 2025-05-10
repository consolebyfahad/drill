import { View, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "~/constants/Colors";

export default function Seprator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  separator: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.gray200,
    marginVertical: 24,
  },
});
