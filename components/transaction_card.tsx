import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors } from "@/constants/Colors";
import { FONTS } from "~/constants/Fonts";

interface TransactionCardProps {
  type: string;
  amount: number;
  positive: boolean;
  card?: string;
  time: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  amount,
  positive,
  card,
  time,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Ionicons
          name={positive ? "add-circle" : "cart"}
          size={24}
          color={Colors.secondary}
          style={styles.icon}
        />
        <View>
          <Text style={styles.typeText}>
            {type}
            {/* {card && `(${card})`} */}
          </Text>
          <Text style={styles.timeText}>{time}</Text>
        </View>
      </View>
      <Text
        style={[
          styles.amountText,
          positive ? styles.positive : styles.negative,
        ]}
      >
        {positive ? `SAR${amount}` : `-SAR${amount}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    marginVertical: 8,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
  },
  typeText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
  },
  timeText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: "#9CA3AF",
  },
  amountText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  positive: {
    color: "#10B981",
  },
  negative: {
    color: "#EF4444",
  },
});

export default TransactionCard;
