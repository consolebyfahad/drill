import { useEffect } from "react";
import { useRouter } from "expo-router";
import { View, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        setTimeout(() => {
          if (userId) {
            router.replace("/(tabs)");
          } else {
            router.replace("/welcome");
          }
        }, 2000);
      } catch (error) {
        console.error("Error checking user data:", error);
        router.replace("/welcome");
      }
    };

    checkUser();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../assets/images/splash.png")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
