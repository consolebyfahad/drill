// NotificationScreen.tsx
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from "react-native";
import NotificationCard from "@/components/notification_card";
import Header from "@/components/header";
import AccountIcon from "@/assets/svgs/profileIcon.svg";

type Notification = {
  id: string;
  title: string;
  message: string;
  dateTime: string;
};

const dummyNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome to the App!",
    message: "Thanks for signing up. Let us know if you need anything.",
    dateTime: "2025-05-08 10:30 AM",
  },
  {
    id: "2",
    title: "Update Available",
    message: "A new version of the app is now available.",
    dateTime: "2025-05-07 3:45 PM",
  },
];

const NotificationScreen: React.FC = () => {
  const [notifications] = useState<Notification[]>(dummyNotifications);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header backBtn={true} title="Notifications" />

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
  notificationList: {
    marginTop: 12,
  },
});

export default NotificationScreen;
