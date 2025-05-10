import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { Colors } from "~/constants/Colors";
import CategoryCard from "@/components/category_card";
import Plumber from "@/assets/images/default-profile.png";

type Category = {
  id: string;
  image: any;
  title: string;
};

const Categories: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const data: Category[] = [
    { id: "1", image: Plumber, title: "Plumbing" },
    { id: "2", image: Plumber, title: "Electrician" },
    { id: "3", image: Plumber, title: "Cleaning" },
    { id: "4", image: Plumber, title: "Painting" },
    { id: "5", image: Plumber, title: "Gardening" },
    { id: "6", image: Plumber, title: "Carpentry" },
    { id: "7", image: Plumber, title: "Moving" },
    { id: "8", image: Plumber, title: "Appliance Repair" },
    { id: "9", image: Plumber, title: "Auto Repair" },
  ];

  const visibleData = expanded ? data : data.slice(0, 6);
  const handleBooking = () => {
    router.push("/booking");
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={styles.seeAllText}>
            {expanded ? "Show Less" : "See All"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid View */}
      <FlatList
        data={visibleData}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        nestedScrollEnabled={true}
        renderItem={({ item }) => (
          <CategoryCard item={item} onPress={handleBooking} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
});

export default Categories;
