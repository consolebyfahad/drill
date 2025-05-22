import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import DashedSeparator from "@/components/dashed_seprator";
import { Colors } from "@/constants/Colors";
import Tick from "@/assets/svgs/tick.svg";
import { FONTS } from "~/constants/Fonts";
interface StepperProps {
  step?: boolean;
}

const Stepper: React.FC<StepperProps> = ({ step }) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepContainer}>
        {/* Step 1 */}
        <View style={styles.step}>
          <View style={styles.stepIconContainer}>
            <Tick />
          </View>
          <Text style={styles.stepText}>Step 1</Text>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <DashedSeparator width={110} />
        </View>

        {/* Step 2 */}
        <View style={styles.step}>
          <View
            style={[
              styles.stepIconContainer,
              step ? styles.activeStep : styles.inactiveStep,
            ]}
          >
            <View style={[styles.innerIconContainer]}>
              {step ? (
                <Tick />
              ) : (
                <View style={{ height: 24, width: 24 }}></View>
              )}
            </View>
          </View>
          <Text style={styles.stepText}>Step 2</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  step: {
    alignItems: "center",
  },
  stepIconContainer: {
    padding: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
  },
  activeStep: {
    backgroundColor: Colors.primary,
  },
  inactiveStep: {
    backgroundColor: Colors.primary200,
  },
  innerIconContainer: {
    borderRadius: 25,
    borderColor: Colors.secondary300,
    borderWidth: 1,
  },
  stepText: {
    fontSize: 10,
    marginTop: 4,
    fontFamily: FONTS.regular,
  },
  separator: {
    marginHorizontal: 14,
    marginBottom: 8,
  },
});

export default Stepper;
