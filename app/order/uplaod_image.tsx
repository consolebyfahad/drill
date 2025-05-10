import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "~/constants/Colors";
import Banner from "@/assets/svgs/uplaodImage.svg";
import Verify from "@/assets/svgs/grayTick.svg";
import Verified from "@/assets/svgs/doubletickicon.svg";

export default function UploadImage() {
  const router = useRouter();
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [recipeImage, setRecipeImage] = useState<string | null>(null);

  // Open camera and capture image
  const captureImage = async (type: "item" | "recipe") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (type === "item") {
        setItemImage(result.assets[0].uri);
      } else {
        setRecipeImage(result.assets[0].uri);
      }
    }
  };

  // Check if both images are uploaded, then navigate back after 3s
  useEffect(() => {
    if (itemImage && recipeImage) {
      setTimeout(() => router.back(), 1000);
    }
  }, [itemImage, recipeImage]);

  return (
    <View style={styles.container}>
      <Banner />
      <Text style={styles.heading}>Upload 1/2</Text>
      <Text style={styles.subText}>
        You must complete the following two steps before proceeding:
      </Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.verificationRow}
          onPress={() => captureImage("item")}
        >
          <Text style={styles.verificationText}>Upload Item Image</Text>
          <View
            style={[
              styles.verificationStatus,
              itemImage ? styles.verifiedStatus : styles.pendingStatus,
            ]}
          >
            {itemImage ? <Verified /> : <Verify />}
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.verificationRow}
          onPress={() => captureImage("recipe")}
        >
          <Text style={styles.verificationText}>Upload Recipe</Text>
          <View
            style={[
              styles.verificationStatus,
              recipeImage ? styles.verifiedStatus : styles.pendingStatus,
            ]}
          >
            {recipeImage ? <Verified /> : <Verify />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary300,
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    fontSize: 22,
    fontWeight: 600,
    color: Colors.secondary,
    marginVertical: 10,
  },
  subText: {
    fontSize: 17,
    color: Colors.secondary100,
    marginBottom: 40,
    textAlign: "center",
    paddingHorizontal: 70,
  },
  inputContainer: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.secondary,
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    backgroundColor: Colors.primary,
  },
  verificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  verificationText: {
    color: Colors.white,
    fontWeight: "500",
  },
  verificationStatus: {
    borderRadius: 99,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedStatus: {
    backgroundColor: Colors.success,
  },
  pendingStatus: {
    backgroundColor: Colors.white,
  },
  divider: {
    borderTopWidth: 1,
    borderColor: Colors.secondary,
  },
});
