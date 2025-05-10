import { View, Image, StyleSheet } from "react-native";
import React from "react";

export default function Banner() {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/banner.png")}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 180,
  },
});
