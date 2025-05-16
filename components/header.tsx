import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
import BackArrow from "@/assets/svgs/Arrow.svg";
import ChatSupport from "@/assets/svgs/chatSupport.svg";
import { Colors } from "~/constants/Colors";
import Add from "@/assets/svgs/add.svg";

type HeaderProps = {
  userName?: string;
  title?: string;
  homeScreen?: boolean;
  icon?: boolean;
  support?: boolean;
  backBtn?: boolean;
  onpress?: any;
};

export default function Header({
  userName,
  title,
  homeScreen,
  icon = false,
  support = false,
  backBtn,
  onpress,
}: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {backBtn && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BackArrow />
          </TouchableOpacity>
        )}
        {!homeScreen ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <View style={styles.userContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
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
          <TouchableOpacity>
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
    fontWeight: "600",
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
    fontWeight: "600",
    color: Colors.secondary,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.secondary100,
  },
});
