import { View, Text, TextInput, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { FONTS } from "~/constants/Fonts";

export default function SelectedDescription() {
  return (
    <>
      <Text style={styles.title}>Describe Your Problem</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter description here..."
        multiline
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
    color: Colors.secondary,
  },
  input: {
    backgroundColor: Colors.primary300,
    padding: 16,
    borderRadius: 10,
    height: 128,
    textAlignVertical: "top",
  },
});
