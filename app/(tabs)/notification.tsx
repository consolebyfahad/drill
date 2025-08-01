import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import NotificationCard from "@/components/notification_card";
import Header from "@/components/header";
import AccountIcon from "@/assets/svgs/profileIcon.svg";
import { SafeAreaView } from "react-native-safe-area-context";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

type Notification = {
  id: string;
  title: string;
  message: string;
  dateTime: string;
};

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Welcome to the App!",
      message: "Thanks for signing up. Let us know if you need anything.",
      dateTime: "2025-05-08 10:30 AM",
    },
  ]);

  const handleGetNotification = async () => {
    const title = "Test Notification";
    const message = "This is a test push notification.";
    const dateTime = new Date().toLocaleString();

    // Add to local state (UI list)
    const newNotification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      dateTime,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Show local push notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
      },
      trigger: null,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header title="Notifications" />

        <View style={styles.notificationList}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              icon={<AccountIcon />}
              title={notification.title}
              message={notification.message}
              dateTime={notification.dateTime}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  notificationList: {
    marginTop: 12,
  },
});

export default NotificationScreen;
