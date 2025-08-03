import Camera from "@/assets/svgs/addImage.svg";
import Gallery from "@/assets/svgs/addImage2.svg";
import Arrow from "@/assets/svgs/backarrow.svg";
import DOB from "@/assets/svgs/profile/Calendar.svg";
import Phone from "@/assets/svgs/profile/Call.svg";
import Email from "@/assets/svgs/profile/Sms.svg";
import Building from "@/assets/svgs/buliding.svg";
import Tax from "@/assets/svgs/tax.svg";
import Profile from "@/assets/svgs/profileIcon.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  LogBox,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "~/components/button";
import RadioButton from "~/components/radio_button";
import { Colors } from "~/constants/Colors";
import { apiCall } from "~/utils/api";
import CustomInputField from "~/components/CustomInputField";
import {
  pickImage,
  showImagePickerAlert,
  uploadImage,
} from "~/utils/uploadData";
import { FONTS } from "~/constants/Fonts";
import DropDownPicker from "react-native-dropdown-picker";

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
  image: string | null;
  documentFront: string | null;
  documentBack: string | null;
  documentType: string;
  iqamaId?: string;
  companyName?: string;
  companyNumber?: string;
  commercialRegistrationNumber?: string;
  secondaryEmail?: string;
  taxNumber?: string;
  companyCategory?: string;
  online?: boolean;
  verified?: boolean;
};

type FieldError = {
  [key: string]: string;
};

type UploadedFiles = {
  image: string;
  documentFront: string;
  documentBack: string;
};
type Category = {
  name: string;
};

export default function CreateAccount() {
  const [activeTab, setActiveTab] = useState<string>("Individual");
  const [individualScreen, setIndividualScreen] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [categories, setCategories] = useState<Category[]>([]);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  // For storing uploaded file names
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
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
    companyName: "",
    companyNumber: "",
    commercialRegistrationNumber: "",
    secondaryEmail: "",
    taxNumber: "",
    companyCategory: "",
    online: false,
    verified: false,
  });

  const getCategories = async () => {
    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "categories");

      const response = await apiCall(formData);
      if (response.data) {
        const mappedCategories = response.data.map((item: any) => ({
          name: item.name,
        }));

        setCategories(mappedCategories);
        const dropdownItems = mappedCategories.map((category, index) => ({
          label: category.name,
          value: category.name,
          key: `category-${index}`,
        }));

        setItems(dropdownItems);
      } else {
        console.log(response.message || "Failed to load categories.");
      }
    } catch (err) {
      console.log("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("user_id");
        const userPhone = await AsyncStorage.getItem("user_phone");
        if (userId) {
          setUserId(userId);
        }
        if (userPhone) {
          setUser((prev) => ({ ...prev, phone: userPhone }));
        }
      } catch (error) {
        console.error("Error fetching user_id:", error);
      }
    };
    fetchUserId();
    getCategories();
  }, []);
  console.log(categories);

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

  const handleCategoryChange = (value: string) => {
    setUser((prevUser) => ({ ...prevUser, companyCategory: value }));
    // Clear error when user selects
    if (errors.companyCategory) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.companyCategory;
        return updated;
      });
    }
  };

  const handleActiveCompany = () => {
    setActiveTab("Company");
    setIndividualScreen(false);
  };

  const handleIndividualScreen = () => {
    setActiveTab("Individual");
    setIndividualScreen(true);
  };

  // Function to handle image selection from uploadData util
  const handleImageSelected = async (field: string, uri: string) => {
    // Update UI immediately
    setUser((prev) => ({ ...prev, [field]: uri }));

    // Upload the image
    const result = await uploadImage(uri, field, userId, setIsLoading);

    if (result.success && result.fileName) {
      // Store the server filename
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: result.fileName || "",
      }));
    } else {
      // If upload failed, reset the UI and show error
      setUser((prev) => ({ ...prev, [field]: null }));
      Alert.alert(
        "Upload Failed",
        result.error || "Failed to upload image. Please try again."
      );
    }
  };

  // Function to handle image picking from camera or gallery
  const handlePickImage = (source: "camera" | "gallery", field: string) => {
    pickImage(source, field, handleImageSelected, (errorMessage) =>
      Alert.alert("Error", errorMessage)
    );
  };

  // Function to open image picker dialog
  const openImagePicker = (field: string) => {
    showImagePickerAlert(field, handlePickImage);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic phone validation - adjust based on your requirements
    return phone.length >= 9 && phone.length <= 15;
  };

  const validateZipCode = (zip: string) => {
    // Adjust based on your zip code requirements
    return zip.length >= 4 && zip.length <= 10;
  };

  const validateForm = () => {
    const newErrors: FieldError = {};
    let isValid = true;

    // Common validation for both individual and company
    if (!user.name.trim()) {
      newErrors.name = individualScreen
        ? "Full name is required"
        : "Company name is required";
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
    if (individualScreen) {
      if (!user.dob.trim()) {
        newErrors.dob = "Date of birth is required";
        isValid = false;
      }

      if (!user.iqamaId?.trim()) {
        newErrors.iqamaId = "Iqama ID is required";
        isValid = false;
      }
      // Document validation
      if (!user.documentFront) {
        newErrors.documentFront = "Front side of document is required";
        isValid = false;
      }

      if (!user.documentBack) {
        newErrors.documentBack = "Back side of document is required";
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
      formData.append("company_code", user.companyNumber || "");

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
        // Set empty values for company-specific fields
        formData.append("secondary_email", "");
        formData.append("tax_number", "");
        formData.append("company_category", "");
      }
      // Company specific fields
      else {
        formData.append("company_category", user.companyCategory || "");
        formData.append("secondary_email", user.secondaryEmail || "");
        formData.append("tax_number", user.taxNumber || "");
        // Set empty values for individual-specific fields
        formData.append("iqama_id", "");
        formData.append("dob", "");
      }
      console.log(formData);
      const response = await apiCall(formData);

      if (response.result) {
        await AsyncStorage.setItem("user_type", userType);
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
      <KeyboardAvoidingView
        style={styles.keyboardConatiner}
        behavior={Platform.OS === "ios" ? "padding" : "position"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        enabled
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
                activeTab === "Individual"
                  ? styles.activeTab
                  : styles.inactiveTab
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

          {/* Common User Details Fields */}
          <CustomInputField
            label="Company Number"
            placeholder="Enter company number"
            IconComponent={<Building />}
            value={user.companyNumber}
            onChangeText={(text) => handleInputChange("companyNumber", text)}
            fieldName="companyNumber"
            error={errors.companyNumber}
          />
          <CustomInputField
            label={individualScreen ? "Full Name" : "Company Name"}
            placeholder={
              individualScreen ? "Enter your name" : "Enter company name"
            }
            IconComponent={<Profile />}
            value={user.name}
            onChangeText={(text) => handleInputChange("name", text)}
            fieldName="name"
            error={errors.name}
          />

          <CustomInputField
            label="Phone Number"
            placeholder="Enter your phone number"
            IconComponent={<Phone />}
            value={user.phone}
            keyboardType="phone-pad"
            onChangeText={(text) => handleInputChange("phone", text)}
            fieldName="phone"
            error={errors.phone}
            // numbersOnly
            maxLength={14}
          />

          <CustomInputField
            label="Address"
            placeholder="Enter your address"
            IconComponent={<Profile />}
            value={user.address}
            onChangeText={(text) => handleInputChange("address", text)}
            fieldName="address"
            error={errors.address}
          />

          <View style={styles.rowContainer}>
            <View style={styles.flexItem}>
              <CustomInputField
                label="City"
                placeholder="Enter city"
                IconComponent={<Profile />}
                value={user.city}
                onChangeText={(text) => handleInputChange("city", text)}
                fieldName="city"
                error={errors.city}
              />
            </View>
            <View style={styles.flexItem}>
              <CustomInputField
                label="Zip Code"
                placeholder="Enter zip code"
                IconComponent={<Profile />}
                value={user.zip}
                onChangeText={(text) => handleInputChange("zip", text)}
                fieldName="zip"
                error={errors.zip}
                numbersOnly
                maxLength={10}
              />
            </View>
          </View>

          <CustomInputField
            label="Email Address"
            placeholder="Enter your email"
            IconComponent={<Email />}
            value={user.email}
            keyboardType="email-address"
            onChangeText={(text) => handleInputChange("email", text)}
            fieldName="email"
            error={errors.email}
          />

          {!individualScreen && (
            <CustomInputField
              label="Secondary Email"
              placeholder="Enter secondary email (Optional)"
              IconComponent={<Email />}
              value={user.secondaryEmail}
              keyboardType="email-address"
              onChangeText={(text) => handleInputChange("secondaryEmail", text)}
              fieldName="secondaryEmail"
              required={false}
              error={errors.secondaryEmail}
            />
          )}

          {/* Individual-specific fields */}
          {individualScreen ? (
            <>
              <CustomInputField
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                IconComponent={<DOB />}
                value={user.dob}
                onChangeText={(text) => handleInputChange("dob", text)}
                fieldName="dob"
                error={errors.dob}
                dateFormat={true}
                numbersOnly={true}
              />
              <CustomInputField
                label="Iqama ID"
                placeholder="Enter your KSA iqama ID /number"
                IconComponent={<Building />}
                value={user.iqamaId}
                onChangeText={(text) => handleInputChange("iqamaId", text)}
                fieldName="iqamaId"
                error={errors.iqamaId}
                numbersOnly
              />
            </>
          ) : (
            // Company-specific tax field
            <>
              <CustomInputField
                label="Tax Number"
                placeholder="Enter tax number (Optional)"
                IconComponent={<Tax />}
                value={user.taxNumber}
                onChangeText={(text) => handleInputChange("taxNumber", text)}
                fieldName="taxNumber"
                required={false}
                error={errors.taxNumber}
                numbersOnly
              />

              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>
                  Company Category <Text style={{ color: "red" }}>*</Text>
                </Text>
                <View style={styles.dropdownWrapper}>
                  <DropDownPicker
                    open={open}
                    value={user.companyCategory}
                    items={items}
                    setOpen={setOpen}
                    setValue={(callback) => {
                      const value =
                        typeof callback === "function"
                          ? callback(user.companyCategory)
                          : callback;
                      handleCategoryChange(value);
                    }}
                    setItems={setItems}
                    style={[
                      styles.dropdown,
                      errors.companyCategory ? styles.dropdownError : null,
                    ]}
                    dropDownContainerStyle={styles.dropdownList}
                    placeholderStyle={styles.dropdownPlaceholder}
                    textStyle={styles.dropdownText}
                    placeholder="Select company category"
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
                    zIndex={1000}
                    listMode="SCROLLVIEW"
                  />
                </View>
                {errors.companyCategory && (
                  <Text style={styles.errorText}>{errors.companyCategory}</Text>
                )}
              </View>
            </>
          )}

          {/* Document Upload Section */}
          {individualScreen && (
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
                Front Side of {individualScreen ? "Card" : "Document"}
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  errors.documentFront ? styles.uploadBoxError : null,
                ]}
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
                      Click to Upload Front Side of{" "}
                      {individualScreen ? "Card" : "Document"}
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
                Back Side of {individualScreen ? "Card" : "Document"}
                <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  errors.documentBack ? styles.uploadBoxError : null,
                ]}
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
                      Click to Upload Back Side of{" "}
                      {individualScreen ? "Card" : "Document"}
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

          {/* <View style={{ height: 80 }} /> */}
        </ScrollView>
        {/* Fixed Button at Bottom */}
        <Button
          title={isLoading ? "Please wait..." : "Submit"}
          onPress={handleFormSubmit}
          disabled={isLoading}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.white,
  },
  keyboardConatiner: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    textAlign: "center",
    color: Colors.secondary,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    marginBottom: 8,
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary100,
    marginBottom: 24,
    fontFamily: FONTS.medium,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primary300,
    borderRadius: 25,
    marginBottom: 24,
  },
  activeTab: {
    fontSize: 18,
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.bold,
  },
  inactiveTabText: {
    color: Colors.secondary300,
    fontSize: 16,
    fontFamily: FONTS.medium,
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
    fontFamily: FONTS.bold,
  },
  sectionLabel: {
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: FONTS.bold,
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  flexItem: {
    flex: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: FONTS.medium,
  },
  dropdownContainer: {
    marginBottom: 16,
    // zIndex: 1000,
  },
  dropdownLabel: {
    fontSize: 16,
    color: Colors.secondary,
    fontFamily: FONTS.bold,
    marginBottom: 8,
  },
  dropdownWrapper: {
    zIndex: 1000,
  },
  dropdown: {
    borderColor: Colors.primary300,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.primary300,
    paddingHorizontal: 12,
    height: 50,
  },
  dropdownError: {
    borderColor: "red",
  },
  dropdownList: {
    borderColor: Colors.secondary300,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: Colors.white,
    maxHeight: 200,
  },
  dropdownPlaceholder: {
    color: Colors.secondary300,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  dropdownText: {
    color: Colors.secondary,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
});
