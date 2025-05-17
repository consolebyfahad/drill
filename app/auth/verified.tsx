import Verify from "@/assets/svgs/doubletickicon.svg";
import Pending from "@/assets/svgs/pending.svg";
import Pending1 from "@/assets/svgs/pending1.svg";
import Verified from "@/assets/svgs/verified.svg";
import Button from "@/components/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  AppState,
  TouchableOpacity,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";

import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";
import Feather from "@expo/vector-icons/Feather";

type User = {
  company_verified: string;
  platform_status: string;
  company_code: string;
  user_type: string;
};

export default function VerifiedScreen() {
  const router = useRouter();
  const [accountType, setAccountType] = useState("");
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<User>({
    company_verified: "",
    platform_status: "",
    company_code: "",
    user_type: "",
  });

  // Derived verification status
  const isPlatformVerified = user.platform_status === "0";
  const isCompanyVerified = user.company_verified === "1";
  const isCompanyUser = user.user_type === "company";
  const isIndividualUser = user.user_type === "employee";

  // Calculate overall verification status
  const getVerificationStatus = () => {
    console.log(isCompanyUser, isPlatformVerified, isCompanyVerified);
    if (isCompanyUser) {
      return isPlatformVerified ? "verified" : "pending";
    } else if (isIndividualUser) {
      if (isPlatformVerified && isCompanyVerified) {
        return "verified";
      } else if (isPlatformVerified || isCompanyVerified) {
        return "partial";
      } else {
        return "pending";
      }
    }
    return "pending"; // Default state
  };

  const status = getVerificationStatus();
  console.log(isCompanyUser, isPlatformVerified, isCompanyVerified, status);
  const isVerified = status === "verified";

  // Handle app state changes to clear storage when app is closed

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) throw new Error("User ID not found");

      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("user_id", userId);

      const response = await apiCall(formData);
      if (response.profile) {
        const profileData = response.profile;
        setUser({
          company_verified: profileData.company_verified || "",
          platform_status: profileData.platform_status || "",
          company_code: profileData.company_code || "",
          user_type: profileData.user_type || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const handleAddEmployee = () => {
    router.push("/(tabs)/account/add_employee");
  };

  const handleLater = () => {
    router.push("/auth/access_location");
  };

  const getStatusContent = () => {
    switch (status) {
      case "pending":
        return {
          icon: <Pending />,
          title: "Pending...",
          message:
            "Your verification is still pending. You will not be able to use the app until your verification is fully completed.",
        };
      case "partial":
        return {
          icon: <Pending1 />,
          title: "Pending...",
          message:
            "Your verification is still pending. You will not be able to use the app until your verification is fully completed.",
        };
      case "verified":
      default:
        return {
          icon: <Verified />,
          title: "Verified!",
          message:
            "Congratulations! Your verification is now complete, and you can proceed to use the app.",
        };
    }
  };

  const content = getStatusContent();

  const copyToClipboard = async () => {
    if (user.company_code) {
      try {
        await Clipboard.setString(user.company_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Image & Content */}
      <View style={styles.content}>
        <View>{content.icon}</View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.subtitle}>{content.message}</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.verificationRow}>
            <Text style={styles.verificationText}>Verified by Platform</Text>
            <View
              style={[
                styles.verificationStatus,
                isPlatformVerified
                  ? styles.verifiedStatus
                  : styles.pendingStatus,
              ]}
            >
              <Verify />
            </View>
          </View>

          <View style={styles.divider} />

          {isCompanyUser ? (
            isPlatformVerified ? (
              <View style={styles.verificationRow}>
                <Text style={styles.verificationText}>
                  Company# {user.company_code}
                </Text>
                <TouchableOpacity onPress={copyToClipboard}>
                  {copied ? (
                    <Feather name="check" size={24} color={Colors.primary} />
                  ) : (
                    <Feather
                      name="copy"
                      size={24}
                      color={Colors.primary}
                      style={{ transform: [{ scaleX: -1 }] }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            ) : null
          ) : (
            <View style={styles.verificationRow}>
              <Text style={styles.verificationText}>Verified by Company</Text>
              <View
                style={[
                  styles.verificationStatus,
                  isCompanyVerified
                    ? styles.verifiedStatus
                    : styles.pendingStatus,
                ]}
              >
                <Verify />
              </View>
            </View>
          )}
        </View>
      </View>
      {user.user_type === "company" ? (
        <View style={styles.buttonContainer}>
          {/* Allow Location Button */}
          <Button
            title={"Add Employee"}
            onPress={handleAddEmployee}
            disabled={!isVerified}
            style={!isVerified ? styles.disabledButton : {}}
          />
          {/* "Do it Later" Option */}
          <View style={styles.laterContainer}>
            <Text style={styles.laterBaseText}>Do it</Text>
            <TouchableOpacity onPress={handleLater}>
              <Text style={styles.laterText}> Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Button
          title={"Browse Home"}
          onPress={handleLater}
          disabled={!isVerified}
          style={!isVerified ? styles.disabledButton : {}}
        />
      )}
      {/* Button */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.white,
  },
  content: {
    alignItems: "center",
    paddingTop: 100,
  },
  textContainer: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.secondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
  },
  verificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  verificationText: {
    color: Colors.secondary,
    fontWeight: "500",
  },
  verificationStatus: {
    borderRadius: 99,
    padding: 4,
  },
  verifiedStatus: {
    backgroundColor: Colors.primary,
  },
  pendingStatus: {
    backgroundColor: Colors.gray300,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: Colors.gray,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16, // Added bottom margin
  },
  laterContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  laterBaseText: {
    fontSize: 15, // Match size with laterText
    color: Colors.secondary,
  },
  laterText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
  loader: {
    marginTop: 8,
  },
});
