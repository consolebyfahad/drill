import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "@/components/header";
import Seprator from "@/components/seprator";
import Button from "@/components/button";
import TransactionCard from "@/components/transaction_card";
import { router } from "expo-router";

const { width } = Dimensions.get("window");

const Wallet = () => {
  const [showTransactions, setShowTransactions] = useState(true);

  const transactionsData = [
    {
      id: 1,
      type: "Buying",
      amount: 100,
      card: "***7999",
      positive: false,
      time: "May 10, 10:40 PM",
    },
    {
      id: 2,
      type: "Fund Added",
      amount: 500,
      positive: true,
      card: "***7999",
      time: "May 11, 02:30 PM",
    },
    {
      id: 3,
      type: "Fund Added",
      amount: 500,
      positive: true,
      card: "***7999",
      time: "May 11, 02:30 PM",
    },
    {
      id: 4,
      type: "Fund Added",
      amount: 500,
      positive: true,
      card: "***7999",
      time: "May 11, 02:30 PM",
    },
  ];

  const chartData = [
    { value: 20, label: "01 Jan" },
    { value: 5, label: "10 Jan" },
    { value: 59, label: "20 Jan" },
    { value: 10, label: "30 Jan" },
  ];

  const handleAdd = () => {
    router.push("/account/add_payment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header title="Wallet" backBtn={true} />

        <View style={styles.chartSection}>
          <View style={styles.rowCenter}>
            <Ionicons name="calendar-outline" size={20} color="gray" />
            <Text style={styles.textSecondary}>This month</Text>
          </View>
          <View>
            <Text style={styles.totalExpense}>SAR 1500</Text>
            <Text style={styles.textGray}>Total Expense</Text>
          </View>
        </View>

        <LineChart
          data={chartData}
          thickness={2}
          color="#4A90E2"
          hideYAxisText
          curved
          showVerticalLines
          verticalLinesColor="lightgray"
          xAxisLabelTexts={chartData.map((item) => item.label)}
          xAxisLabelTextStyle={{ color: "gray" }}
          maxValue={60}
          isAnimated
          spacing={(width - 40) / chartData.length}
        />

        <Seprator />

        <View style={styles.balanceSection}>
          <View>
            <Text style={styles.textSecondary}>Available Balance</Text>
            <Text style={styles.availableBalance}>SAR 13,455.23</Text>
          </View>
          <Button
            title="Add"
            width="30%"
            onPress={handleAdd}
            variant="secondary"
          />
        </View>

        <Seprator />

        <TouchableOpacity
          style={styles.transactionHeader}
          onPress={() => setShowTransactions(!showTransactions)}
        >
          <Text style={styles.transactionTitle}>Transactions History</Text>
          <Ionicons
            name={showTransactions ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>

        {showTransactions &&
          transactionsData.map((item) => (
            <TransactionCard
              key={item.id}
              type={item.type}
              amount={item.amount}
              positive={item.positive}
              card={item.card}
              time={item.time}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  chartSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textSecondary: {
    color: "#6B7280",
    fontSize: 18,
  },
  totalExpense: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 20,
  },
  textGray: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableBalance: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 24,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  transactionTitle: {
    fontWeight: "600",
    fontSize: 18,
    color: "#6B7280",
  },
});

export default Wallet;
