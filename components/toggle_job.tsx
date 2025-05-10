import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
} from "react-native";
import Off from "@/assets/svgs/off.svg";
import On from "@/assets/svgs/on.svg";
import { Colors } from "~/constants/Colors";
const ToggleJob = ({ onToggle, initialValue = false }) => {
  const [isOn, setIsOn] = useState(initialValue);
  const slideFactor = useRef(new Animated.Value(initialValue ? 1 : 0)).current;

  // Calculate the width of the toggle track
  const TRACK_WIDTH = 350;
  const THUMB_WIDTH = 70;
  const TRACK_PADDING = 5;
  const MOVABLE_DISTANCE = TRACK_WIDTH - THUMB_WIDTH - TRACK_PADDING * 3;

  // Create more reliable pan responder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newPosition = Math.max(
          0,
          Math.min(gesture.dx / MOVABLE_DISTANCE, 1)
        );
        slideFactor.setValue(newPosition);
      },
      onPanResponderRelease: (_, gesture) => {
        // If moved more than 30% of the distance, consider it a toggle
        const threshold = 0.3;
        const newValue =
          gesture.dx > MOVABLE_DISTANCE * threshold ? true : false;

        if (isOn !== newValue) {
          setIsOn(newValue);
          if (onToggle) onToggle(newValue);
        }

        Animated.spring(slideFactor, {
          toValue: newValue ? 1 : 0,
          friction: 6,
          tension: 40,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  // Function to handle tap on the track
  const handleToggleTap = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    if (onToggle) onToggle(newValue);

    Animated.spring(slideFactor, {
      toValue: newValue ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();
  };

  // Interpolate background color
  const backgroundColor = slideFactor.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FF3B30", "#4CD964"],
  });

  // Interpolate thumb position
  const thumbPosition = slideFactor.interpolate({
    inputRange: [0, 1],
    outputRange: [TRACK_PADDING, MOVABLE_DISTANCE + TRACK_PADDING],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleToggleTap}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.track,
          {
            // backgroundColor,
            width: TRACK_WIDTH,
            backgroundColor: isOn ? Colors.success : "white",
          },
        ]}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.thumb,
            {
              width: THUMB_WIDTH,
              left: thumbPosition,
              backgroundColor: isOn ? "white" : "red",
            },
          ]}
        >
          <View>
            {isOn ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <On />
                <Text style={{ color: Colors.success }}>On</Text>
              </View>
            ) : (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text style={{ color: isOn ? Colors.success : Colors.white }}>
                    Off
                  </Text>
                  <Off />
                </View>
              </>
            )}
          </View>
        </Animated.View>
        <Text
          style={{
            textAlign: isOn ? "left" : "right",
            color: isOn ? Colors.white : Colors.secondary,
            paddingHorizontal: 16,
          }}
        >
          {isOn ? "Accepting Jobs" : "Currently Offline"}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  track: {
    height: 46,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    position: "relative",
  },
  thumb: {
    height: 30,
    position: "absolute",
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ToggleJob;
