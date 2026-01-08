import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import DashedSeprator from "./dashed_seprator";
import { Colors } from "../constants/Colors";
import { FONTS } from "~/constants/Fonts";

export type Order = {
  id: string;
  title?: string;
  orderId?: string;
  status: string;
  amount?: string;
  discount?: string;
  date?: string;
  customer?: string;
  provider?: string;
  paymentStatus?: string;
  rating?: string;
  tip?: string;
  image?: any;
  imageUrl?: string;
};

type ServiceDetailsCardProps = {
  order: Order;
  orderScreen?: boolean;
  onPress?: () => void;
};

export default function ServiceDetailsCard({
  order,
  onPress,
}: ServiceDetailsCardProps) {
  const { t } = useTranslation();
  
  // Function to get different status styles based on status
  const getStatusStyle = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return { backgroundColor: Colors.primary100, color: Colors.primary };
      case "pending":
        return { backgroundColor: "#FFF3CD", color: "#856404" };
      case "arrived":
        return { backgroundColor: "#FFF3CD", color: "#856404" };
      case "completed":
        return { backgroundColor: Colors.success100, color: Colors.success };
      case "cancelled":
        return { backgroundColor: "#F8D7DA", color: "#721C24" };
      default:
        return { backgroundColor: Colors.primary100, color: Colors.secondary };
    }
  };

  // Get the status style for the current order
  const statusStyle = getStatusStyle(order.status);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      {/* Order Top Section */}
      <View style={styles.orderTopSection}>
        <Image
          source={{ uri: `${order.image_url}${order?.category?.image}` }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.orderInfo}>
          <View style={styles.orderHeader}>
            <Text style={styles.title}>
              {order?.category?.name || t("serviceCard.serviceOrder")}
            </Text>
            <View
              style={[
                styles.statusContainer,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {order.status}
              </Text>
            </View>
          </View>
          <Text style={styles.orderId}>
            {t("serviceCard.orderID")} <Text style={styles.orderIdValue}>{order.order_no}</Text>
          </Text>
          <Text style={styles.amount}>
            {t("serviceCard.sar")} {order.amount || "0.00 "}
            {order.discount && parseInt(order.discount) > 0 && (
              <Text style={styles.discount}>({order.discount}% {t("serviceCard.off")})</Text>
            )}
          </Text>
        </View>
      </View>

      {/* Order Details Section */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <Text style={styles.label}>{t("serviceCard.dateTime")}</Text>
          <Text style={styles.value}>{order.timestamp || "N/A"}</Text>
        </View>
        <DashedSeprator />

        <View style={styles.detailsRow}>
          <Text style={styles.label}>{t("serviceCard.customer")}</Text>
          <Text style={styles.value}>
            {order?.user?.name || t("serviceCard.notAssigned")}
          </Text>
        </View>
        <DashedSeprator />
        <View style={styles.detailsRow}>
          <Text style={styles.label}>{t("serviceCard.orderStatus")}</Text>
          <Text style={[styles.value, { color: statusStyle.color }]}>
            {order.status}
          </Text>
        </View>
        <DashedSeprator />

        <View style={styles.detailsRow}>
          <Text style={styles.label}>{t("serviceCard.paymentStatus")}</Text>
          <Text style={styles.paymentStatus}>
            {order?.payment_status || t("serviceCard.pending")}
          </Text>
        </View>
        {order.status === "completed" && (
          <>
            <DashedSeprator />
            <View style={styles.detailsRow}>
              <Text style={styles.label}>{t("serviceCard.rating")}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.value}>{order.rating || "0"}</Text>
              </View>
            </View>
            <DashedSeprator />
            <View style={styles.detailsRow}>
              <Text style={styles.label}>{t("serviceCard.tipped")}</Text>
              <Text style={styles.tip}>{t("serviceCard.sar")} {order.tip || "0.00"}</Text>
            </View>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary300,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: Colors.gray100,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 2,
  },
  orderTopSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  image: {
    height: 62,
    width: 62,
    borderRadius: 8,
    backgroundColor: Colors.white,
    padding: 12,
  },
  orderInfo: {
    flex: 1,
    gap: 8,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    flex: 1,
    textTransform: "capitalize",
  },
  statusContainer: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    textTransform: "capitalize",
  },
  orderId: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  orderIdValue: {
    fontWeight: "500",
  },
  amount: {
    fontSize: 14,
    color: Colors.secondary,
    fontFamily: FONTS.semiBold,
  },
  discount: {
    color: Colors.success,
  },
  detailsContainer: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  label: {
    color: Colors.secondary300,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  value: {
    color: Colors.secondary,
    fontSize: 14,
    fontFamily: FONTS.bold,
    textTransform: "capitalize",
  },
  paymentStatus: {
    color: Colors.success,
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starIcon: {
    color: "#FFD700",
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  tip: {
    color: Colors.success,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});
