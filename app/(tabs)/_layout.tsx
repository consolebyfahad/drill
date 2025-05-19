import { Tabs } from "expo-router";
import { View, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import Home from "@/assets/svgs/home.svg";
import HomeFill from "@/assets/svgs/homeFill.svg";
import Notification from "@/assets/svgs/Notification.svg";
import NotificationFill from "@/assets/svgs/fillednotification.svg";
import Orders from "@/assets/svgs/orders.svg";
import OrdersFill from "@/assets/svgs/orderFill.svg";
import Profile from "@/assets/svgs/profileIcon.svg";
import ProfileFill from "@/assets/svgs/profileFill.svg";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 60 + insets.bottom : 60,
          paddingBottom: Platform.OS === "ios" ? insets.bottom : 10,
          borderTopWidth: 1,
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          elevation: 0,
          zIndex: 10,
        },
        tabBarLabelStyle: {
          color: Colors.secondary,
          fontSize: 12,
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                borderTopWidth: focused ? 3 : 0,
                borderTopColor: Colors.secondary,
                borderRadius: 2,
                paddingTop: 6,
                paddingBottom: 9,
              }}
            >
              {focused ? <HomeFill /> : <Home />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                borderTopWidth: focused ? 3 : 0,
                borderTopColor: Colors.secondary,
                borderRadius: 2,
                paddingTop: 6,
                paddingBottom: 9,
              }}
            >
              {focused ? <OrdersFill /> : <Orders />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                borderTopWidth: focused ? 3 : 0,
                borderTopColor: Colors.secondary,
                borderRadius: 2,
                paddingTop: 6,
                paddingBottom: 9,
              }}
            >
              {focused ? <NotificationFill /> : <Notification />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: "center",
                borderTopWidth: focused ? 3 : 0,
                borderTopColor: Colors.secondary,
                borderRadius: 2,
                paddingTop: 6,
                paddingBottom: 9,
              }}
            >
              {focused ? <ProfileFill /> : <Profile />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
