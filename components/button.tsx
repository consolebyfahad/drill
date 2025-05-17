import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  DimensionValue,
} from "react-native";
import { Colors } from "~/constants/Colors";

type ButtonProps = {
  title?: string;
  onPress?: () => Promise<void> | void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  width?: DimensionValue;
  bgColor?: string;
  textColor?: string;
  Icon?: React.ReactNode;
  textSize?: number;
  paddingvertical?: number;
  disabled?: boolean;
  style?: any;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  fullWidth = true,
  width,
  bgColor,
  textColor,
  Icon,
  textSize,
  paddingvertical,
  disabled,
  style,
}: ButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    await onPress();
    setLoading(false);
  };

  return (
    <TouchableOpacity
      style={[
        style,
        styles.button,
        fullWidth
          ? styles.fullWidth
          : width !== undefined
          ? { width: width as DimensionValue }
          : null,
        variant === "primary" ? styles.primary : styles.secondary,
        bgColor && { backgroundColor: bgColor },
        paddingvertical !== undefined
          ? { paddingVertical: paddingvertical }
          : null,
      ]}
      onPress={handlePress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator
          color={textColor || (variant === "primary" ? "#fff" : "#000")}
        />
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {Icon ? Icon : ""}
          <Text
            style={[
              styles.text,
              variant === "primary" ? styles.textPrimary : styles.textSecondary,
              textColor && { color: textColor },
              textSize !== undefined ? { fontSize: textSize } : null,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primary300,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  textPrimary: {
    color: "#FFFFFF",
  },
  textSecondary: {
    color: "#333333",
  },
  disabledButton: {
    backgroundColor: Colors.secondary200,
  },
});
