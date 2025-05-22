import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";
import Camera from "@/assets/svgs/camera.svg";
import { FONTS } from "~/constants/Fonts";

export default function SelectedImage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async (source: "camera" | "gallery") => {
    let result;

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to take pictures!");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need gallery permissions to access your photos!");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });
    }

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const openImagePicker = () => {
    Alert.alert("Select Option", "Choose an option:", [
      { text: "Camera", onPress: () => pickImage("camera") },
      { text: "Gallery", onPress: () => pickImage("gallery") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <>
      <Text style={styles.title}>Upload Picture</Text>
      <TouchableOpacity
        onPress={openImagePicker}
        style={styles.uploadContainer}
      >
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.image} />
        ) : (
          <View style={styles.iconWrapper}>
            <Camera />
          </View>
        )}
        <Text style={styles.text}>
          {selectedImage
            ? "Change Image"
            : "Upload the picture here where you want this service."}
        </Text>
      </TouchableOpacity>
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
  uploadContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary300,
    padding: 16,
    borderRadius: 10,
  },
  iconWrapper: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "white",
  },
  text: {
    marginLeft: 16,
    color: Colors.gray600,
    flex: 1,
  },
});
