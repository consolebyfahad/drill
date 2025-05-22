import { View, Text, FlatList, StyleSheet } from "react-native";
import React from "react";
import ServiceCard from "./service_card";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";

type Service = {
  id: string;
  image: any;
  title: string;
  rating: string;
  reviews: string;
  price: number;
  provider: string;
  providerImage: any;
};

const PopularServices: React.FC = () => {
  const services: Service[] = [
    {
      id: "1",
      image: require("@/assets/images/cleaning_service.png"),
      title: "Cleaning Service",
      rating: "4.9",
      reviews: "1k_reviews",
      price: 60,
      provider: "John Doe",
      providerImage: require("@/assets/images/user.png"),
    },
    {
      id: "2",
      image: require("@/assets/images/cleaning_service.png"),
      title: "Cleaning Service",
      rating: "4.8",
      reviews: "800_reviews",
      price: 75,
      provider: "Alice Smith",
      providerImage: require("@/assets/images/user.png"),
    },
    {
      id: "3",
      image: require("@/assets/images/cleaning_service.png"),
      title: "Cleaning Service",
      rating: "4.7",
      reviews: "500_reviews",
      price: 50,
      provider: "Mike Johnson",
      providerImage: require("@/assets/images/user.png"),
    },
  ];

  return (
    <>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Popular Services</Text>
        <Text style={styles.seeAllText}>See All</Text>
      </View>

      {/* Horizontal Scrollable List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled={true}
        renderItem={({ item }) => <ServiceCard item={item} />}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
  },
  seeAllText: {
    color: Colors.primary,
  },
});

export default PopularServices;
