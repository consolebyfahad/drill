import Button from "@/components/button";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ModalSelector from "react-native-modal-selector";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";
import Flag from "@/assets/svgs/flag.svg";
type CountryCode = {
  key: number;
  label: string;
  value: string;
};

const countryCodes: CountryCode[] = [
  { key: 1, label: "Kingdom Saudi Arabia (+966)", value: "+966" },
];

export default function Login() {
  const [countryCode, setCountryCode] = useState<CountryCode>(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const modalRef = useRef<any>(null);

  const handleContinue = async () => {
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    if (cleanedNumber.length < 9 || cleanedNumber.length > 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    try {
      await AsyncStorage.clear();
      const formData = new FormData();
      formData.append("type", "register_phone");
      formData.append("phone", `${countryCode.value}${cleanedNumber}`);
      formData.append("user_type", "company");
      const response = await apiCall(formData);
      if (response.result) {
        await AsyncStorage.setItem("user_id", response.user_id);
        await AsyncStorage.setItem("user_type", response.user_type);
        await AsyncStorage.setItem(
          "new_user",
          JSON.stringify(response.new_user)
        );

        if (!response.new_user) {
          await AsyncStorage.setItem(
            "company_verified",
            response.company_verified
          );
          await AsyncStorage.setItem(
            "platform_status",
            response.platform_status
          );
        }

        router.push("/auth/verify");
      } else {
        setError(response.message || "Login failed.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>
        Enter your phone {"\n"}number to get started.
      </Text>

      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : null,
        ]}
      >
        <TouchableOpacity
          onPress={() => modalRef.current.open()}
          style={styles.countrySelector}
        >
          {/* <Image
            source={require("@/assets/images/saudia.png")}
            style={styles.countryFlag}
          /> */}
          <Flag width={25} height={25} />
          <Text style={styles.countryText}>{countryCode.label}</Text>
          <Ionicons name="chevron-down" size={20} />
        </TouchableOpacity>

        <ModalSelector
          ref={modalRef}
          data={countryCodes}
          onChange={(option: CountryCode) => setCountryCode(option)}
          style={{ borderWidth: 0, backgroundColor: "transparent" }}
          selectStyle={{ display: "none" }}
        />

        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholderTextColor={Colors.secondary300}
          placeholder="Phone number"
          value={phoneNumber}
          maxLength={10}
          onChangeText={(text) => {
            setPhoneNumber(text.replace(/\D/g, ""));
            if (error) setError("");
          }}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity>
        <Text style={styles.privacyText}>Privacy & Agreements</Text>
      </TouchableOpacity>

      <Button title="Continue" onPress={handleContinue} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 84,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 28,
    color: Colors.secondary100,
    marginBottom: 32,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  countryFlag: {
    width: 32,
    height: 32,
  },
  countryText: {
    fontSize: 18,
    color: Colors.secondary,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: Colors.gray,
  },
  input: {
    padding: 16,
    fontSize: 18,
  },
  privacyText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 24,
  },
  inputContainerError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -20,
    marginBottom: 16,
    paddingLeft: 12,
  },
});
