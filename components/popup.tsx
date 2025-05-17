import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "~/constants/Colors";
import Timeup from "@/assets/svgs/timeup.svg";
import Tipup from "@/assets/svgs/tipup.svg";
import OrderComplete from "@/assets/svgs/orderComplete.svg";
import StarIcon from "@/assets/svgs/Star.svg";
import EmptyStarIcon from "@/assets/svgs/emptyStar.svg";
import Button from "./button";
type PopupType = "timeup" | "tipup" | "orderComplete" | "review";

type PopupProps = {
  setShowPopup: React.Dispatch<React.SetStateAction<PopupType | null>>;
  type: PopupType;
};

export default function Popup({ setShowPopup, type }: PopupProps) {
  const [tipAmount, setTipAmount] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const handleNext = () => {
    setShowPopup(false);
  };
  const handleHide = () => {
    setShowPopup(false);
  };
  const handleSubmit = () => {
    setShowPopup(false);
  };
  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const ratingText = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {type === "timeup" ? (
          <>
            <Timeup style={styles.image} />
            <Text style={styles.title}>Time Up!</Text>
            <Text style={styles.description}>
              Your bonus time has also been completed. If any work is still
              pending, we will be moving you to a higher package.
            </Text>
          </>
        ) : type === "tipup" ? (
          <>
            <Tipup style={styles.image} />
            <Text style={styles.title}>Buyer Tipped You!</Text>
            <Text style={styles.description}>
              Your buyer has given you a tip. You’ve just received a SAR $
              {tipAmount} tip
            </Text>
          </>
        ) : type === "orderComplete" ? (
          <>
            <OrderComplete style={styles.image} />
            <Text style={styles.title}>Order Completed</Text>
            <Text style={styles.description}>
              Thanks! for sharing your experience and valuable feedback.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>Rate Your Experience</Text>
            <Text style={styles.description}>How was your service?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  {star <= rating ? (
                    <StarIcon height={24} width={24} />
                  ) : (
                    <EmptyStarIcon />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <>
              <Text style={styles.ratingText}>{ratingText[rating - 1]}</Text>
              <Text style={styles.description}>
                You gave {rating} star{rating > 1 ? "s" : ""} to Shoaib.
              </Text>
              <TextInput
                style={styles.textarea}
                placeholder="Write a review..."
                multiline
                value={review}
                onChangeText={setReview}
              />
            </>
          </>
        )}
      </View>
      <View style={styles.footerButtons}>
        {type === "timeup" ? (
          <>
            <Button
              title="Complete"
              variant="secondary"
              fullWidth={false}
              width="34%"
              onPress={handleHide}
            />
            <Button
              title="Move Higher"
              variant="primary"
              fullWidth={false}
              width="64%"
              onPress={handleNext}
            />
          </>
        ) : type === "tipup" ? (
          <>
            <Button
              title="Continue"
              variant="primary"
              fullWidth={false}
              width="100%"
              onPress={handleNext}
            />
          </>
        ) : type === "orderComplete" ? (
          <Button
            title="Continue"
            variant="primary"
            fullWidth={true}
            width="100%"
            onPress={handleNext}
          />
        ) : (
          <Button
            title="Submit"
            variant="primary"
            fullWidth={true}
            width="100%"
            onPress={() => {
              console.log("Review Submitted:", { rating, review });
              handleHide();
            }}
          />
        )}
      </View>
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
  },
  image: {
    marginBottom: 12,
  },
  title: {
    color: Colors.secondary,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    color: Colors.secondary300,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: 370,
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  star: {
    width: 30,
    height: 30,
    marginHorizontal: 5,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    marginTop: 5,
  },
  textarea: {
    width: 370,
    backgroundColor: Colors.primary300,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
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
