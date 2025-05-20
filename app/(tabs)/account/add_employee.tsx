import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";
import Header from "@/components/header";
import Inputfield from "@/components/inputfield";
import Profile from "@/assets/svgs/profileIcon.svg";
import Phone from "@/assets/svgs/profile/Call.svg";
import Email from "@/assets/svgs/profile/Sms.svg";
import DOB from "@/assets/svgs/profile/Calendar.svg";
import Address from "@/assets/svgs/profile/location.svg";
import City from "@/assets/svgs/profile/Global.svg";
import Zip from "@/assets/svgs/profile/zip.svg";
import Building from "@/assets/svgs/buliding.svg";
import Gallery from "@/assets/svgs/addImage2.svg";
import RadioButton from "~/components/radio_button";
import { apiCall } from "~/utils/api";
import Button from "~/components/button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import DropDownPicker from "react-native-dropdown-picker";

type Employee = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  zip: string;
  image: string | null;
  iqamaId: string;
  documentType: string;
  documentFront: string | null;
  documentBack: string | null;
  status: string;
};

type DocumentItem = {
  type: string;
  side: string;
  file: string;
};

type FieldError = {
  [key: string]: string;
};

type UploadedFiles = {
  image: string;
  documentFront: string;
  documentBack: string;
};

const AddEmployee = () => {
  const [employee, setEmployee] = useState<Employee>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    zip: "",
    iqamaId: "",
    documentType: "Passport",
    documentFront: null,
    documentBack: null,
    image: null,
    status: "Active",
  });

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldError>({});

  // For dropdown status picker
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusItems, setStatusItems] = useState([
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
    { label: "Pending", value: "Pending" },
    { label: "Verified", value: "Verified" },
  ]);

  // For storing uploaded file names
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
    image: "",
    documentFront: "",
    documentBack: "",
  });

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (userId) {
          setCompanyId(userId);
        }
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
    fetchCompanyId();
  }, []);

  const handleInputChange = (field: keyof Employee, value: string) => {
    setEmployee((prevEmployee) => ({ ...prevEmployee, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setEmployee((prev) => ({ ...prev, status: value }));
  };

  // Function to handle image selection
  const handleImageSelected = async (field: string, uri: string) => {
    // Update UI immediately
    setEmployee((prev) => ({ ...prev, [field]: uri }));
    setUploadingField(field);

    // Upload the image
    try {
      setIsLoading(true);
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", companyId || "");
      formData.append("file", {
        uri: uri,
        name: `${field}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      formData.append("field", field);

      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        // Store the server filename
        setUploadedFiles((prev) => ({
          ...prev,
          [field]: response.file_name || "",
        }));
      } else {
        // If upload failed, reset the UI and show error
        setEmployee((prev) => ({ ...prev, [field]: null }));
        throw new Error(response.message || "Failed to upload image");
      }
    } catch (error: any) {
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload image. Please try again."
      );
    } finally {
      setIsLoading(false);
      setUploadingField(null);
    }
  };

  // Function to handle image picking from camera or gallery
  const pickImage = async (source: "camera" | "gallery", field: string) => {
    try {
      const permissionStatus =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionStatus.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera or Gallery access is required."
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: true,
              aspect: field === "image" ? [1, 1] : [3, 2],
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: true,
              aspect: field === "image" ? [1, 1] : [3, 2],
            });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;
        await handleImageSelected(field, selectedUri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(
        "Image Picker Error",
        "Something went wrong while picking the image."
      );
    }
  };

  // Function to open image picker dialog
  const openImagePicker = (field: string) => {
    Alert.alert("Select Option", "Choose an option:", [
      { text: "Camera", onPress: () => pickImage("camera", field) },
      { text: "Gallery", onPress: () => pickImage("gallery", field) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - adjust based on your requirements
    return phone.length >= 9 && phone.length <= 15;
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError = {};
    let isValid = true;

    // Validate required fields
    if (!employee.name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!employee.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(employee.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (employee.phone && !validatePhoneNumber(employee.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!employee.dob.trim()) {
      newErrors.dob = "Date of birth is required";
      isValid = false;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(employee.dob)) {
      newErrors.dob = "Date format should be YYYY-MM-DD";
      isValid = false;
    }

    if (!employee.iqamaId?.trim()) {
      newErrors.iqamaId = "Iqama ID is required";
      isValid = false;
    }

    // Document validation
    if (!employee.documentFront) {
      newErrors.documentFront = "Front side of document is required";
      isValid = false;
    }

    if (!employee.documentBack) {
      newErrors.documentBack = "Back side of document is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Prepare documents JSON
      const documents = [];
      if (uploadedFiles.documentFront) {
        documents.push({
          type: employee.documentType,
          side: "front",
          file: uploadedFiles.documentFront,
        });
      }

      if (uploadedFiles.documentBack) {
        documents.push({
          type: employee.documentType,
          side: "back",
          file: uploadedFiles.documentBack,
        });
      }

      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "users");
      formData.append("name", employee.name);
      formData.append("email", employee.email);
      formData.append("phone", employee.phone || "");
      formData.append("dob", employee.dob);
      formData.append("address", employee.address || "");
      formData.append("city", employee.city || "");
      formData.append("postal", employee.zip || "");
      formData.append("iqama_id", employee.iqamaId);
      formData.append("user_type", "employee");
      formData.append("company_id", companyId || "0");
      formData.append("status", employee.status === "Active" ? "1" : "0");
      formData.append("company_verified", "1");

      // Add image if uploaded
      if (uploadedFiles.image) {
        formData.append("image", uploadedFiles.image);
      }

      // Append documents as JSON string
      if (documents.length > 0) {
        formData.append("documents", JSON.stringify(documents));
      }

      // Ensure required fields are present with default values
      formData.append("gender", "");
      formData.append("platform_status", "0");
      formData.append("online_status", "0");

      const response = await apiCall(formData);

      if (response.result) {
        Alert.alert("Success", "Employee added successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        throw new Error(response.message || "Failed to add employee");
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to add employee. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Add Employee"
        backBtn={true}
        backAddress={"/(tabs)/account"}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Profile Image */}
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => openImagePicker("image")}>
            <View style={styles.imageWrapper}>
              {employee.image ? (
                <Image
                  source={{ uri: employee.image }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Profile width={40} height={40} />
                </View>
              )}
              <View style={styles.imageIconWrapper}>
                <Ionicons name="camera" size={16} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Display name and email below profile image */}
          <Text style={styles.userName}>
            {employee.name || "Employee Name"}
          </Text>
          <Text style={styles.userEmail}>
            {employee.email || "employee@example.com"}
          </Text>

          {/* Employee Status Dropdown */}
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Status</Text>
            <DropDownPicker
              open={statusOpen}
              value={employee.status}
              items={statusItems}
              setOpen={setStatusOpen}
              setValue={(value) => handleStatusChange(value)}
              setItems={setStatusItems}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={styles.dropdownText}
              itemStyle={styles.dropdownItem}
              ArrowDownIconComponent={() => (
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors.secondary}
                />
              )}
              ArrowUpIconComponent={() => (
                <Ionicons
                  name="chevron-up"
                  size={20}
                  color={Colors.secondary}
                />
              )}
              zIndex={3000}
              placeholder="Select Status"
            />
          </View>
        </View>
        {/* Employee Details Fields */}
        <Inputfield
          label="Full Name"
          placeholder="Enter your name"
          IconComponent={<Profile />}
          value={employee.name}
          onChangeText={(text) => handleInputChange("name", text)}
          error={errors.name}
          required
        />
        <Inputfield
          label="Email Address"
          placeholder="Enter your email"
          IconComponent={<Email />}
          value={employee.email}
          onChangeText={(text) => handleInputChange("email", text)}
          keyboardType="email-address"
          error={errors.email}
          required
        />
        <Inputfield
          label="Date Of Birth"
          placeholder="YYYY-MM-DD"
          IconComponent={<DOB />}
          value={employee.dob}
          onChangeText={(text) => handleInputChange("dob", text)}
          error={errors.dob}
          required
        />
        <Inputfield
          label="Iqama ID"
          placeholder="Enter your KSA iqama ID /number"
          IconComponent={<Building />}
          value={employee.iqamaId}
          onChangeText={(text) => handleInputChange("iqamaId", text)}
          error={errors.iqamaId}
          numbersOnly
          required
        />
        {/* Optional Fields */}
        <Inputfield
          label="Phone Number"
          placeholder="Enter your phone number"
          IconComponent={<Phone />}
          value={employee.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
          keyboardType="phone-pad"
          error={errors.phone}
          numbersOnly
        />
        <Inputfield
          label="Address"
          placeholder="Enter your address"
          IconComponent={<Address />}
          value={employee.address}
          onChangeText={(text) => handleInputChange("address", text)}
          error={errors.address}
        />
        <View style={styles.rowContainer}>
          <View style={styles.flexItem}>
            <Inputfield
              label="City"
              placeholder="Enter city"
              IconComponent={<City />}
              value={employee.city}
              onChangeText={(text) => handleInputChange("city", text)}
              error={errors.city}
            />
          </View>
          <View style={styles.flexItem}>
            <Inputfield
              label="Zip Code"
              placeholder="Enter zip code"
              IconComponent={<Zip />}
              value={employee.zip}
              onChangeText={(text) => handleInputChange("zip", text)}
              error={errors.zip}
              numbersOnly
            />
          </View>
        </View>
        {/* Document Upload Section */}
        <View style={styles.uploadSectionContainer}>
          <Text style={styles.uploadDocumentTitle}>Upload Document</Text>

          {/* Document Type Selection */}
          <Text style={styles.sectionLabel}>Select Document Type</Text>
          <RadioButton
            options={["Passport", "Driving License"]}
            selectedOption={employee.documentType}
            onSelect={(option) => handleInputChange("documentType", option)}
          />

          {/* Front Side Document */}
          <Text style={styles.sectionLabel}>
            Front Side of Card<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              errors.documentFront ? styles.uploadBoxError : null,
            ]}
            onPress={() => openImagePicker("documentFront")}
            disabled={isLoading && uploadingField === "documentFront"}
          >
            {isLoading && uploadingField === "documentFront" ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : employee.documentFront ? (
              <Image
                source={{ uri: employee.documentFront }}
                style={styles.documentImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.uploadContent}>
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </View>
                <Text style={styles.uploadText}>
                  Click to Upload Front Side of Card
                </Text>
                <Text style={styles.uploadSizeText}>
                  (Max. File size: 25 MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.documentFront && (
            <Text style={styles.errorText}>{errors.documentFront}</Text>
          )}

          {/* Back Side Document */}
          <Text style={styles.sectionLabel}>
            Back Side of Card<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              errors.documentBack ? styles.uploadBoxError : null,
            ]}
            onPress={() => openImagePicker("documentBack")}
            disabled={isLoading && uploadingField === "documentBack"}
          >
            {isLoading && uploadingField === "documentBack" ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : employee.documentBack ? (
              <Image
                source={{ uri: employee.documentBack }}
                style={styles.documentImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.uploadContent}>
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </View>
                <Text style={styles.uploadText}>
                  Click to Upload Back Side of Card
                </Text>
                <Text style={styles.uploadSizeText}>
                  (Max. File size: 25 MB)
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.documentBack && (
            <Text style={styles.errorText}>{errors.documentBack}</Text>
          )}
        </View>
        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? "Please wait..." : "Save"}
            onPress={handleFormSubmit}
            disabled={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddEmployee;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    paddingBottom: 54,
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: 50,
  },
  profileImage: {
    height: 96,
    width: 96,
    borderRadius: 48,
  },
  profileImagePlaceholder: {
    height: 96,
    width: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary300,
    alignItems: "center",
    justifyContent: "center",
  },
  imageIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "500",
    color: Colors.secondary,
    marginTop: 12,
  },
  userEmail: {
    color: Colors.secondary300,
    marginBottom: 16,
  },
  dropdownContainer: {
    marginTop: 10,
    width: "100%",
    zIndex: 3000,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.secondary,
    marginBottom: 8,
  },
  dropdown: {
    borderColor: Colors.gray200,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.secondary,
  },
  dropdownList: {
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  dropdownItem: {
    borderBottomColor: Colors.gray200,
    borderBottomWidth: 0.5,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  flexItem: {
    flex: 1,
  },
  uploadSectionContainer: {
    marginTop: 20,
  },
  uploadDocumentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.secondary,
    marginBottom: 16,
    textAlign: "center",
  },
  sectionLabel: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 16,
  },
  uploadBox: {
    height: 150,
    padding: 6,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.secondary300,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  uploadBoxError: {
    borderColor: "red",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIconContainer: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.secondary300,
    textAlign: "center",
    fontWeight: "500",
  },
  uploadSizeText: {
    fontSize: 12,
    color: Colors.secondary300,
    marginTop: 4,
  },
  documentImage: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    marginTop: 30,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
