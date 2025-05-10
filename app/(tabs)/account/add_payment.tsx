import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import Header from "@/components/header";
import { Ionicons } from "@expo/vector-icons";
import Button from "~/components/button";
import { Colors } from "~/constants/Colors";

const { width } = Dimensions.get("window");

const cardData = [
  {
    id: 1,
    name: "TIM SMITH",
    number: "•••• •••• •••• 5318",
    balance: "$15,236.00",
  },
  {
    id: 2,
    name: "JANE DOE",
    number: "•••• •••• •••• 1245",
    balance: "$10,456.00",
  },
];

export default function AddPayment() {
  const [scrollX] = useState(new Animated.Value(0));
  const [amount, setAmount] = useState(1500);

  const handleIncrease = () => setAmount((prev) => prev + 100);
  const handleDecrease = () =>
    setAmount((prev) => (prev > 100 ? prev - 100 : prev));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header title="Add Payment" backBtn={true} />

        <Text style={styles.infoText}>
          Your credit card has been successfully added
        </Text>

        {/* Credit Card Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          style={styles.cardSlider}
        >
          {cardData.map((card) => (
            <ImageBackground
              key={card.id}
              source={require("@/assets/images/Cards.png")}
              style={[styles.card, { width: width * 0.9 }]}
              resizeMode="contain"
            >
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardNumber}>{card.number}</Text>
              <Text style={styles.cardBalance}>Balance: {card.balance}</Text>
            </ImageBackground>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View style={styles.dotsContainer}>
          {cardData.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [width * i, width * (i + 1)],
              outputRange: [10, 20],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth }]}
              />
            );
          })}
        </View>

        {/* Add Money Section */}
        <Text style={styles.sectionTitle}>Add Money</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="wallet" size={24} color="gray" />
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={amount.toString()}
            onChangeText={(text) => setAmount(Number(text) || 0)}
          />
          <View>
            <TouchableOpacity onPress={handleIncrease}>
              <Ionicons name="chevron-up" size={12} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDecrease}>
              <Ionicons name="chevron-down" size={12} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Button */}
        <Button title="Confrim" onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  scrollContainer: { padding: 24, paddingBottom: 50 },
  infoText: {
    color: Colors.secondary300,
    textAlign: "center",
    marginVertical: 16,
  },
  cardSlider: { marginTop: 16 },
  card: {
    height: 200,
    width: "100%",
    justifyContent: "space-around",
    padding: 16,
    marginRight: 8,
  },
  cardName: { color: "white", fontSize: 18, fontWeight: "bold" },
  cardNumber: { color: "white", fontSize: 16 },
  cardBalance: { color: "white", fontSize: 20, fontWeight: "bold" },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    height: 8,
    backgroundColor: "blue",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 24 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray100,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  input: { flex: 1, marginHorizontal: 16, fontSize: 18 },
  confirmButton: {
    backgroundColor: "blue",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  confirmText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
