import { Image, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import DashedSeparator from "./dashed_seprator";
import { Colors } from "~/constants/Colors";
import { OrderType } from "~/types/dataTypes";

const OrderDetailsSection = ({ order }: OrderType) => {
  const { t } = useTranslation();

  // Parse final_images JSON if it exists
  let parsedFinalImages: { itemImage?: string; recipeImage?: string } = {};
  if (order.final_images) {
    try {
      parsedFinalImages =
        typeof order.final_images === "string"
          ? JSON.parse(order.final_images)
          : order.final_images;
    } catch (e) {
      // If parsing fails, treat as empty
      parsedFinalImages = {};
    }
  }

  // Extract item_image and bill_image from parsed final_images or direct properties
  const itemImage = parsedFinalImages.itemImage || order.item_image;
  const billImage = parsedFinalImages.recipeImage || order.bill_image;

  // Helper function to check if a value exists and is not empty
  const hasValue = (value: any): boolean => {
    return (
      value !== null && value !== undefined && value !== "" && value !== "0"
    );
  };
console.log("order123", order);
  return (
    <View style={styles.orderDetails}>
      {order.package?.name && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.boldText}>
              {t("orderDetailsComponent.package")}
            </Text>
            <Text style={styles.blueText}>{order.package.name}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {order.images && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.boldText}>
              {t("orderDetailsComponent.problemImage")}
            </Text>
            <Image
              source={{ uri: `${order.image_url}${order.images}` }}
              style={styles.problemImage}
            />
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.description) && (
        <>
          <Text style={[styles.boldText, { marginBottom: 4 }]}>
            {t("orderDetailsComponent.detailAboutProblem")}
          </Text>
          <Text style={styles.grayText}>{order.description}</Text>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.created_at) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.orderPlaced")}
            </Text>
            <Text style={styles.grayText}>{order.created_at}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.timestamp) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.orderAccepted")}
            </Text>
            <Text style={styles.grayText}>{order.timestamp}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.arrived_at_location) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.arrivedAtLocation")}
            </Text>
            <Text style={styles.grayText}>{order.arrived_at_location}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.arrival_confirm) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.arrivalConfirm")}
            </Text>
            <Text style={styles.grayText}>{order.arrival_confirm}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.work_started) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.workStarted")}
            </Text>
            <Text style={styles.grayText}>{order.work_started}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.extra_amount) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.extraAdded")}
            </Text>
            <Text style={styles.grayText}>{order.extra_amount}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {(hasValue(order.extra_detail) || hasValue(order.insulation_sheet)) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.insulationSheet")}
            </Text>
            <Text style={styles.grayText}>
              {order.insulation_sheet || order.extra_detail}
            </Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {itemImage && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.itemImage")}
            </Text>
            <Image
              source={{ uri: `${order.image_url}${itemImage}` }}
              style={styles.problemImage}
            />
          </View>
          <DashedSeparator />
        </>
      )}

      {billImage && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.billImage")}
            </Text>
            <Image
              source={{ uri: `${order.image_url}${billImage}` }}
              style={styles.problemImage}
            />
          </View>
          <DashedSeparator />
        </>
      )}

      {order.paid_by !== null &&
        order.paid_by !== undefined &&
        order.paid_by !== "" && (
          <>
            <View style={styles.rowBetween}>
              <Text style={styles.grayText}>
                {t("orderDetailsComponent.extraPaidBy")}
              </Text>
              <Text style={styles.grayText}>
                {order.paid_by === "0" || order.paid_by === 0
                  ? t("orderDetailsComponent.me") || "Me"
                  : order.paid_by}
              </Text>
            </View>
            <DashedSeparator />
          </>
        )}

      {hasValue(order.extra_accepted) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.extraAccepted")}
            </Text>
            <Text style={styles.grayText}>{order.extra_accepted}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.job_time_finished) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.jobTimeFinished")}
            </Text>
            <Text style={[styles.grayText, styles.greenText]}>
              {order.job_time_finished}
            </Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.bonus_time_started) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.bonusTimeStarted")}
            </Text>
            <Text style={[styles.grayText, styles.greenText]}>
              {order.bonus_time_started}
            </Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.bonus_time_ended) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.bonusTimeEnded")}
            </Text>
            <Text style={[styles.grayText, styles.greenText]}>
              {order.bonus_time_ended}
            </Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.order_completed) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.orderCompleted")}
            </Text>
            <Text style={[styles.grayText, styles.greenText]}>
              {order.order_completed}
            </Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.payment_method) && (
        <>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>
              {t("orderDetailsComponent.paymentMethod")}
            </Text>
            <Text style={styles.grayText}>{order.payment_method}</Text>
          </View>
          <DashedSeparator />
        </>
      )}

      {hasValue(order.payment_status) && (
        <View style={styles.rowBetween}>
          <Text style={styles.grayText}>
            {t("orderDetailsComponent.paymentStatus")}
          </Text>
          <Text style={styles.grayText}>{order.payment_status}</Text>
        </View>
      )}
    </View>
  );
};

export default OrderDetailsSection;

const styles = StyleSheet.create({
  orderDetails: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  boldText: {
    fontWeight: "500",
    color: Colors.secondary300,
  },
  blueText: {
    fontWeight: "bold",
    color: Colors.secondary,
  },
  grayText: {
    color: Colors.secondary,
  },
  problemImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  greenText: {
    color: Colors.success,
  },
});
