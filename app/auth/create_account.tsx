import Camera from "@/assets/svgs/addImage.svg";
import Gallery from "@/assets/svgs/addImage2.svg";
import Arrow from "@/assets/svgs/backarrow.svg";
import DOB from "@/assets/svgs/profile/Calendar.svg";
import Phone from "@/assets/svgs/profile/Call.svg";
import Email from "@/assets/svgs/profile/Sms.svg";
import Profile from "@/assets/svgs/profileIcon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  LogBox,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "~/components/button";
import InputField from "~/components/inputfield";
import RadioButton from "~/components/radio_button";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";

// Suppress the specific warning about MediaTypeOptions
LogBox.ignoreLogs(["[expo-image-picker] `ImagePicker.MediaTypeOptions`"]);

type User = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  zip: string;
  image: any;
  documentFront: any;
  documentBack: any;
  documentType: string;
  iqamaId?: string;
  companyNumber?: string;
  secondaryEmail?: string;
  taxNumber?: string;
  companyCategory?: string;
  online?: boolean;
  verified?: boolean;
};

export default function CreateAccount() {
  const [activeTab, setActiveTab] = useState<string>("Individual");
  const [individualScreen, setIndividualScreen] = useState(true);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [currentField, setCurrentField] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // For storing uploaded file names
  const [uploadedFiles, setUploadedFiles] = useState({
    image: "",
    documentFront: "",
    documentBack: "",
  });

  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    city: "",
    zip: "",
    image: null,
    documentFront: null,
    documentBack: null,
    documentType: "Passport",
    iqamaId: "",
    companyNumber: "",
    secondaryEmail: "",
    taxNumber: "",
    companyCategory: "",
    online: false,
    verified: false,
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        if (userId) {
          setUserId(userId);
        }
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
    fetchUserId();
  }, []);

  const handleInputChange = (field: keyof User, value: string) => {
    setUser((prevUser) => ({ ...prevUser, [field]: value }));
  };

  const handleActiveCompany = () => {
    setActiveTab("Company");
    setIndividualScreen(false);
  };

  const handleIndividualScreen = () => {
    setActiveTab("Individual");
    setIndividualScreen(true);
  };

  const openImagePicker = (field: string) => {
    setCurrentField(field);
    setImagePickerVisible(true);
  };

  // Upload the image to server and get filename
  const uploadImage = async (uri: string, fieldName: string) => {
    if (!uri) return null;

    try {
      setIsLoading(true);

      // Prepare file info
      const uriParts = uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `${fieldName}_${Date.now()}.${fileType}`;

      const formData = new FormData();
      formData.append("type", "upload_data");
      formData.append("user_id", userId || "");
      formData.append("file", {
        uri: uri,
        name: fileName,
        type: `image/${fileType}`,
      } as any);

      // Call your API endpoint for file upload
      const response = await apiCall(formData);

      if (response.result && response.file_name) {
        // Store the filename returned by the server
        setUploadedFiles((prev) => ({
          ...prev,
          [fieldName]: response.file_name,
        }));
        return response.file_name;
      } else {
        throw new Error(response.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Upload Error", "Failed to upload image");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Using the same approach as EditProfile
  const pickImage = async (source: "camera" | "gallery", field: string) => {
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
              aspect: field === "image" ? [1, 1] : [3, 2],
            });

      if (!result.canceled) {
        const selectedUri = result.assets[0].uri;

        // Update the UI immediately with the selected image
        setUser((prev) => ({ ...prev, [field]: selectedUri }));

        // Upload the image in the background and get the filename
        await uploadImage(selectedUri, field);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickImageFromGallery = () => {
    if (!currentField) return;
    setImagePickerVisible(false);
    pickImage("gallery", currentField);
  };

  const pickImageFromCamera = () => {
    if (!currentField) return;
    setImagePickerVisible(false);
    pickImage("camera", currentField);
  };

  const validateForm = () => {
    // Basic validation
    if (!user.name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return false;
    }

    if (!user.email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    // Phone validation
    if (!user.phone.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return false;
    }

    // Individual specific validation
    if (individualScreen) {
      if (!user.iqamaId?.trim()) {
        Alert.alert("Error", "Please enter your Iqama ID");
        return false;
      }
    } else {
      // Company specific validation
      if (!user.companyNumber?.trim()) {
        Alert.alert("Error", "Please enter company number");
        return false;
      }
    }

    // Document validation
    if (!user.documentFront) {
      Alert.alert("Error", "Please upload front side of your document");
      return false;
    }

    if (!user.documentBack) {
      Alert.alert("Error", "Please upload back side of your document");
      return false;
    }

    return true;
  };
  const handleFormSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let formData = new FormData();

      // Set the user type
      const userType = individualScreen ? "employee" : "company";

      // Common fields for both individual and company
      formData.append("type", "update_data");
      formData.append("table_name", "users");
      formData.append("id", userId || "");
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone);
      formData.append("address", user.address);
      formData.append("postal", user.zip);
      formData.append("city", user.city);
      formData.append("user_type", userType);

      // Add image if uploaded
      if (uploadedFiles.image) {
        formData.append("image", uploadedFiles.image);
      }

      // Append documents
      const documents = [];
      if (uploadedFiles.documentFront) {
        documents.push({
          type: user.documentType,
          side: "front",
          file: uploadedFiles.documentFront,
        });
      }

      if (uploadedFiles.documentBack) {
        documents.push({
          type: user.documentType,
          side: "back",
          file: uploadedFiles.documentBack,
        });
      }

      if (documents.length > 0) {
        formData.append("documents", JSON.stringify(documents));
      }

      // Individual specific fields
      if (individualScreen) {
        formData.append("iqama_id", user.iqamaId || "");
        formData.append("dob", user.dob || "");
      }
      // Company specific fields
      else {
        formData.append("company_number", user.companyNumber || "");
        formData.append("company_category", user.companyCategory || "");
        formData.append("secondary_email", user.secondaryEmail || "");
        formData.append("tax_number", user.taxNumber || "");
      }
      console.log(JSON.stringify(formData));

      // Send the data to the API
      const response = await apiCall(formData);

      if (response.result) {
        // Save the user type to AsyncStorage
        await AsyncStorage.setItem("account_type", userType);
        // Navigate to the verified screen
        router.push("/auth/verified");
      } else {
        throw new Error(response.message || "Failed to create account");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/auth/login")}>
            <Arrow />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Verify Your {"\n"}Identity!</Text>
        <Text style={styles.subtitle}>
          Kindly provide correct details for signing up as service provider
        </Text>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={
              activeTab === "Individual" ? styles.activeTab : styles.inactiveTab
            }
            onPress={handleIndividualScreen}
          >
            <Text
              style={
                activeTab === "Individual"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              activeTab === "Company" ? styles.activeTab : styles.inactiveTab
            }
            onPress={handleActiveCompany}
          >
            <Text
              style={
                activeTab === "Company"
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              Company
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Image Picker */}
        <View style={styles.profileContainer}>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPress={() => openImagePicker("image")}
          >
            {user.image ? (
              <Image
                source={{ uri: user.image }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Profile width={40} height={40} />
              </View>
            )}
            <View style={styles.imageIconWrapper}>
              <Camera />
            </View>
          </TouchableOpacity>
        </View>

        {/* Company fields */}
        {!individualScreen && (
          <>
            <InputField
              label="Company Number"
              placeholder="Enter company number"
              IconComponent={<Profile />}
              value={user.companyNumber}
              onChangeText={(text) => handleInputChange("companyNumber", text)}
            />
            <InputField
              label="Company Category"
              placeholder="Enter company category"
              IconComponent={<Profile />}
              value={user.companyCategory}
              onChangeText={(text) =>
                handleInputChange("companyCategory", text)
              }
            />
            <InputField
              label="Secondary Email"
              placeholder="Enter secondary email"
              IconComponent={<Email />}
              value={user.secondaryEmail}
              keyboardType="email-address"
              onChangeText={(text) => handleInputChange("secondaryEmail", text)}
            />
            <InputField
              label="Tax Number"
              placeholder="Enter tax number"
              IconComponent={<Profile />}
              value={user.taxNumber}
              onChangeText={(text) => handleInputChange("taxNumber", text)}
            />
          </>
        )}

        {/* Common User Details Fields */}
        <InputField
          label="Full Name"
          placeholder="Enter your name"
          IconComponent={<Profile />}
          value={user.name}
          onChangeText={(text) => handleInputChange("name", text)}
        />

        <InputField
          label="Email Address"
          placeholder="Enter your email"
          IconComponent={<Email />}
          value={user.email}
          keyboardType="email-address"
          onChangeText={(text) => handleInputChange("email", text)}
        />

        <InputField
          label="Phone Number"
          placeholder="Enter your phone number"
          IconComponent={<Phone />}
          value={user.phone}
          keyboardType="phone-pad"
          onChangeText={(text) => handleInputChange("phone", text)}
        />

        <InputField
          label="Address"
          placeholder="Enter your address"
          IconComponent={<Profile />}
          value={user.address}
          onChangeText={(text) => handleInputChange("address", text)}
        />

        <View style={styles.rowContainer}>
          <View style={styles.flexItem}>
            <InputField
              label="City"
              placeholder="Enter city"
              IconComponent={<Profile />}
              value={user.city}
              onChangeText={(text) => handleInputChange("city", text)}
            />
          </View>
          <View style={styles.flexItem}>
            <InputField
              label="Zip Code"
              placeholder="Enter zip code"
              IconComponent={<Profile />}
              value={user.zip}
              onChangeText={(text) => handleInputChange("zip", text)}
            />
          </View>
        </View>

        {/* Individual-specific fields */}
        {individualScreen && (
          <>
            <InputField
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              IconComponent={<DOB />}
              value={user.dob}
              onChangeText={(text) => handleInputChange("dob", text)}
            />
            <InputField
              label="Iqama ID"
              placeholder="Enter your KSA iqama ID /number"
              IconComponent={<Profile />}
              value={user.iqamaId}
              onChangeText={(text) => handleInputChange("iqamaId", text)}
            />
          </>
        )}

        {/* Document Upload Section */}
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
            onSelect={(option) => setUser({ ...user, documentType: option })}
          />

          <Text style={styles.sectionLabel}>
            Front Side of Card<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => openImagePicker("documentFront")}
          >
            {user.documentFront ? (
              <Image
                source={{ uri: user.documentFront }}
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
                <Text style={{ fontSize: 12 }}> (Max. File size: 25 MB)</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>
            Back Side of Card<Text style={{ color: "red" }}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => openImagePicker("documentBack")}
          >
            {user.documentBack ? (
              <Image
                source={{ uri: user.documentBack }}
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
                <Text style={{ fontSize: 12 }}> (Max. File size: 25 MB)</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Fixed Button at Bottom */}
      <View style={styles.buttonContainer}>
        <Button
          title={isLoading ? "Please wait..." : "Submit"}
          onPress={handleFormSubmit}
          disabled={isLoading}
        />
      </View>

      {/* Image Picker Modal */}
      <Modal
        visible={imagePickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImagePickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an option</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromCamera}
            >
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromGallery}
            >
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.cancelButton]}
              onPress={() => setImagePickerVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.secondary,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary100,
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primary300,
    borderRadius: 25,
    marginBottom: 24,
  },
  activeTab: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 16,
    backgroundColor: Colors.secondary,
    borderRadius: 25,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
  },
  inactiveTabText: {
    color: Colors.secondary300,
    fontSize: 16,
    fontWeight: "500",
  },
  inactiveTab: {
    fontSize: 16,
    padding: 16,
    borderRadius: 25,
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageWrapper: {
    borderRadius: 50,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
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
    height: 26,
    width: 26,
    borderRadius: 13,
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
    fontWeight: "500",
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
    marginBottom: 16,
    overflow: "hidden",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    color: Colors.secondary300,
  },
  documentImage: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.secondary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    padding: 16,
    borderRadius: 10,
    backgroundColor: Colors.primary300,
    marginBottom: 12,
    alignItems: "center",
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary300,
  },
  cancelButtonText: {
    color: Colors.secondary,
    fontWeight: "500",
  },
});
