import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useNavigation } from "expo-router";
import BackArrow from "@/assets/svgs/Arrow.svg";
import ChatSupport from "@/assets/svgs/chatSupport.svg";
import { Colors } from "~/constants/Colors";
import Add from "@/assets/svgs/add.svg";
import { FONTS } from "~/constants/Fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "~/utils/api";

type HeaderProps = {
  userName?: string;
  title?: string;
  homeScreen?: boolean;
  icon?: boolean;
  support?: boolean;
  backBtn?: boolean;
  onpress?: any;
  backAddress?: any;
};

export default function Header({
  userName,
  title,
  homeScreen,
  icon = false,
  support = false,
  backBtn,
  onpress,
  backAddress,
}: HeaderProps) {
  const navigation = useNavigation();
  const handleGoBack = () => {
    if (backAddress) {
      router.push(backAddress);
    } else {
      navigation.goBack();
    }
  };

  const handleSupport = async () => {
    try {
      // Get orderId from AsyncStorage
      const orderId = await AsyncStorage.getItem("orderId");

      if (!orderId) {
        Alert.alert("Error", "No active order found");
        return;
      }

      // Call API to update support_required
      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("table_name", "orders");
      formData.append("id", orderId);
      formData.append("support_required", "1");

      console.log("📞 Support requested - Updating order:", {
        orderId,
        support_required: "1",
      });

      const response = await apiCall(formData);

      if (response && response.result) {
        console.log("✅ Support request updated successfully");
        // Navigate to order screen with Chat tab active
        router.push({
          pathname: "/order/order_place",
          params: { tab: "Chat" },
        });
      } else {
        console.error("❌ Failed to update support request:", response);
        Alert.alert(
          "Error",
          "Failed to submit support request. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error in handleSupport:", error);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {backBtn && (
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <BackArrow />
          </TouchableOpacity>
        )}
        {!homeScreen ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <View style={styles.userContainer}>
            <Image
              source={require("@/assets/images/applogo.png")}
              style={styles.userImage}
            />
            <View>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.userName}>👋 {userName}</Text>
            </View>
          </View>
        )}
      </View>

      {icon === true &&
        (support ? (
          <TouchableOpacity onPress={handleSupport}>
            <ChatSupport />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onpress}>
            <Add />
          </TouchableOpacity>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray100,
    borderRadius: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary100,
  },
});
