import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Camera from "@/assets/svgs/camera.svg";
import { Colors } from "~/constants/Colors";
import Header from "~/components/header";
import Seprator from "~/components/seprator";
import Button from "~/components/button";

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
  const [description, setDescription] = useState("");
  const [totalPrice, setTotalPrice] = useState();
  const [paymentMethod, setPaymentMethod] = useState("me");

  const handleUploadPress = () => {
    // Navigate to upload image screen
    router.push("/order/uplaod_image");
  };

  const handleNextPress = () => {
    // Handle next button press
    console.log("Next pressed");
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
            style={styles.uploadButton}
            onPress={handleUploadPress}
          >
            <CameraIcon />
            <Text style={styles.uploadText}>
              Upload the picture of item and bill
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
    fontWeight: 600,
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
  icon: {
    marginRight: 15,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 10,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.secondary300,
  },
  descriptionInput: {
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 16,
    height: 120,
    textAlignVertical: "top",
    fontSize: 16,
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
    color: Colors.secondary300,
  },
  priceInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
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
