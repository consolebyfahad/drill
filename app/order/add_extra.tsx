import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import Camera from "@/assets/svgs/camera.svg";
import { Colors } from "~/constants/Colors";
import Header from "~/components/header";
import Seprator from "~/components/seprator";
import Button from "~/components/button";
import { apiCall } from "~/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONTS } from "~/constants/Fonts";

// SVG Icons (simulated with components)
const CameraIcon = () => (
  <View style={styles.icon}>
    <Camera />
  </View>
);

const UserIcon = () => (
  <View style={styles.paymentIcon}>
    <Text style={{ fontSize: 18 }}>👤</Text>
  </View>
);

const HandIcon = () => (
  <View style={styles.paymentIcon}>
    <Text style={{ fontSize: 18 }}>💰</Text>
  </View>
);

export default function AddExtra() {
  const params = useLocalSearchParams();
  // Ensure orderId is a string (handle array case)
  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const [description, setDescription] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("me");
  const [uploadedImages, setUploadedImages] = useState(null);
  const [imagesUploaded, setImagesUploaded] = useState(false);

  // Debug log to check orderId
  useEffect(() => {
    console.log("AddExtra - orderId:", orderId);
    if (!orderId) {
      console.error("AddExtra - orderId is undefined!");
    }
  }, [orderId]);

  // Check for uploaded images when the component mounts or is focused
  useFocusEffect(
    useCallback(() => {
      const checkForUploadedImages = async () => {
        try {
          const imagesData = await AsyncStorage.getItem(
            `order_${orderId}_images`
          );

          if (imagesData) {
            const parsedImages = JSON.parse(imagesData);
            setUploadedImages(parsedImages);
            setImagesUploaded(true);
          } else {
            setUploadedImages([]);
            setImagesUploaded(false);
          }
        } catch (error) {
          console.error("Error retrieving uploaded images:", error);
        }
      };

      checkForUploadedImages();
    }, [orderId])
  );

  const handleUploadPress = () => {
    if (!orderId) {
      Alert.alert("Error", "Order ID is missing");
      return;
    }
    router.push({
      pathname: "/order/uplaod_image",
      params: { orderId: String(orderId) },
    });
  };

  const handleNextPress = async () => {
    // Validate orderId first
    if (!orderId) {
      Alert.alert("Error", "Order ID is missing. Please try again.");
      console.error("Order ID is undefined in handleNextPress");
      return;
    }

    // Validate inputs
    if (!description.trim()) {
      Alert.alert("Missing Information", "Please enter a description");
      return;
    }

    if (!totalPrice || isNaN(parseFloat(totalPrice))) {
      Alert.alert("Missing Information", "Please enter a valid price");
      return;
    }

    if (!imagesUploaded || !uploadedImages) {
      Alert.alert(
        "Missing Images",
        "Please upload item and receipt images first"
      );
      return;
    }

    console.log("Submitting extra with orderId:", orderId);

    try {
      // Prepare the final images object
      const finalImages = {
        itemImage: uploadedImages.itemImage,
        recipeImage: uploadedImages.recipeImage,
      };

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("table_name", "orders");
      formData.append("id", String(orderId));
      formData.append("final_images", JSON.stringify(finalImages));
      formData.append("extra_detail", description);
      formData.append("extra_amount", totalPrice);
      formData.append("paid_by", paymentMethod);

      console.log("FormData prepared:", {
        order_id: String(orderId),
        final_images: finalImages,
        extra_detail: description,
        extra_amount: totalPrice,
        paid_by: paymentMethod,
      });
      console.log(formData);

      const response = await apiCall(formData);
      console.log(response);
      if (response && response.result === true) {
        // Clear the stored images after successful submission
        await AsyncStorage.removeItem(`order_${orderId}_images`);

        // Navigate to order place screen
        router.push({
          pathname: "/order/order_place",
          params: { orderId: orderId },
        });
      } else {
        Alert.alert(
          "Error",
          response?.message || "Failed to update order information"
        );
      }
    } catch (error) {
      console.error("Error updating order information:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating the order information"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Back button */}
        <Header title="Add Extra" backBtn={true} />
        {/* Upload Picture Section */}
        <View>
          <Text style={styles.sectionTitle}>Upload Picture</Text>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              imagesUploaded && styles.uploadButtonComplete,
            ]}
            onPress={handleUploadPress}
          >
            <CameraIcon />
            <Text style={styles.uploadText}>
              {imagesUploaded
                ? "Images uploaded successfully ✓"
                : "Upload the picture of item and bill"}
            </Text>
          </TouchableOpacity>
        </View>
        <Seprator />

        {/* Purchase Detail Section */}
        <View>
          <Text style={styles.sectionTitle}>Purchase Detail</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Enter Description here...."
            multiline
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <Seprator />

        {/* Total Price Section */}
        <View>
          <Text style={styles.sectionTitle}>Total Price</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencyText}>SAR</Text>
            <TextInput
              style={styles.priceInput}
              value={totalPrice}
              placeholder="0000.00"
              onChangeText={setTotalPrice}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Seprator />

        {/* Payment System Section */}
        <View>
          <Text style={styles.sectionTitle}>Payment System</Text>
          <View style={styles.paymentOptions}>
            {/* Paid by Me option */}
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setPaymentMethod("me")}
            >
              <View style={styles.paymentRow}>
                <UserIcon />
                <Text style={styles.paymentText}>Paid by Me</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === "me" && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === "me" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>

            {/* Paid by Customer option */}
            <TouchableOpacity
              style={styles.paymentOption}
              onPress={() => setPaymentMethod("customer")}
            >
              <View style={styles.paymentRow}>
                <HandIcon />
                <Text style={styles.paymentText}>Paid by Customer</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  paymentMethod === "customer" && styles.radioButtonSelected,
                ]}
              >
                {paymentMethod === "customer" && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Button */}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button onPress={handleNextPress} title="Next" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: 16,
    color: Colors.secondary,
  },
  uploadButton: {
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonComplete: {
    backgroundColor: Colors.primary300,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  icon: {
    marginRight: 15,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
  },
  uploadText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  descriptionInput: {
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  priceInputContainer: {
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  currencyText: {
    fontSize: 16,
    marginRight: 8,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  priceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentIcon: {
    marginRight: 15,
  },
  paymentText: {
    fontSize: 16,
    color: "#424242",
    fontFamily: FONTS.regular,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 14,
    height: 14,
    borderRadius: 9,
    backgroundColor: Colors.primary,
  },
  buttonContainer: {
    padding: 16,
  },
});
