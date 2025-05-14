import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CompanyHome from "../Home/company_home";
import EmployeeHome from "../Home/employee_home";

const Home: React.FC = () => {
  const [accountType, setAccountType] = useState<string>("");

  useEffect(() => {
    const fetchAccountType = async () => {
      try {
        const account = await AsyncStorage.getItem("user_type");
        if (account) {
          setAccountType(account);
          console.log("Account type:", account);
        } else {
          console.log("No account type found");
        }
      } catch (error) {
        console.error("Error fetching account type:", error);
      }
    };

    fetchAccountType();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {accountType === "company" ? <CompanyHome /> : <EmployeeHome />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default Home;
