import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

export default function BuyerCard({ buyer }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: buyer.image }} style={styles.image} />

      <TouchableOpacity style={styles.favoriteButton}>
        <FontAwesome name="heart" size={18} color="#4CAF50" />
      </TouchableOpacity>

      <Text style={styles.name}>{buyer.name}</Text>

      <View style={styles.ratingContainer}>
        <FontAwesome name="star" size={16} color="#4CAF50" />
        <Text style={styles.rating}>{buyer.rating}</Text>
        <Text style={styles.reviewCount}>({buyer.reviewCount} review)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "45%",
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    padding: 10,
    margin: 8,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 12,
  },
  favoriteButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  rating: {
    fontWeight: "bold",
    marginLeft: 5,
    marginRight: 5,
    color: "#333",
  },
  reviewCount: {
    color: "#777",
    fontSize: 12,
  },
});
