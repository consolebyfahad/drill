import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "~/constants/Colors";
import Banner from "@/assets/svgs/uplaodImage.svg";
import Verify from "@/assets/svgs/grayTick.svg";
import Verified from "@/assets/svgs/doubletickicon.svg";
import { apiCall } from "~/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONTS } from "~/constants/Fonts";

export default function UploadImage() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [itemImage, setItemImage] = useState(null);
  const [itemImageName, setItemImageName] = useState(null);
  const [recipeImage, setRecipeImage] = useState(null);
  const [recipeImageName, setRecipeImageName] = useState(null);

  // Open camera and capture image
  const captureImage = async (type) => {
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      if (type === "item") {
        setItemImage(imageUri);
        handleImageUpload(imageUri, "item");
      } else {
        setRecipeImage(imageUri);
        handleImageUpload(imageUri, "recipe");
      }
    }
  };

  const handleImageUpload = async (imageUri, type) => {
    const userId = await AsyncStorage.getItem("user_id");
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }

    try {
      // Check if imageUri is valid
      if (!imageUri) {
        throw new Error("Invalid image URI");
      }

      const uriParts = imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpg";

      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", userId);
      formData.append("file", {
        uri: imageUri,
        name: `${type}_image_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });

      console.log("Uploading image:", {
        type,
        uri: imageUri,
        fileName: `${type}_image_${Date.now()}.${fileType}`,
      });

      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        console.log("Upload successful:", response.file_name);
        if (type === "item") {
          setItemImageName(response.file_name);
        } else {
          setRecipeImageName(response.file_name);
        }
      } else {
        throw new Error(response.message || "Failed to upload image.");
      }
    } catch (err) {
      Alert.alert("Upload Error", err.message || "Something went wrong.");
      console.error("Upload error:", err);
    }
  };

  // Save uploaded image filenames and navigate back after both images are uploaded
  useEffect(() => {
    if (itemImageName && recipeImageName) {
      setTimeout(() => {
        // Save both filenames to AsyncStorage before navigating back
        const saveImages = async () => {
          try {
            const imageData = JSON.stringify({
              itemImage: itemImageName,
              recipeImage: recipeImageName,
            });
            await AsyncStorage.setItem(`order_${orderId}_images`, imageData);
            router.back();
          } catch (error) {
            console.error("Error saving images:", error);
          }
        };
        saveImages();
      }, 1000);
    }
  }, [itemImageName, recipeImageName]);

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
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    marginVertical: 10,
  },
  subText: {
    fontSize: 17,
    fontFamily: FONTS.regular,
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
