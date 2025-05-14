import Verify from "@/assets/svgs/doubletickicon.svg";
import Pending from "@/assets/svgs/pending.svg";
import Pending1 from "@/assets/svgs/pending1.svg";
import Verified from "@/assets/svgs/verified.svg";
import Button from "@/components/button";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "~/constants/Colors";

// Define the verification status types
type VerificationStatus = "pending" | "partial" | "verified";
type VerifiedBy = {
  platform: boolean;
  company: boolean;
};

type VerifiedScreenProps = {
  status?: VerificationStatus;
  verifiedBy?: VerifiedBy;
};

export default function VerifiedScreen({
  status = "verified",
  verifiedBy = { platform: true, company: true },
}: VerifiedScreenProps) {
  const router = useRouter();

  const handleBrowse = () => {
    router.push("/auth/access_location");
  };

  // Get the appropriate content based on verification status
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
                verifiedBy.platform
                  ? styles.verifiedStatus
                  : styles.pendingStatus,
              ]}
            >
              <Verify />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.verificationRow}>
            <Text style={styles.verificationText}>Verified by Company</Text>
            <View
              style={[
                styles.verificationStatus,
                verifiedBy.company
                  ? styles.verifiedStatus
                  : styles.pendingStatus,
              ]}
            >
              <Verify />
            </View>
          </View>
        </View>
      </View>

      {/* Button */}
      <Button title={"Browse Home"} onPress={handleBrowse} />
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
  image: {
    width: "80%",
    height: 200,
    marginVertical: 20,
  },
  textContainer: {
    alignItems: "center",
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
});
