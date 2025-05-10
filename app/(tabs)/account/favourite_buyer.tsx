import { StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import React from "react";
import BuyerCard from "~/components/buyer_card";
import Header from "~/components/header";

export default function FavouriteBuyer() {
  // Sample data for favorite buyers based on the image
  const favoriteBuyers = [
    {
      id: "1",
      name: "Fedor Kiryakov",
      image: "https://example.com/buyer1.jpg", // Replace with actual image URLs
      rating: 4.9,
      reviewCount: "120+",
    },
    {
      id: "2",
      name: "Oleg Chapchay",
      image: "https://example.com/buyer2.jpg",
      rating: 4.9,
      reviewCount: "120+",
    },
    {
      id: "3",
      name: "Brooklyn Simmons",
      image: "https://example.com/buyer3.jpg",
      rating: 4.9,
      reviewCount: "120+",
    },
    {
      id: "4",
      name: "Muhammad",
      image: "https://example.com/buyer4.jpg",
      rating: 4.9,
      reviewCount: "120+",
    },
    {
      id: "5",
      name: "Jane Cooper",
      image: "https://example.com/buyer5.jpg",
      rating: 4.9,
      reviewCount: "120+",
    },
    {
      id: "6",
      name: "Leslie Alexander",
      image: "https://example.com/buyer6.jpg",
      rating: 4.9,
      reviewCount: "120+",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header backBtn={true} title="Favourite Buyers" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cardsContainer}>
          {favoriteBuyers.map((buyer) => (
            <BuyerCard key={buyer.id} buyer={buyer} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
