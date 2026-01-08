import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "~/constants/Colors";
import Add from "@/assets/svgs/plus.svg";
import Smile from "@/assets/svgs/smile.svg";
import Send from "@/assets/svgs/send.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "~/utils/api";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { FONTS } from "~/constants/Fonts";

// Define a simpler emoji picker array instead of using the library
const EMOJI_LIST = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "🤣",
  "😂",
  "🙂",
  "🙃",
  "😉",
  "😊",
  "😇",
  "🥰",
  "😍",
  "🤩",
  "😘",
  "😗",
  "😚",
  "😙",
  "😋",
  "😛",
  "😜",
  "🤪",
  "😝",
  "🤑",
  "🤗",
  "🤭",
  "🤫",
  "🤔",
  "🤐",
  "🤨",
  "😐",
  "😑",
  "😶",
  "😏",
  "😒",
  "🙄",
  "😬",
  "🤥",
  "😌",
  "😔",
  "😪",
  "🤤",
  "😴",
  "😷",
  "🤒",
  "🤕",
  "🤢",
  "🤮",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "👏",
  "🙌",
  "👐",
  "❤️",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "🖤",
  "❣️",
  "💕",
  "💞",
];

interface Message {
  id: string;
  text: string;
  sender: "user" | "provider";
  timestamp: number;
  attachment?: string;
  msgType?: string;
  userId?: any;
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const toId = "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const storedOrderId = await AsyncStorage.getItem("order_id");
        const userId = await AsyncStorage.getItem("user_id");
        setOrderId(storedOrderId);
        setUserId(userId);
        if (storedOrderId && userId) {
          fetchChatHistory(storedOrderId, userId);

          // Set up interval to fetch new messages every few seconds
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          intervalRef.current = setInterval(() => {
            if (storedOrderId && userId) {
              fetchChatHistory(storedOrderId, userId, false); // Pass false to not show loading indicator
            }
          }, 10000);
        }
      };
      init();

      // Clean up the interval when the component loses focus
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [])
  );

  const fetchChatHistory = async (
    orderIdParam: string,
    userIdParam: string,
    showLoading = true
  ) => {
    if (showLoading) {
      setIsLoading(true);
    }

    const formData = new FormData();
    formData.append("type", "getchat");
    formData.append("user_id", userIdParam);
    formData.append("order_id", orderIdParam);
    formData.append("to_id", toId);

    try {
      const response = await apiCall(formData);
      if (response && response.chat) {
        const fromId = response.user.id;
        const formattedMessages = response.chat.map((msg: any) => ({
          id: msg.id,
          text: msg.msg,
          sender: msg.from_id === fromId ? "user" : "provider",
          timestamp: Number(msg.datetime),
          msgType: msg.msg_type === "file" ? "file" : "msg",
        }));

        setMessages(formattedMessages.reverse());
      } else {
        // Handle case where chat is undefined
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch chat history", error);
      setMessages([]);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const uploadImageToServer = async (imageUri: string) => {
    try {
      if (!userId) throw new Error("User ID not found");

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
        setUploadedFileName(response.file_name);
        return response.file_name;
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (err: any) {
      Alert.alert(
        t("error"),
        err.message || t("order.somethingWentWrongUpload")
      );
      return null;
    }
  };

  const sendMessage = async () => {
    if (!orderId || (inputMessage.trim() === "" && !attachment)) return;

    try {
      setIsLoading(true);

      // If there's an attachment but no uploaded filename yet, upload it first
      let filename = uploadedFileName;
      if (attachment && !uploadedFileName) {
        filename = await uploadImageToServer(attachment);
        if (!filename) {
          setIsLoading(false);
          return; // Exit if upload failed
        }
      }

      const formData = new FormData();
      formData.append("type", "sendmsg");
      formData.append("user_id", userId);
      formData.append("to_id", toId);
      formData.append("order_id", orderId);

      // Determine message type and content based on attachment
      const msgType = attachment ? "file" : "msg";
      formData.append("msg_type", msgType);

      // If it's a file, send the filename, otherwise send the input message
      if (attachment && filename) {
        formData.append("msg", filename);
      } else {
        formData.append("msg", inputMessage);
      }

      const response = await apiCall(formData);
      if (response && response.result) {
        // Clear form after successful send
        setInputMessage("");
        setAttachment(null);
        setUploadedFileName(null);

        // Refresh chat history
        if (orderId && userId) {
          await fetchChatHistory(orderId, userId);
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
      Alert.alert(t("error"), t("order.failedToSendMsg"));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteMessage = (messageId: string) => {
    if (!userId) return;

    Alert.alert(t("order.deleteMessage"), t("order.deleteConfirm"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("logout"),
        style: "destructive",
        onPress: () => deleteMessage(messageId, userId),
      },
    ]);
  };

  const deleteMessage = async (messageId: string, userIdParam: string) => {
    try {
      const formData = new FormData();
      formData.append("type", "delete_chat");
      formData.append("user_id", userIdParam);
      formData.append("id", messageId);

      const response = await apiCall(formData);
      if (response && response.result) {
        setMessages(messages.filter((msg) => msg.id !== messageId));
      }
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  const pickImage = async (source: "camera" | "gallery") => {
    let result;

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("order.permissionNeeded"), t("order.cameraPermission"));
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("order.permissionNeeded"), t("order.galleryPermission"));
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setAttachment(selectedUri);
      setIsMediaPickerVisible(false);

      // Upload image right after selection
      setIsLoading(true);
      try {
        const filename = await uploadImageToServer(selectedUri);
        if (filename) {
          setUploadedFileName(filename);
        }
      } catch (error) {
        console.error("Failed to upload image", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openMediaPicker = () => {
    setIsMediaPickerVisible(true);
  };

  const onEmojiSelected = (emoji: string) => {
    setInputMessage((prevInput) => prevInput + emoji);
    setIsEmojiPickerVisible(false);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);
  console.log(messages);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 18}
    >
      <View style={styles.chatContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
          contentContainerStyle={styles.scrollViewContent}
        >
          {messages && messages.length > 0
            ? messages.map((message) => (
                <TouchableOpacity
                  onLongPress={() => confirmDeleteMessage(message.id)}
                  key={message.id}
                  style={
                    message.sender === "user"
                      ? styles.userMessage
                      : styles.providerMessage
                  }
                >
                  {message.msgType === "file" && (
                    <Image
                      source={{ uri: message.text }}
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  )}

                  {message.msgType === "msg" && (
                    <Text style={styles.messageText}>{message.text}</Text>
                  )}
                </TouchableOpacity>
              ))
            : !isLoading && (
                <View style={styles.noMessagesContainer}>
                  <Text style={styles.noMessagesText}>
                    {t("order.noMessagesYet")}
                  </Text>
                </View>
              )}
        </ScrollView>

        {/* Chat input stays visible */}
        <View>
          <View style={styles.chatInputContainer}>
            <TouchableOpacity onPress={openMediaPicker}>
              <Add />
            </TouchableOpacity>
            <View style={styles.inputFieldContainer}>
              <TextInput
                style={styles.chatInput}
                value={inputMessage}
                onChangeText={(text) => setInputMessage(text)}
                placeholder={
                  attachment ? t("order.sendWithImage") : t("order.typeMessage")
                }
                multiline
              />
              {attachment && (
                <View style={styles.inlineAttachmentContainer}>
                  <Image
                    source={{ uri: attachment }}
                    style={styles.inlineAttachment}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeInlineAttachment}
                    onPress={() => {
                      setAttachment(null);
                      setUploadedFileName(null);
                    }}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              <TouchableOpacity onPress={() => setIsEmojiPickerVisible(true)}>
                <Smile />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={sendMessage}
              disabled={inputMessage.trim() === "" && !attachment}
              style={[
                styles.sendButton,
                inputMessage.trim() === "" && !attachment
                  ? styles.disabledSendButton
                  : {},
              ]}
            >
              <Send />
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Emoji Picker Modal */}
        <Modal
          visible={isEmojiPickerVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.emojiPickerHeader}>
              <Text style={styles.emojiPickerTitle}>
                {t("order.selectEmoji")}
              </Text>
              <TouchableOpacity onPress={() => setIsEmojiPickerVisible(false)}>
                <Text style={styles.closeButton}>{t("order.close")}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.emojiScrollView}>
              <View style={styles.emojiGrid}>
                {EMOJI_LIST.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.emojiButton}
                    onPress={() => onEmojiSelected(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Media Picker Modal */}
        <Modal
          visible={isMediaPickerVisible}
          transparent={true}
          animationType="slide"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setIsMediaPickerVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.mediaPickerContainer}>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={() => pickImage("camera")}
              >
                <Text style={styles.mediaOptionText}>
                  {t("order.takePhoto")}
                </Text>
              </TouchableOpacity>
              <View style={styles.mediaDivider} />
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={() => pickImage("gallery")}
              >
                <Text style={styles.mediaOptionText}>
                  {t("order.chooseFromGallery")}
                </Text>
              </TouchableOpacity>
              <View style={styles.mediaDivider} />
              <TouchableOpacity
                style={[styles.mediaOption, styles.cancelButton]}
                onPress={() => setIsMediaPickerVisible(false)}
              >
                <Text style={styles.cancelText}>{t("cancel")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flexGrow: 1,
    paddingBottom: 10, // Add some padding at bottom
  },
  inputWrapper: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  chatInputContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.success100,
    padding: 12,
    borderBottomEndRadius: 14,
    borderStartStartRadius: 14,
    borderBottomStartRadius: 14,
    marginBottom: 16,
    maxWidth: "80%",
  },
  providerMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.gray100,
    padding: 12,
    borderBottomEndRadius: 14,
    borderStartEndRadius: 14,
    borderBottomStartRadius: 14,
    marginBottom: 16,
    maxWidth: "80%",
  },
  messageText: {
    color: Colors.secondary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  inputFieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gray,
    minHeight: 44,
  },
  chatInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
  disabledSendButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: "50%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  emojiPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  emojiPickerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary,
  },
  closeButton: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  emojiScrollView: {
    flex: 1,
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 10,
  },
  emojiButton: {
    width: "20%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  emojiText: {
    fontSize: 24,
    fontFamily: FONTS.regular,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  mediaPickerContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 8,
  },
  mediaOption: {
    padding: 16,
    alignItems: "center",
  },
  mediaOptionText: {
    fontSize: 18,
    color: Colors.primary,
    fontFamily: FONTS.regular,
  },
  mediaDivider: {
    height: 1,
    backgroundColor: Colors.gray100,
  },
  cancelButton: {
    marginTop: 8,
  },
  cancelText: {
    fontSize: 18,
    color: "red",
    fontFamily: FONTS.semiBold,
  },
  inlineAttachmentContainer: {
    position: "relative",
    marginRight: 8,
  },
  inlineAttachment: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  removeInlineAttachment: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  noMessagesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noMessagesText: {
    color: Colors.gray,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
