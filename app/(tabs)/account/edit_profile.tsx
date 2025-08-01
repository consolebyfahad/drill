import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";
import Header from "@/components/header";
import Seprator from "@/components/seprator";
import Inputfield from "@/components/inputfield";
import Profile from "@/assets/svgs/profileIcon.svg";
import Phone from "@/assets/svgs/profile/Call.svg";
import Email from "@/assets/svgs/profile/Sms.svg";
import DOB from "@/assets/svgs/profile/Calendar.svg";
import Address from "@/assets/svgs/profile/location.svg";
import City from "@/assets/svgs/profile/Global.svg";
import Zip from "@/assets/svgs/profile/zip.svg";
import Building from "@/assets/svgs/buliding.svg";
import Tax from "@/assets/svgs/tax.svg";
import Gallery from "@/assets/svgs/addImage2.svg";
import RadioButton from "~/components/radio_button";
import { apiCall } from "~/utils/api";
import Button from "~/components/button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "~/constants/Fonts";
import CustomInputField from "~/components/CustomInputField";

type User = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  zip: string;
  image: any;
  user_type: string;
  // Individual specific fields
  iqamaId: string;
  documentType: string;
  documents: DocumentItem[];
  documentFront: any;
  documentBack: any;
  // Company specific fields
  companyNumber: string;
  companyCategory: string;
  commercialRegistrationNumber: string;
  secondaryEmail: string;
  taxNumber: string;
  // Status fields
  online?: boolean;
  verified?: boolean;
};

type DocumentItem = {
  type: string;
  side: string;
  file: string;
};

type FieldError = {
  [key: string]: string;
};

export default function EditProfile() {
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    zip: "",
    iqamaId: "",
    documentType: "Passport",
    documentFront: "",
    documentBack: "",
    image: "",
    documents: [],
    user_type: "individual",
    // Company fields
    companyNumber: "",
    companyCategory: "",
    commercialRegistrationNumber: "",
    secondaryEmail: "",
    taxNumber: "",
    verified: false,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldError>({});
  const [imageBaseUrl, setImageBaseUrl] = useState<string>(
    "https://7tracking.com/saudiservices/images/"
  );
  const [isCompanyAccount, setIsCompanyAccount] = useState<boolean>(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem("user_id");
      const userType = await AsyncStorage.getItem("user_type");

      if (!storedUserId) throw new Error("User ID not found");

      setUserId(storedUserId);
      setIsCompanyAccount(userType === "company");

      const formData = new FormData();
      formData.append("type", "profile");
      formData.append("user_id", storedUserId);

      const response = await apiCall(formData);

      if (response.profile || response.user) {
        const profileData = response.profile || response.user;

        // Parse documents if they exist
        let parsedDocuments: DocumentItem[] = [];

        if (
          profileData.documents &&
          typeof profileData.documents === "string" &&
          profileData.documents.trim() !== ""
        ) {
          try {
            // Clean up the escaped string
            const cleaned = profileData.documents
              .replace(/\\"/g, '"')
              .replace(/^"|"$/g, "");

            parsedDocuments = JSON.parse(cleaned);
          } catch (e) {
            console.error("Failed to parse documents:", e);
          }
        }

        let frontDoc = parsedDocuments.find((doc) => doc.side === "front");
        let backDoc = parsedDocuments.find((doc) => doc.side === "back");

        setUser({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          dob:
            profileData.dob && profileData.dob !== "0000-00-00"
              ? profileData.dob
              : "",
          address: profileData.address || "",
          city: profileData.city || "",
          zip: profileData.postal || "",
          iqamaId: profileData.iqama_id || "",
          documentType:
            parsedDocuments.length > 0 ? parsedDocuments[0].type : "Passport",
          documentFront: frontDoc ? frontDoc.file : "",
          documentBack: backDoc ? backDoc.file : "",
          image: profileData.image || "",
          documents: parsedDocuments,
          user_type: profileData.user_type || userType || "individual",
          // Company fields
          companyNumber: profileData.company_code || "",
          companyCategory: profileData.company_category || "",
          commercialRegistrationNumber:
            profileData.commercial_registration_number || "",
          secondaryEmail: profileData.secondary_email || "",
          taxNumber: profileData.tax_number || "",
          verified: profileData.company_verified === "1",
        });

        // Update company flag based on user data
        setIsCompanyAccount(
          profileData.user_type === "company" || userType === "company"
        );
      } else {
        throw new Error(response.message || "Failed to load profile.");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (
    source: "camera" | "gallery",
    field: string = "profile"
  ) => {
    let result;

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

      result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: true,
              aspect: [1, 1],
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.8,
              allowsEditing: true,
              aspect: field === "profile" ? [1, 1] : [3, 2],
            });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;

        if (field === "profile") {
          setSelectedImage(selectedUri);
          await handleImageUpdate(selectedUri);
        } else {
          await handleDocumentUpload(selectedUri, field);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(
        "Image Picker Error",
        "Something went wrong while picking the image."
      );
    }
  };

  const handleImageUpdate = async (imageUri: string) => {
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }

    try {
      setUploading(true);
      const uriParts = imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", userId);
      formData.append("file", {
        uri: imageUri,
        name: `profile.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        setUser((prevUser) => ({
          ...prevUser,
          image: response.file_name,
        }));
        Alert.alert("Success", "Profile image updated successfully!");
      } else {
        throw new Error(response.message || "Failed to upload image.");
      }
    } catch (err: any) {
      Alert.alert("Upload Error", err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (imageUri: string, field: string) => {
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }

    try {
      setUploading(true);
      setUploadingField(field);

      const uriParts = imageUri.split(".");
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", userId);
      formData.append("file", {
        uri: imageUri,
        name: `${field}.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      formData.append("field", field);

      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        if (field === "documentFront") {
          setUser((prevUser) => ({
            ...prevUser,
            documentFront: response.file_name,
          }));
        } else if (field === "documentBack") {
          setUser((prevUser) => ({
            ...prevUser,
            documentBack: response.file_name,
          }));
        }

        // Update documents array
        const newDocument = {
          type: user.documentType,
          side: field === "documentFront" ? "front" : "back",
          file: response.file_name,
        };

        const updatedDocuments = [...user.documents];
        const existingIndex = updatedDocuments.findIndex(
          (doc) => doc.side === (field === "documentFront" ? "front" : "back")
        );

        if (existingIndex >= 0) {
          updatedDocuments[existingIndex] = newDocument;
        } else {
          updatedDocuments.push(newDocument);
        }

        setUser((prevUser) => ({
          ...prevUser,
          documents: updatedDocuments,
        }));

        Alert.alert("Success", "Document uploaded successfully!");
      } else {
        throw new Error(response.message || "Failed to upload document.");
      }
    } catch (err: any) {
      console.error("Document upload error:", err);
      Alert.alert("Upload Error", err.message || "Something went wrong.");
    } finally {
      setUploading(false);
      setUploadingField(null);
    }
  };

  const openImagePicker = (field: string = "profile") => {
    Alert.alert("Select Option", "Choose an option:", [
      { text: "Camera", onPress: () => pickImage("camera", field) },
      { text: "Gallery", onPress: () => pickImage("gallery", field) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    setUser((prevUser) => ({ ...prevUser, [field]: value }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    return phone.length >= 9 && phone.length <= 15;
  };

  const validateZipCode = (zip: string): boolean => {
    return zip.length >= 4 && zip.length <= 10;
  };

  const validateForm = (): boolean => {
    const newErrors: FieldError = {};
    let isValid = true;

    // Common validation for both individual and company
    if (!user.name.trim()) {
      newErrors.name = isCompanyAccount
        ? "Company name is required"
        : "Full name is required";
      isValid = false;
    }

    if (!user.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(user.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!user.phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!validatePhoneNumber(user.phone)) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!user.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    }

    if (!user.city.trim()) {
      newErrors.city = "City is required";
      isValid = false;
    }

    if (!user.zip.trim()) {
      newErrors.zip = "Zip code is required";
      isValid = false;
    } else if (!validateZipCode(user.zip)) {
      newErrors.zip = "Please enter a valid zip code";
      isValid = false;
    }

    // Individual specific validation
    if (!isCompanyAccount) {
      if (user.dob && !/^\d{4}-\d{2}-\d{2}$/.test(user.dob)) {
        newErrors.dob = "Date format should be YYYY-MM-DD";
        isValid = false;
      }

      if (!user.iqamaId?.trim()) {
        newErrors.iqamaId = "Iqama ID is required";
        isValid = false;
      }
    } else {
      // Company specific validation
      if (!user.companyNumber?.trim()) {
        newErrors.companyNumber = "Company number is required";
        isValid = false;
      }

      if (!user.companyCategory?.trim()) {
        newErrors.companyCategory = "Company category is required";
        isValid = false;
      }

      if (user.secondaryEmail && !validateEmail(user.secondaryEmail)) {
        newErrors.secondaryEmail = "Please enter a valid email address";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setError(null);
      setUploading(true);

      if (!userId) throw new Error("User ID not found");

      // Prepare documents JSON if there are any documents
      const documentsJson =
        user.documents.length > 0 ? JSON.stringify(user.documents) : "";

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("id", userId);
      formData.append("table_name", "users");
      formData.append("user_type", isCompanyAccount ? "company" : "employee");

      // Common fields
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone);
      formData.append("address", user.address);
      formData.append("city", user.city);
      formData.append("postal", user.zip);
      formData.append("company_number", user.companyNumber || "");
      formData.append("company_code", user.companyNumber || "");

      // Extract filename from image URL if needed
      let imageName = user.image;
      if (imageName && imageName.includes("/")) {
        imageName = imageName.split("/").pop() || "";
      }
      if (imageName) formData.append("image", imageName);

      // Add documents if there are any
      if (documentsJson) {
        formData.append("documents", documentsJson);
      }

      // Individual specific fields
      if (!isCompanyAccount) {
        formData.append("iqama_id", user.iqamaId || "");
        formData.append("dob", user.dob || "");
        formData.append("secondary_email", "");
        formData.append("tax_number", "");
        formData.append("company_category", "");
        formData.append("commercial_registration_number", "");
      } else {
        // Company specific fields
        formData.append("company_category", user.companyCategory || "");
        formData.append("secondary_email", user.secondaryEmail || "");
        formData.append("tax_number", user.taxNumber || "");
        // formData.append(
        //   "commercial_registration_number",
        //   user.commercialRegistrationNumber || ""
        // );
      }
      console.log("formData", formData);
      const response = await apiCall(formData);

      if (response.result) {
        await AsyncStorage.setItem("user_name", user.name);
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.push("/(tabs)/account") },
        ]);
      } else {
        throw new Error(response.message || "Failed to update profile.");
      }
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    return imageBaseUrl + imagePath;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <Header title="Edit Profile" backBtn={true} />
        {loading ? (
          <View style={styles.loadingScreen}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.mainContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
            >
              {/* Profile Image */}
              <View style={styles.profileContainer}>
                <TouchableOpacity onPress={() => openImagePicker()}>
                  <View style={styles.imageWrapper}>
                    <Image
                      source={
                        selectedImage
                          ? { uri: selectedImage }
                          : user.image
                          ? { uri: getImageUrl(user.image) }
                          : require("~/assets/images/default-profile.png")
                      }
                      style={styles.profileImage}
                    />
                    <View style={styles.imageIconWrapper}>
                      <Ionicons
                        name="camera"
                        size={16}
                        color={Colors.primary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                <Text style={styles.userName}>{user.name || "N/A"}</Text>
                <Text style={styles.userEmail}>{user.email || "N/A"}</Text>
              </View>

              <Seprator />

              {/* Company number (for both) */}
              <Inputfield
                label="Company Number"
                placeholder="Enter company number"
                IconComponent={<Building />}
                value={user.companyNumber}
                onChangeText={(text) =>
                  handleInputChange("companyNumber", text)
                }
                error={errors.companyNumber}
              />

              {/* User Name Field (different label based on type) */}
              <Inputfield
                label={isCompanyAccount ? "Company Name" : "Full Name"}
                placeholder={
                  isCompanyAccount ? "Enter company name" : "Enter your name"
                }
                IconComponent={<Profile />}
                value={user.name}
                onChangeText={(text) => handleInputChange("name", text)}
                error={errors.name}
              />

              <Inputfield
                label="Phone Number"
                placeholder="Enter your phone"
                IconComponent={<Phone />}
                value={user.phone}
                onChangeText={(text) => handleInputChange("phone", text)}
                keyboardType="phone-pad"
                error={errors.phone}
              />

              <Inputfield
                label="Address"
                placeholder="Enter your address"
                IconComponent={<Address />}
                value={user.address}
                onChangeText={(text) => handleInputChange("address", text)}
                error={errors.address}
              />

              <View style={styles.rowContainer}>
                <View style={styles.flexItem}>
                  <Inputfield
                    label="City"
                    placeholder="Enter city"
                    IconComponent={<City />}
                    value={user.city}
                    onChangeText={(text) => handleInputChange("city", text)}
                    error={errors.city}
                  />
                </View>
                <View style={styles.flexItem}>
                  <Inputfield
                    label="Zip Code"
                    placeholder="Enter zip code"
                    IconComponent={<Zip />}
                    value={user.zip}
                    onChangeText={(text) => handleInputChange("zip", text)}
                    error={errors.zip}
                  />
                </View>
              </View>

              {/* Common fields */}
              <Inputfield
                label="Email Address"
                placeholder="Enter your email"
                IconComponent={<Email />}
                value={user.email}
                onChangeText={(text) => handleInputChange("email", text)}
                keyboardType="email-address"
                error={errors.email}
              />

              {/* Secondary email for company */}
              {isCompanyAccount && (
                <Inputfield
                  label="Secondary Email"
                  placeholder="Enter secondary email (Optional)"
                  IconComponent={<Email />}
                  value={user.secondaryEmail}
                  onChangeText={(text) =>
                    handleInputChange("secondaryEmail", text)
                  }
                  keyboardType="email-address"
                  required={false}
                  error={errors.secondaryEmail}
                />
              )}

              {/* Individual specific fields */}
              {!isCompanyAccount && (
                <>
                  {/* <Inputfield
                  label="Date of Birth"
                  placeholder="YYYY-MM-DD"
                  IconComponent={<DOB />}
                  value={user.dob}
                  onChangeText={(text) => handleInputChange("dob", text)}
                  error={errors.dob}
                  dateFormat={true}
                /> */}
                  <CustomInputField
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    IconComponent={<DOB />}
                    value={user.dob}
                    onChangeText={(text) => handleInputChange("dob", text)}
                    fieldName="dob"
                    error={errors.dob}
                    dateFormat={true}
                  />
                  <Inputfield
                    label="Iqama ID"
                    placeholder="Enter your KSA iqama ID/number"
                    IconComponent={<DOB />}
                    value={user.iqamaId}
                    onChangeText={(text) => handleInputChange("iqamaId", text)}
                    error={errors.iqamaId}
                  />
                </>
              )}

              {/* Company specific tax field */}
              {isCompanyAccount && (
                <>
                  <Inputfield
                    label="Tax Number"
                    placeholder="Enter tax number (Optional)"
                    IconComponent={<Tax />}
                    value={user.taxNumber}
                    onChangeText={(text) =>
                      handleInputChange("taxNumber", text)
                    }
                    required={false}
                    error={errors.taxNumber}
                  />
                  <Inputfield
                    label="Company Category"
                    placeholder="Enter company category"
                    IconComponent={<Building />}
                    value={user.companyCategory}
                    onChangeText={(text) =>
                      handleInputChange("companyCategory", text)
                    }
                    error={errors.companyCategory}
                  />
                </>
              )}

              {/* Document Upload Section (only for individual) */}
              {!isCompanyAccount && (
                <View style={styles.documentSection}>
                  <View style={styles.separatorContainer}>
                    <View style={styles.separator} />
                    <Text style={styles.separatorText}>Upload Document</Text>
                    <View style={styles.separator} />
                  </View>

                  <Text style={styles.sectionLabel}>Select Document type</Text>
                  <RadioButton
                    options={["Passport", "Driving licence"]}
                    selectedOption={user.documentType}
                    onSelect={(option) =>
                      setUser({ ...user, documentType: option })
                    }
                  />

                  <Text style={styles.sectionLabel}>
                    Front Side of Card<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.uploadBox,
                      errors.documentFront ? styles.uploadBoxError : null,
                    ]}
                    onPress={() => openImagePicker("documentFront")}
                    disabled={uploading}
                  >
                    {uploading && uploadingField === "documentFront" ? (
                      <ActivityIndicator size="large" color={Colors.primary} />
                    ) : user.documentFront ? (
                      <Image
                        source={{ uri: getImageUrl(user.documentFront) }}
                        style={styles.documentImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.uploadContent}>
                        <View
                          style={{
                            backgroundColor: Colors.primary300,
                            padding: 6,
                            borderRadius: 99,
                            marginBottom: 6,
                          }}
                        >
                          <Gallery />
                        </View>
                        <Text style={styles.uploadText}>
                          Click to Upload Front Side of Card
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                          {" "}
                          (Max. File size: 25 MB)
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {errors.documentFront && (
                    <Text style={styles.errorText}>{errors.documentFront}</Text>
                  )}

                  <Text style={styles.sectionLabel}>
                    Back Side of Card<Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.uploadBox,
                      errors.documentBack ? styles.uploadBoxError : null,
                    ]}
                    onPress={() => openImagePicker("documentBack")}
                    disabled={uploading}
                  >
                    {uploading && uploadingField === "documentBack" ? (
                      <ActivityIndicator size="large" color={Colors.primary} />
                    ) : user.documentBack ? (
                      <Image
                        source={{ uri: getImageUrl(user.documentBack) }}
                        style={styles.documentImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.uploadContent}>
                        <View
                          style={{
                            backgroundColor: Colors.primary300,
                            padding: 6,
                            borderRadius: 99,
                            marginBottom: 6,
                          }}
                        >
                          <Gallery />
                        </View>
                        <Text style={styles.uploadText}>
                          Click to Upload Back Side of Card
                        </Text>
                        <Text style={{ fontSize: 12 }}>
                          {" "}
                          (Max. File size: 25 MB)
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {errors.documentBack && (
                    <Text style={styles.errorText}>{errors.documentBack}</Text>
                  )}
                </View>
              )}

              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleUpdate}
                  title="Update"
                  loading={uploading}
                />
              </View>
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  mainContainer: {
    flex: 1,
    position: "relative",
  },
  scrollContainer: {
    paddingBottom: 34,
  },
  profileContainer: {
    alignItems: "center",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    borderWidth: 2,
    borderColor: Colors.success,
    borderRadius: 999,
    position: "relative",
  },
  profileImage: {
    height: 96,
    width: 96,
    borderRadius: 999,
  },
  imageIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "white",
    height: 24,
    width: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 24,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary,
    marginTop: 12,
  },
  userEmail: {
    color: Colors.secondary300,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 16,
  },
  flexItem: {
    flex: 1,
  },
  documentSection: {
    marginTop: 16,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray200,
  },
  separatorText: {
    paddingHorizontal: 10,
    color: Colors.secondary300,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  sectionLabel: {
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: FONTS.semiBold,
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
    marginBottom: 16,
    overflow: "hidden",
  },
  uploadBoxError: {
    borderColor: "red",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    color: Colors.secondary300,
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
  documentImage: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});
