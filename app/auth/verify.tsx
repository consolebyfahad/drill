import Arrow from "@/assets/svgs/backarrow.svg";
import Button from "@/components/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";

type InputRef = TextInput | null;

export default function Verify() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const inputs = useRef<InputRef[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<boolean | null>(null);

  // Get user ID from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        const stored = await AsyncStorage.getItem("new_user");
        const newUser = stored !== null ? JSON.parse(stored) : null;
        setUserId(userId);
        setNewUser(newUser);
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
    fetchUserId();
  }, []);

  const handleChangeText = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const newCode = [...code];
      if (!code[index] && index > 0) {
        newCode[index - 1] = "";
        setCode(newCode);
        inputs.current[index - 1]?.focus();
      } else {
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handleVerify = async () => {
    if (!userId) {
      console.error("User ID not found. Please try logging in again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "verify_otp");
      formData.append("code", code.join(""));
      formData.append("user_id", userId);
      console.log("Formdata=", formData);
      const response = await apiCall(formData);
      console.log("Verification Response:", response);

      if (response.result) {
        if (newUser) {
          setTimeout(() => router.push("/auth/create_account"), 800);
        } else {
          setTimeout(() => router.push("/auth/verified"), 800);
        }
      } else {
        console.error(response.message || "Verification Failed");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      console.error("Something went wrong, please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Arrow />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification</Text>
        <Text></Text>
      </View>

      {/* Title & Subtitle */}
      <Text style={styles.title}>Enter Your 4 digit {"\n"}Code</Text>
      <Text style={styles.subtitle}>
        Please check your email and enter the 4-digit code.
      </Text>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        <View style={styles.otpInputs}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit}
            />
          ))}
        </View>
        <TouchableOpacity>
          <Text style={styles.resendText}>
            Didn’t receive the code?{" "}
            <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Verify Button */}
      <Button title="Verify" onPress={handleVerify} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 38,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.secondary,
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
    marginBottom: 24,
  },
  otpContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray100,
    paddingVertical: 26,
    borderRadius: 16,
    marginBottom: 24,
  },
  otpInputs: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  otpInput: {
    width: 42,
    height: 42,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    textAlign: "center",
    fontSize: 20,
  },
  resendText: {
    fontSize: 16,
    color: Colors.secondary100,
  },
  resendLink: {
    fontWeight: "500",
    color: Colors.primary,
  },
});
