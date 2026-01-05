import Arrow from "@/assets/svgs/arrowLeft.svg";
import Button from "@/components/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";
import { apiCall } from "~/utils/api";

export default function Verify() {
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
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

  const handleChangeText = (text: string) => {
    setCode(text);
    // Clear error when user types
    if (error) setError("");
  };

  const handleVerify = async () => {
    if (!userId) {
      setError("User not found. Please try logging in again.");
      return;
    }

    if (code.length !== 4) {
      setError("Please enter a valid 4-digit code.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", "verify_otp");
      formData.append("code", code);
      formData.append("user_id", userId);
      const response = await apiCall(formData);

      if (response.result) {
        await AsyncStorage.setItem("user_num_id", response?.user?.id);
        await AsyncStorage.setItem("user_phone", response?.user?.phone);
        if (newUser) {
          setTimeout(() => router.push("/auth/create_account"), 800);
        } else if (
          response?.user?.company_verified === "1" &&
          response?.user?.platform_status === "1"
        ) {
          setTimeout(() => router.push("/auth/access_location"), 800);
        } else {
          setTimeout(() => router.push("/auth/verified"), 800);
        }
      } else {
        setError("Verification Failed");
      }
    } catch (error) {
      console.error("Verification Error:", error);
      setError("Something went wrong. Please try again.");
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
      <View
        style={[styles.otpContainer, error ? styles.otpContainerError : null]}
      >
        <OtpInput
          numberOfDigits={4}
          onTextChange={handleChangeText}
          theme={{
            containerStyle: styles.otpInputs,
            pinCodeContainerStyle: error
              ? StyleSheet.flatten([styles.otpInput, styles.otpInputError])
              : styles.otpInput,
            pinCodeTextStyle: styles.otpInputText,
            focusStickStyle: styles.focusStick,
            focusedPinCodeContainerStyle: styles.focusedOtpInput,
          }}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity>
          <Text style={styles.resendText}>
            Didn&apos;t receive the code?{" "}
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
    fontFamily: FONTS.bold,
    textAlign: "center",
    color: Colors.secondary,
  },
  title: {
    fontSize: 36,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 28,
    color: Colors.secondary100,
    marginBottom: 24,
    fontFamily: FONTS.medium,
  },
  otpContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray100,
    paddingVertical: 26,
    borderRadius: 16,
    marginBottom: 24,
  },
  otpContainerError: {
    borderWidth: 1,
    borderColor: "red",
  },
  otpInputs: {
    flexDirection: "row",
    width: "70%",
    // gap: 12,
    marginBottom: 18,
  },
  otpInput: {
    width: 42,
    height: 42,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  otpInputText: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    color: Colors.secondary,
  },
  otpInputError: {
    borderColor: "red",
  },
  focusStick: {
    backgroundColor: Colors.primary,
  },
  focusedOtpInput: {
    borderColor: Colors.primary,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 12,
    textAlign: "center",
    fontFamily: FONTS.medium,
  },
  resendText: {
    fontSize: 16,
    color: Colors.secondary100,
    fontFamily: FONTS.medium,
  },
  resendLink: {
    fontFamily: FONTS.medium,
    color: Colors.primary,
  },
});
