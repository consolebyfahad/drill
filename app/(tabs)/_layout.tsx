import { Tabs } from "expo-router";
import { View } from "react-native";
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
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          color: Colors.secondary,
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
