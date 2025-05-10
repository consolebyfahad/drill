import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { apiCall } from "./api";

type ImageUploadResult = {
  success: boolean;
  uri?: string;
  fileName?: string;
  error?: string;
};

type UploadSource = "camera" | "gallery";

/**
 * Shows an image picker alert and handles the image selection
 * @param onImageSelected Callback for when image is selected with uri
 */
export const showImagePickerAlert = (
  field: string,
  onPickImage: (source: UploadSource, field: string) => void
) => {
  Alert.alert(
    "Choose an option",
    "How would you like to upload your image?",
    [
      {
        text: "Take Photo",
        onPress: () => onPickImage("camera", field),
      },
      {
        text: "Choose from Gallery",
        onPress: () => onPickImage("gallery", field),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );
};

/**
 * Handles picking an image from camera or gallery
 * @param source Source of the image (camera or gallery)
 * @param field Field name for which image is being picked
 * @param aspect Aspect ratio for the image [width, height]
 * @param onImageSelected Callback when image is selected with uri
 */
export const pickImage = async (
  source: UploadSource,
  field: string,
  onImageSelected: (field: string, uri: string) => void,
  onError: (message: string) => void
): Promise<void> => {
  try {
    // Request permissions
    const permissionStatus =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionStatus.status !== "granted") {
      Alert.alert("Permission Denied", "Camera or Gallery access is required.");
      return;
    }

    // Configure aspect ratio
    const aspect = field === "image" ? [1, 1] : [3, 2];

    // Launch image picker
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
            aspect,
          });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      onImageSelected(field, selectedUri);
    }
  } catch (error) {
    console.error("Image picker error:", error);
    onError("Failed to pick image. Please try again.");
  }
};

/**
 * Uploads an image to the server
 * @param uri URI of the image to upload
 * @param fieldName Field name for the image
 * @param userId User ID for the upload
 * @param onLoading Callback to handle loading state
 */
export const uploadImage = async (
  uri: string,
  fieldName: string,
  userId: string | null,
  onLoading: (isLoading: boolean) => void
): Promise<ImageUploadResult> => {
  if (!uri) return { success: false, error: "No image URI provided" };

  try {
    onLoading(true);

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

    // Call API endpoint for file upload
    const response = await apiCall(formData);

    if (response.result && response.file_name) {
      return {
        success: true,
        uri,
        fileName: response.file_name,
      };
    } else {
      return {
        success: false,
        error: response.message || "Failed to upload image",
      };
    }
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  } finally {
    onLoading(false);
  }
};
