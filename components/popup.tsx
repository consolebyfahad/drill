// Provider app
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "~/constants/Colors";
import Timeup from "@/assets/svgs/timeup.svg";
import Tipup from "@/assets/svgs/tipup.svg";
import OrderComplete from "@/assets/svgs/orderComplete.svg";
import StarIcon from "@/assets/svgs/Star.svg";
import EmptyStarIcon from "@/assets/svgs/emptyStar.svg";
import Button from "./button";
import { router } from "expo-router";
import { apiCall } from "~/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FONTS } from "~/constants/Fonts";

type PopupType = "timeup" | "tipup" | "orderComplete" | "review";

type PopupProps = {
  setShowPopup: React.Dispatch<React.SetStateAction<PopupType | null>>;
  type: PopupType;
  orderId?: string;
  tipAmount?: string;
  onComplete?: () => void;
};

export default function Popup({
  setShowPopup,
  type,
  orderId = "",
  tipAmount = "",
  onComplete,
}: PopupProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleNext = () => {
    if (type === "tipup") {
      // After tip, show review popup
      setShowPopup("review");
    } else if (type === "orderComplete") {
      // After order complete, go back to tabs
      router.replace("/(tabs)");
    } else {
      setShowPopup(null);
    }
  };

  const handleHide = () => {
    setShowPopup(null);
  };

  const handleMoveHigher = () => {
    // Logic for handling move to higher package
    router.push({
      pathname: "/order/add_extra",
      params: { orderId: orderId },
    });
    setShowPopup(null);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    } else {
      setShowPopup(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!orderId || rating === 0) {
      Alert.alert("Error", "Please select a rating");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert("Error", "User information not found");
        return;
      }

      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "reviews");
      formData.append("order_id", orderId);
      formData.append("user_id", userId);
      formData.append("rating", rating.toString());
      formData.append("review", review);
      formData.append("review_by", "provider");

      const response = await apiCall(formData);

      if (response && response.result === true) {
        // Show order complete popup after review submission
        setShowPopup("orderComplete");
      } else {
        Alert.alert("Error", "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "An error occurred while submitting the review");
    }
  };

  const ratingText = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  const renderTimeUp = () => (
    <>
      <Timeup style={styles.image} />
      <Text style={styles.title}>Time Up!</Text>
      <Text style={styles.description}>
        Your bonus time has also been completed. If any work is still pending,
        we will be moving you to a higher package.
      </Text>
    </>
  );

  const renderTipUp = () => (
    <>
      <Tipup style={styles.image} />
      <Text style={styles.title}>Buyer Tipped You!</Text>
      <Text style={styles.description}>
        Your buyer has given you a tip. You've just received a SAR ${tipAmount}{" "}
        tip
      </Text>
    </>
  );

  const renderOrderComplete = () => (
    <>
      <OrderComplete style={styles.image} />
      <Text style={styles.title}>Order Completed</Text>
      <Text style={styles.description}>
        Thanks! for sharing your experience and valuable feedback.
      </Text>
    </>
  );

  const renderReview = () => (
    <>
      <Text style={styles.title}>Rate Your Experience</Text>
      <Text style={styles.description}>How was your customer?</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            {star <= rating ? (
              <StarIcon height={24} width={24} />
            ) : (
              <EmptyStarIcon height={24} width={24} />
            )}
          </TouchableOpacity>
        ))}
      </View>
      {rating > 0 && (
        <>
          <Text style={styles.ratingText}>{ratingText[rating - 1]}</Text>
          <Text style={styles.description}>
            You gave {rating} star{rating > 1 ? "s" : ""} to the customer.
          </Text>
          <TextInput
            style={styles.textarea}
            placeholder="Write a review..."
            multiline
            value={review}
            onChangeText={setReview}
          />
        </>
      )}
    </>
  );

  const renderContent = () => {
    switch (type) {
      case "timeup":
        return renderTimeUp();
      case "tipup":
        return renderTipUp();
      case "orderComplete":
        return renderOrderComplete();
      case "review":
        return renderReview();
      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch (type) {
      case "timeup":
        return (
          <>
            <Button
              title="Complete"
              variant="secondary"
              fullWidth={false}
              width="34%"
              onPress={handleComplete}
            />
            <Button
              title="Move Higher"
              variant="primary"
              fullWidth={false}
              width="64%"
              onPress={handleMoveHigher}
            />
          </>
        );
      case "tipup":
        return (
          <Button
            title="Continue"
            variant="primary"
            fullWidth={true}
            width="100%"
            onPress={handleNext}
          />
        );
      case "orderComplete":
        return (
          <Button
            title="Go Home"
            variant="primary"
            fullWidth={true}
            width="100%"
            onPress={handleNext}
          />
        );
      case "review":
        return (
          <Button
            title="Submit"
            variant="primary"
            fullWidth={true}
            width="100%"
            onPress={handleSubmitReview}
            disabled={rating === 0}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderContent()}</View>
      <View style={styles.footerButtons}>{renderButtons()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: "100%",
    elevation: 1,
    shadowColor: Colors.gray100,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 99,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  image: {
    marginBottom: 12,
  },
  title: {
    color: Colors.secondary,
    fontSize: 22,
    fontFamily: FONTS.bold,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: Colors.secondary300,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
    fontFamily: FONTS.regular,
  },
  input: {
    width: "100%",
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
    fontFamily: FONTS.regular,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    gap: 8,
  },
  star: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  ratingText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: Colors.black,
    textAlign: "center",
    marginTop: 5,
  },
  textarea: {
    width: "100%",
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
    fontFamily: FONTS.regular,
    textAlignVertical: "top",
    height: 100,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 6,
  },
});
