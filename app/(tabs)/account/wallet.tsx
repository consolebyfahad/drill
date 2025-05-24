import Button from "@/components/button";
import Header from "@/components/header";
import Seprator from "@/components/seprator";
import TransactionCard from "@/components/transaction_card";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";

const { width } = Dimensions.get("window");

const Wallet = () => {
  const [showTransactions, setShowTransactions] = useState(true);

  const transactionsData = [
    {
      id: 1,
      type: "Withdraw",
      amount: 100,
      card: "***7999",
      positive: false,
      time: "May 10, 10:40 PM",
    },
    {
      id: 2,
      type: "Earning",
      amount: 500,
      positive: true,
      card: "***7999",
      time: "May 11, 02:30 PM",
    },
    {
      id: 3,
      type: "Earning",
      amount: 500,
      positive: true,
      card: "***7999",
      time: "May 11, 02:30 PM",
    },
    {
      id: 4,
      type: "Earning",
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
    // router.push("/account/add_payment");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header title="Wallet" backBtn={true} />

        {/* <View style={styles.chartSection}>
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

        <Seprator /> */}

        <View style={styles.balanceSection}>
          <View>
            <Text style={styles.textSecondary}>Withdraw Balance</Text>
            <Text style={styles.availableBalance}>SAR 13,455.23</Text>
          </View>
          <View style={{ width: "30%" }}>
            <Button title="Withdraw" onPress={handleAdd} variant="secondary" />
          </View>
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
    color: Colors.secondary,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
  },
  totalExpense: {
    color: Colors.secondary,
    fontSize: 20,
    fontFamily: FONTS.medium,
  },
  textGray: {
    color: "#9CA3AF",
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  balanceSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableBalance: {
    color: Colors.secondary,
    fontSize: 24,
    fontFamily: FONTS.semiBold,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  transactionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: Colors.secondary,
    marginBottom: 14,
  },
});

export default Wallet;
