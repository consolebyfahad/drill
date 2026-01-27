import Add from "@/assets/svgs/plus.svg";
import Send from "@/assets/svgs/send.svg";
import Smile from "@/assets/svgs/smile.svg";
import Extra from "@/assets/svgs/extra.svg";
import Camera from "@/assets/svgs/cam.svg";
import Document from "@/assets/svgs/file.svg";
import Images from "@/assets/svgs/image.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";
import { apiCall } from "~/utils/api";

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
  sender: "user" | "provider" | "support_agent" | "system";
  timestamp: number;
  attachment?: string;
  msgType?: string;
  userId?: any;
  senderName?: string;
  senderImage?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MEDIA_PICKER_BREAKPOINT = 400;
const MEDIA_CONTAINER_MARGIN = 20;
const MEDIA_OPTION_GAP = 12;

export default function ChatScreen() {
  const { t } = useTranslation();
  const toId = "";
  const isNarrow = SCREEN_WIDTH < MEDIA_PICKER_BREAKPOINT;
  const mediaContainerWidth = SCREEN_WIDTH - MEDIA_CONTAINER_MARGIN * 2;
  const mediaColumns = isNarrow ? 2 : 4;
  const containerPadding = 20;
  const mediaOptionSize =
    (mediaContainerWidth - containerPadding * 2 - (mediaColumns - 1) * MEDIA_OPTION_GAP) /
    mediaColumns;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const [isMediaPickerVisible, setIsMediaPickerVisible] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [providerInfo, setProviderInfo] = useState<any>(null);
  const [supportRequired, setSupportRequired] = useState<boolean>(false);
  const [hasShownSupportMessage, setHasShownSupportMessage] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const isSendingRef = useRef<boolean>(false);
  const IMAGE_BASE_URL = "https://7tracking.com/saudiservices/images/";

  useFocusEffect(
    useCallback(() => {
      const init = async () => {
        const storedOrderId = await AsyncStorage.getItem("order_id");
        const userId = await AsyncStorage.getItem("user_id");
        setOrderId(storedOrderId);
        setUserId(userId);
        if (storedOrderId && userId) {
          fetchOrderDetails(storedOrderId);
          fetchChatHistory(storedOrderId, userId);

          // Set up interval to fetch new messages every few seconds
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          intervalRef.current = setInterval(() => {
            if (storedOrderId && userId) {
              fetchOrderDetails(storedOrderId);
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

  const fetchOrderDetails = async (orderIdParam: string) => {
    try {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "orders");
      formData.append("id", orderIdParam);

      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orderData = response.data[0];
        const isSupportRequired = orderData.support_required === "1" || orderData.support_required === 1;
        
        // If support was just requested (changed from false to true), show the message
        if (isSupportRequired && !supportRequired) {
          setHasShownSupportMessage(true);
        }
        
        setSupportRequired(isSupportRequired);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
    }
  };

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
      console.log(response);
      if (response && response.chat) {
        const fromId = response.user.id;
        
        // Store user and provider info
        if (response.user) {
          setUserInfo(response.user);
        }
        if (response.provider) {
          setProviderInfo(response.provider);
        }
        
        const formattedMessages = response.chat.map((msg: any) => {
          const isUser = msg.from_id === fromId;
          // Check if message is from support agent (usually identified by user_type or role)
          const isSupportAgent = msg.user_type === "support_agent" || 
                                 msg.role === "support_agent" ||
                                 msg.from_id !== fromId && msg.from_id !== response.provider?.id;
          
          let sender: "user" | "provider" | "support_agent" = "provider";
          let senderInfo = response.provider;
          
          if (isUser) {
            sender = "user";
            senderInfo = response.user;
          } else if (isSupportAgent || msg.sender_name?.toLowerCase().includes("support")) {
            sender = "support_agent";
            senderInfo = { name: "Support Agent", image: null };
          }
          
          return {
            id: msg.id,
            text: msg.msg,
            sender: sender,
            timestamp: Number(msg.datetime),
            msgType: msg.msg_type === "file" ? "file" : "msg",
            senderName: senderInfo?.name || (isUser ? "You" : sender === "support_agent" ? "Support Agent" : "Provider"),
            senderImage: senderInfo?.image || null,
          };
        });

        // Add support agent added system message if support is required
        let finalMessages = formattedMessages.reverse();
        if (supportRequired && hasShownSupportMessage) {
          const supportMessageExists = finalMessages.some(
            (msg: Message) => msg.sender === "system" && msg.text.includes("Support Agent Added")
          );
          
          if (!supportMessageExists) {
            // Find the position to insert the system message (after user messages requesting support)
            const insertIndex = finalMessages.findIndex(
              (msg: Message) => msg.sender === "user" && msg.timestamp > 0
            );
            
            const systemMessage = {
              id: `support-added-${Date.now()}`,
              text: "Support Agent Added",
              sender: "system" as const,
              timestamp: Date.now(),
              msgType: "msg" as const,
              senderName: "",
              senderImage: null,
            };
            
            if (insertIndex >= 0) {
              finalMessages.splice(insertIndex + 1, 0, systemMessage);
            } else {
              finalMessages = [systemMessage, ...finalMessages];
            }
          }
        }

        setMessages(finalMessages);
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
        throw new Error(response.message || t("order.errorWithUpload"));
      }
    } catch (err: any) {
      Alert.alert(t("error"), err.message || t("order.errorWithUpload"));
      return null;
    }
  };

  const sendMessage = async () => {
    // Prevent multiple simultaneous sends
    if (isSendingRef.current) {
      console.log("Message already being sent, ignoring duplicate send");
      return;
    }

    if (!orderId || !userId || (inputMessage.trim() === "" && !attachment)) return;

    try {
      isSendingRef.current = true;
      setIsLoading(true);

      // If there's an attachment but no uploaded filename yet, upload it first
      let filename = uploadedFileName;
      if (attachment && !uploadedFileName) {
        filename = await uploadImageToServer(attachment);
        if (!filename) {
          isSendingRef.current = false;
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
      Alert.alert(t("error"), t("order.failedToSend"));
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const confirmDeleteMessage = (messageId: string) => {
    if (!userId) return;

    Alert.alert(
      t("order.deleteMessage"),
      t("order.deleteConfirm"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("order.deleteMessage"),
          style: "destructive",
          onPress: () => deleteMessage(messageId, userId),
        },
      ]
    );
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

  const pickImage = async (source: "camera" | "gallery" | "document") => {
    let result;

    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("order.permissionNeeded"),
          t("order.cameraPermission")
        );
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
        Alert.alert(
          t("order.permissionNeeded"),
          t("order.galleryPermission")
        );
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
          keyboardShouldPersistTaps="handled"
        >
          {messages && messages.length > 0
            ? messages.map((message, index) => {
                // Handle system messages (Support Agent Added)
                if (message.sender === "system") {
                  return (
                    <View key={message.id} style={styles.systemMessageContainer}>
                      <View style={styles.systemMessageLine} />
                      <Text style={styles.systemMessageText}>{message.text}</Text>
                      <View style={styles.systemMessageLine} />
                    </View>
                  );
                }

                const showProfile = index === 0 || 
                  messages[index - 1].sender !== message.sender;
                
                return (
                  <View
                    key={message.id}
                    style={
                      message.sender === "user"
                        ? styles.userMessageContainer
                        : message.sender === "support_agent"
                        ? styles.supportAgentMessageContainer
                        : styles.providerMessageContainer
                    }
                  >
                    {(message.sender === "provider" || message.sender === "support_agent") && (
                      <View style={styles.providerInfoContainer}>
                        {showProfile && (
                          <>
                            {message.sender === "support_agent" ? (
                              <View style={styles.supportAgentIcon}>
                                <Text style={styles.supportAgentIconText}>🎧</Text>
                              </View>
                            ) : (
                              <Image
                                source={
                                  message.senderImage
                                    ? { uri: `${IMAGE_BASE_URL}${message.senderImage}` }
                                    : require("@/assets/images/default-profile.png")
                                }
                                style={styles.profileImage}
                                resizeMode="cover"
                              />
                            )}
                            <Text style={styles.senderName}>
                              {message.senderName}
                            </Text>
                          </>
                        )}
                        {!showProfile && (
                          <View style={styles.profileImagePlaceholder} />
                        )}
                      </View>
                    )}
                    <TouchableOpacity
                      onLongPress={() => confirmDeleteMessage(message.id)}
                      style={
                        message.sender === "user"
                          ? styles.userMessage
                          : message.sender === "support_agent"
                          ? styles.supportAgentMessage
                          : styles.providerMessage
                      }
                    >
                      {message.msgType === "file" && (
                        <Image
                          source={{ uri: `${IMAGE_BASE_URL}${message.text}` }}
                          style={styles.messageImage}
                          resizeMode="cover"
                        />
                      )}

                      {message.msgType === "msg" && (
                        <Text style={styles.messageText}>{message.text}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
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
              disabled={(inputMessage.trim() === "" && !attachment) || isLoading || isSendingRef.current}
              style={[
                styles.sendButton,
                (inputMessage.trim() === "" && !attachment) || isLoading || isSendingRef.current
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
              <Text style={styles.emojiPickerTitle}>{t("order.selectEmoji")}</Text>
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

        {/* Media Picker Modal – responsive: 2x2 on small screens, 4 in a row on large */}
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
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[styles.mediaPickerContainer, { width: mediaContainerWidth }]}
            >
              {/* Extra Option */}
              <TouchableOpacity
                style={[styles.mediaOption, { width: mediaOptionSize }]}
                onPress={() => {
                  setIsMediaPickerVisible(false);
                  if (!orderId) {
                    Alert.alert(t("error"), "Order ID is missing");
                    return;
                  }
                  router.push({
                    pathname: "/order/add_extra",
                    params: { orderId: String(orderId) },
                  });
                }}
              >
                <View style={styles.mediaOptionContent}>
                  <Extra />
                  <Text style={styles.mediaOptionText}>Extra</Text>
                </View>
              </TouchableOpacity>

              {/* Camera Option */}
              <TouchableOpacity
                style={[styles.mediaOption, { width: mediaOptionSize }]}
                onPress={() => pickImage("camera")}
              >
                <View style={styles.mediaOptionContent}>
                  <Camera />
                  <Text style={styles.mediaOptionText}>Camera</Text>
                </View>
              </TouchableOpacity>

              {/* Document Option */}
              <TouchableOpacity
                style={[styles.mediaOption, { width: mediaOptionSize }]}
                onPress={() => pickImage("document")}
              >
                <View style={styles.mediaOptionContent}>
                  <Document />
                  <Text style={styles.mediaOptionText}>Document</Text>
                </View>
              </TouchableOpacity>

              {/* Image Option */}
              <TouchableOpacity
                style={[styles.mediaOption, { width: mediaOptionSize }]}
                onPress={() => pickImage("gallery")}
              >
                <View style={styles.mediaOptionContent}>
                  <Images />
                  <Text style={styles.mediaOptionText}>Image</Text>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
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
    paddingBottom: 10,
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
    marginBottom: 12,
    maxWidth: "80%",
  },
  providerMessageContainer: {
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "flex-start",
    marginBottom: 12,
    maxWidth: "80%",
  },
  supportAgentMessageContainer: {
    flexDirection: "column",
    alignSelf: "flex-start",
    alignItems: "flex-start",
    marginBottom: 12,
    maxWidth: "80%",
  },
  systemMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
    width: "100%",
  },
  systemMessageLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray,
    marginHorizontal: 8,
  },
  systemMessageText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: Colors.secondary300,
  },
  supportAgentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary300,
    justifyContent: "center",
    alignItems: "center",
  },
  supportAgentIconText: {
    fontSize: 20,
  },
  supportAgentMessage: {
    backgroundColor: Colors.gray100,
    padding: 12,
    borderRadius: 14,
    borderBottomStartRadius: 4,
    maxWidth: "100%",
  },
  providerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
    width: "100%",
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
  },
  profileImagePlaceholder: {
    width: 36,
    height: 36,
  },
  senderName: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: Colors.secondary,
  },
  userMessage: {
    backgroundColor: Colors.success100,
    padding: 12,
    borderRadius: 14,
    borderBottomEndRadius: 4,
    maxWidth: "100%",
  },
  providerMessage: {
    backgroundColor: Colors.gray100,
    padding: 12,
    borderRadius: 14,
    borderBottomStartRadius: 4,
    maxWidth: "100%",
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
  chatInputContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: Colors.primary200,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 100,
    gap: 12,
  },
  mediaOption: {
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  mediaOptionContent: {
    alignItems: "center",
    gap: 8,
  },
  mediaOptionText: {
    fontSize: 14,
    color: Colors.secondary,
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
