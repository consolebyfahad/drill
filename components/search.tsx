import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import LocationIcon from "@/assets/svgs/locationIcon.svg";
import CurrentLocation from "@/assets/svgs/GPS.svg";
import SearchIcon from "@/assets/svgs/searchIcon.svg";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";

export default function Search() {
  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <LocationIcon />
        <TextInput
          placeholder="All Services Available"
          placeholderTextColor="#707070"
          style={styles.input}
        />
        {/* Current Location Button */}
        <TouchableOpacity>
          <CurrentLocation />
        </TouchableOpacity>
      </View>

      {/* Search Button */}
      <TouchableOpacity style={styles.searchButton}>
        <SearchIcon />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: Colors.gray100,
    padding: 16,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    color: Colors.secondary100,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  searchButton: {
    backgroundColor: Colors.secondary,
    padding: 10,
    borderRadius: 12,
  },
});
