import { View, Text, Image, StyleSheet } from "react-native";
import React from "react";
import Star from "@/assets/svgs/Star.svg";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";

type ServiceCardProps = {
  item: {
    image: any;
    title: string;
    rating: string;
    reviews: string;
    price: number;
    provider: string;
    providerImage: any;
  };
};

const ServiceCard: React.FC<ServiceCardProps> = ({ item }) => {
  return (
    <View style={styles.card}>
      {/* Service Image */}
      <Image
        source={item.image}
        resizeMode="cover"
        style={styles.serviceImage}
      />

      {/* Service Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>${item.price}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Star />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviews}>({item.reviews})</Text>
        </View>

        {/* Provider Details */}
        <View style={styles.providerContainer}>
          <Image source={item.providerImage} style={styles.providerImage} />
          <View>
            <Text style={styles.providerName}>{item.provider}</Text>
            <Text style={styles.providerLabel}>Provider</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 242,
    height: 300,
    backgroundColor: Colors.gray100,
    borderRadius: 16,
    marginRight: 16,
  },
  serviceImage: {
    height: 150,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  detailsContainer: {
    padding: 16,
    gap: 8,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    width: 112,
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginVertical: 4,
  },
  rating: {
    fontWeight: "500",
    color: Colors.secondary,
  },
  reviews: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  price: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.primary,
    color: "white",
    fontSize: 16,
    borderRadius: 24,
    fontFamily: FONTS.semiBold,
  },
  providerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  providerImage: {
    height: 34,
    width: 34,
  },
  providerName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary,
  },
  providerLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
});

export default ServiceCard;
