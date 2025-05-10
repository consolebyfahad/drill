import {
  View,
  Text,
  SafeAreaView,
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
import Seprator from "@/components/seprator";
import Inputfield from "@/components/inputfield";
import Profile from "@/assets/svgs/profileIcon.svg";
import Phone from "@/assets/svgs/profile/Call.svg";
import Email from "@/assets/svgs/profile/Sms.svg";
import DOB from "@/assets/svgs/profile/Calendar.svg";
import Address from "@/assets/svgs/profile/location.svg";
import City from "@/assets/svgs/profile/Global.svg";
import Zip from "@/assets/svgs/profile/zip.svg";
import Gallery from "@/assets/svgs/addImage2.svg";
import RadioButton from "~/components/radio_button";
import { apiCall } from "~/utils/api";
import Button from "~/components/button";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  name: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  zip: string;
  image: string;
  iqamaId: string;
  documentType: string;
  documents: DocumentItem[];
  documentFront: string;
  documentBack: string;
  online?: boolean;
  verified?: boolean;
};

type DocumentItem = {
  type: string;
  side: string;
  file: string;
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
    verified: false,
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [imageBaseUrl, setImageBaseUrl] = useState<string>(
    "https://7tracking.com/saudiservices/images/"
  );

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const storedUserId = await AsyncStorage.getItem("user_id");
      if (!storedUserId) throw new Error("User ID not found");

      setUserId(storedUserId);
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
          typeof profileData.documents === "string"
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

        console.log("Parsed documents:", parsedDocuments);

        let frontDoc = parsedDocuments.find((doc) => doc.side === "front");
        let backDoc = parsedDocuments.find((doc) => doc.side === "back");

        console.log("Front file:", frontDoc?.file);
        console.log("Back file:", backDoc?.file);

        setUser({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          dob: profileData.dob !== "0000-00-00" ? profileData.dob : "",
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
          verified: profileData.company_verified === "1",
        });
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
  };

  const handleUpdate = async () => {
    try {
      setError(null);
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(user.dob);

      if (user.dob && !isValidDate) {
        Alert.alert("Invalid Date", "DOB must be in YYYY-MM-DD format.");
        return;
      }

      if (!userId) throw new Error("User ID not found");

      // Prepare documents JSON
      const documentsJson = JSON.stringify(user.documents);

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("table_name", "users");
      formData.append("id", userId);
      formData.append("name", user.name);
      formData.append("email", user.email);
      formData.append("phone", user.phone);
      formData.append("dob", user.dob);
      formData.append("address", user.address);
      formData.append("city", user.city);
      formData.append("postal", user.zip);
      formData.append("iqama_id", user.iqamaId);
      formData.append("documents", documentsJson);

      // Extract filename from image URL if needed
      let imageName = user.image;
      if (imageName && imageName.includes("/")) {
        imageName = imageName.split("/").pop() || "";
      }

      if (imageName) formData.append("image", imageName);

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
                    <Ionicons name="camera" size={16} color={Colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.userName}>{user.name || "N/A"}</Text>
              <Text style={styles.userEmail}>{user.email || "N/A"}</Text>
            </View>

            <Seprator />

            {/* User Details Fields */}
            <Inputfield
              label="Full Name"
              placeholder="Enter your name"
              IconComponent={<Profile />}
              value={user.name}
              onChangeText={(text) => handleInputChange("name", text)}
            />
            <Inputfield
              label="Phone Number"
              placeholder="Enter your phone"
              IconComponent={<Phone />}
              value={user.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
            />
            <Inputfield
              label="Email Address"
              placeholder="Enter your email"
              IconComponent={<Email />}
              value={user.email}
              onChangeText={(text) => handleInputChange("email", text)}
            />
            <Inputfield
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              IconComponent={<DOB />}
              value={user.dob}
              onChangeText={(text) => handleInputChange("dob", text)}
            />
            <Inputfield
              label="Address"
              placeholder="Enter your address"
              IconComponent={<Address />}
              value={user.address}
              onChangeText={(text) => handleInputChange("address", text)}
            />
            <Inputfield
              label="Iqama ID"
              placeholder="Enter your KSA iqama ID/number"
              IconComponent={<DOB />}
              value={user.iqamaId}
              onChangeText={(text) => handleInputChange("iqamaId", text)}
            />

            <View style={styles.rowContainer}>
              <View style={styles.flexItem}>
                <Inputfield
                  label="City"
                  placeholder="Enter city"
                  IconComponent={<City />}
                  value={user.city}
                  onChangeText={(text) => handleInputChange("city", text)}
                />
              </View>
              <View style={styles.flexItem}>
                <Inputfield
                  label="Zip Code"
                  placeholder="Enter zip code"
                  IconComponent={<Zip />}
                  value={user.zip}
                  onChangeText={(text) => handleInputChange("zip", text)}
                />
              </View>
            </View>

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
                onSelect={(option) =>
                  setUser({ ...user, documentType: option })
                }
              />

              <Text style={styles.sectionLabel}>
                Front Side of Card<Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.uploadBox}
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

              <Text style={styles.sectionLabel}>
                Back Side of Card<Text style={{ color: "red" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.uploadBox}
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
            </View>

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
    paddingBottom: 80,
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
    fontWeight: "500",
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
    textAlign: "center",
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
