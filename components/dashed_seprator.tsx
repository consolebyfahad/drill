import { View, StyleSheet } from "react-native";
import React from "react";
import { Svg, Line } from "react-native-svg";
import { Colors } from "@/constants/Colors";

interface DashedSeparatorProps {
  width?: number | string;
}

const DashedSeparator: React.FC<DashedSeparatorProps> = ({
  width = "100%",
}) => {
  return (
    <View
      style={[styles.container, typeof width === "number" ? { width } : {}]}
    >
      <Svg height="1" width="100%">
        <Line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke={Colors.primary400}
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
});

export default DashedSeparator;
