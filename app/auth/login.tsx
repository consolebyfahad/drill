import Button from "@/components/button";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { FONTS } from "~/constants/Fonts";
import { ms, s, vs } from "~/utils/responsive";
type CountryCode = {
  key: number;
  label: string;
  value: string;
};

const countryCodes: CountryCode[] = [
  { key: 1, label: "Kingdom Saudi Arabia (+966)", value: "+966" },
];

export default function Login() {
  const { t } = useTranslation();
  const [countryCode, setCountryCode] = useState<CountryCode>(countryCodes[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [error, setError] = useState<string>("");
  const modalRef = useRef<any>(null);

  const handleContinue = async () => {
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    if (cleanedNumber.length < 9 || cleanedNumber.length > 10) {
      setError(t("login.invalidPhone") || "Please enter a valid phone number.");
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
      <Text style={styles.title}>{t("login.title") || "Welcome"}</Text>
      <Text style={styles.subtitle}>
        {t("login.subtitle") || "Enter your phone \nnumber to get started."}
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
          <Flag width={s(25)} height={s(25)} />
          <Text style={styles.countryText}>{countryCode.label}</Text>
          <Ionicons name="chevron-down" size={s(20)} />
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
          placeholder={t("login.phonePlaceholder") || "Phone number"}
          value={phoneNumber}
          maxLength={10}
          onChangeText={(text) => {
            setPhoneNumber(text.replace(/\D/g, ""));
            if (error) setError("");
          }}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text
        style={styles.privacyText}
        onPress={() => router.push("/auth/privacy")}
      >
        {t("login.privacy")}
      </Text>

      <Button title={t("continue") || "Continue"} onPress={handleContinue} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: vs(60),
    paddingHorizontal: s(16),
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: ms(32),
    fontFamily: FONTS.bold,
    marginBottom: vs(6),
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: ms(22),
    color: Colors.secondary100,
    marginBottom: vs(28),
    fontFamily: FONTS.medium,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: ms(12),
    marginBottom: vs(20),
    overflow: "hidden",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
  },
  countryText: {
    flex: 1,
    marginLeft: s(10),
    fontSize: ms(15),
    color: Colors.secondary,
    fontFamily: FONTS.regular,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: Colors.gray,
  },
  input: {
    paddingHorizontal: s(16),
    paddingVertical: vs(14),
    fontSize: ms(17),
    fontFamily: FONTS.regular,
  },
  privacyText: {
    textAlign: "center",
    fontSize: ms(13),
    fontFamily: FONTS.semiBold,
    color: Colors.primary,
    marginBottom: vs(20),
    textDecorationLine: "underline",
  },
  inputContainerError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: ms(13),
    marginTop: vs(-14),
    marginBottom: vs(12),
    paddingLeft: s(12),
    fontFamily: FONTS.regular,
  },
});
