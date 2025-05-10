import { Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "~/constants/Colors";

type CategoryCardProps = {
  item: {
    image: any;
    title: string;
  };
  onPress: () => void;
};

const CategoryCard: React.FC<CategoryCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image style={styles.image} source={item.image} resizeMode="contain" />
      <Text style={styles.text}>{item.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.gray100,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: 110,
    height: 140,
    borderRadius: 16,
  },
  image: {
    height: 56,
    width: 56,
  },
  text: {
    color: Colors.secondary,
    textAlign: "center",
  },
});

export default CategoryCard;
