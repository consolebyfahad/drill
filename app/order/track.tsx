import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Header from "~/components/header";
import ProviderCard from "~/components/provider_card";
import { Colors } from "~/constants/Colors";
import Accepted from "@/assets/svgs/Button.svg";
import OTW from "@/assets/svgs/RecordButton.svg";
import Arrived from "@/assets/svgs/TrackButton.svg";
import Profile from "@/assets/svgs/profile-circle.svg";
import Button from "~/components/button";

export default function Track() {
  const [status, setStatus] = useState();
  const slideAnim = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  const handleAlert = () => {};
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/Order-Track.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <Header
            backBtn={true}
            title={`Track Customer`}
            icon={true}
            support={true}
          />
        </View>

        {/* Animated Bottom Sheet */}
        <Animated.View
          style={[
            styles.contentWrapper,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.contentHeader}>
            <Profile />
            <Text style={styles.title}>
              You are estimated to arrive at the customer’s location in 13
              minutes
            </Text>
          </View>
          <View style={styles.content}>
            {/* Status Tracking */}
            <View style={styles.statusContainer}>
              <View style={styles.statusItem}>
                <Accepted width={40} height={40} marginBottom={4} />
                <Text style={styles.statusText}> Order</Text>
                <Text style={styles.statusText}>Accepted</Text>
              </View>
              <View style={styles.line} />
              <View style={styles.statusItem}>
                <OTW width={40} height={40} marginBottom={4} />
                <Text style={styles.statusText}>On the Way</Text>
              </View>
              <View style={styles.lineInactive} />
              <View style={styles.statusItem}>
                <Arrived width={40} height={40} marginBottom={4} />
                <Text style={styles.statusText}>Arrived</Text>
              </View>
            </View>
            <ProviderCard />
          </View>
          {status === "Arived" && (
            <View style={styles.buttonContainer}>
              <Button title="Send Alert" onPress={handleAlert} />
            </View>
          )}
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    paddingTop: 16,
    justifyContent: "space-between",
  },
  header: {
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 14,
    marginVertical: 20,
  },
  statusItem: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: Colors.gray300,
  },
  line: {
    height: 3,
    flex: 1,
    borderRadius: 99,
    backgroundColor: Colors.primary,
    marginHorizontal: 8,
  },
  lineInactive: {
    height: 3,
    flex: 1,
    borderRadius: 99,
    backgroundColor: Colors.primary100,
    marginHorizontal: 8,
  },
  contentWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: "100%",
    elevation: 1,
    shadowColor: Colors.gray100,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    overflow: "hidden",
    shadowRadius: 4,
  },
  contentHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
  },
  buttonContainer: {
    padding: 16,
  },
});
