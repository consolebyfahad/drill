import OfflineIcon from "@/assets/svgs/offline.svg";
import OnlineIcon from "@/assets/svgs/online.svg";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import JobRequestCard from "~/components/jobrequest_card";
import ToggleJob from "~/components/toggle_job";
import { FONTS } from "~/constants/Fonts";
import { apiCall } from "~/utils/api";
import {
  getFCMToken,
  requestFCMPermission,
  setupNotificationListeners,
} from "~/utils/notification";

// Define provider type
interface Provider {
  id: string;
  email: string;
  name: string;
  address: string;
  postal: string;
  image: string;
  phone: string;
  gender: string;
  lat: string;
  lng: string;
  country: string;
  state: string;
  city: string;
  [key: string]: any; // For other properties that might be in the response
}

// Define category type
interface Category {
  id: string;
  image: string;
  name: string;
  status: string;
  [key: string]: any;
}

// Define order type
interface OrderDetails {
  id: string;
  order_no: string;
  user_id: string;
  cat_id: string;
  to_id: string;
  address: string;
  lat: string;
  lng: string;
  date: string;
  images: string;
  description: string;
  package_id: string;
  payment_method: string;
  method_details: string;
  promo_code: string;
  status: string;
  timestamp: string;
  created_at: string;
  distance: number;
  image_url: string;
  provider: Provider;
  category: Category;
  estimatedDuration?: string;
  reach_time?: any;
}

// Define notification data type
interface NotificationData {
  order_id?: string;
  status?: string;
}

// Define location type
interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 60;

const EmployeeHome = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = SCREEN_HEIGHT * 0.12; // 12% of screen height
  const OVERLAY_MAX_HEIGHT = SCREEN_HEIGHT * 0.85; // 85% of screen height
  const CARD_MAX_HEIGHT = SCREEN_HEIGHT * 0.65; // 65% of screen height for job card
  const overlayBottom = TAB_BAR_HEIGHT + insets.bottom;
  // Refs
  const mapRef = useRef<MapView | null>(null);

  // State variables
  const [greeting, setGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOn, setIsOn] = useState(true);
  const [location, setLocation] = useState<LocationState>({
    latitude: 24.7136, // Riyadh, Saudi Arabia default
    longitude: 46.6753,
    address: t("loadingAddress") || "Loading address...",
  });
  const [jobRequests, setJobRequests] = useState<OrderDetails[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting(t("goodMorning") || "Good Morning!");
    } else if (hour >= 12 && hour < 18) {
      setGreeting(t("goodAfternoon") || "Good Afternoon!");
    } else {
      setGreeting(t("goodEvening") || "Good Evening!");
    }
  }, [t]);

  // Get order details function
  const getOrderDetails = useCallback(async (orderId: string) => {
    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("id", orderId);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orderDetails = response.data[0];

        setJobRequests((prevRequests) => {
          const exists = prevRequests.some((req) => req.id === orderDetails.id);
          if (exists) return prevRequests;
          return [...prevRequests, orderDetails];
        });

        return orderDetails;
      } else {
        console.log("No order details found");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initFCM = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      const allData = Object.fromEntries(items);
      console.log("allData", allData);
      try {
        await requestFCMPermission();
        const token = await getFCMToken();
        console.log("📲 User FCM Token:", token);
      } catch (error) {
        console.error("Error initializing FCM:", error);
      }
    };

    const handleNotificationPress = async (data: NotificationData) => {
      console.log("🚨 Notification received:", data);

      if (isOn && data?.status === "pending" && data?.order_id) {
        const orderId = data.order_id;
        await getOrderDetails(orderId);
      }
    };

    initFCM();
    const unsubscribe = setupNotificationListeners(handleNotificationPress);
    return () => unsubscribe(); // Clean up listeners
  }, [getOrderDetails, isOn]);

  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    const getLocationAsync = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) {
            setErrorMsg("Permission to access location was denied");
            setLocation((prev) => ({
              ...prev,
              address: "Permission to access location was denied",
            }));
            setIsLoading(false);
          }
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        const { latitude, longitude } = currentLocation.coords;

        // Save provider location to AsyncStorage with correct keys
        await AsyncStorage.setItem("latitude", latitude.toString());
        await AsyncStorage.setItem("longitude", longitude.toString());

        console.log("📍 Provider Initial Location:", {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          timestamp: new Date().toISOString(),
        });

        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Start continuous location tracking when online
        if (isOn) {
          console.log(
            "🔄 Starting continuous location tracking for provider..."
          );
          const subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.BestForNavigation,
              distanceInterval: 10, // Update every 10 meters
              timeInterval: 10000, // Or every 10 seconds
            },
            async (newLocation) => {
              if (isMounted) {
                const newLat = newLocation.coords.latitude.toString();
                const newLng = newLocation.coords.longitude.toString();

                // Update AsyncStorage with latest location
                await AsyncStorage.setItem("latitude", newLat);
                await AsyncStorage.setItem("longitude", newLng);

                console.log("📍 Provider Location Updated (Continuous):", {
                  latitude: newLat,
                  longitude: newLng,
                  timestamp: new Date().toISOString(),
                });

                setLocation((prev) => ({
                  ...prev,
                  latitude: newLocation.coords.latitude,
                  longitude: newLocation.coords.longitude,
                }));
              }
            }
          );

          locationSubscriptionRef.current = subscription;
        }

        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (!isMounted) return;

          if (geocode && geocode.length > 0) {
            const {
              name,
              street,
              streetNumber,
              city,
              region,
              postalCode,
              country,
            } = geocode[0];
            const formattedAddress = [
              streetNumber || "",
              street || "",
              city || "",
              region || "",
              postalCode || "",
              country || "",
            ]
              .filter(Boolean)
              .join(", ");

            setLocation((prev) => ({
              ...prev,
              address:
                formattedAddress || "Address found but details unavailable",
            }));
          } else {
            setLocation((prev) => ({
              ...prev,
              address: "Address unavailable",
            }));
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          if (isMounted) {
            setLocation((prev) => ({
              ...prev,
              address: "Could not retrieve address",
            }));
          }
        }
      } catch (error) {
        console.error("Location error:", error);
        if (isMounted) {
          setErrorMsg("Failed to get location");
          Alert.alert(
            "Location Error",
            "Could not retrieve your current location. Please check your device settings."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      getLocationAsync();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      // Clean up location subscription
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
        console.log("🛑 Stopped continuous location tracking");
      }
    };
  }, [isOn]);

  const handleAcceptJob = async (order: OrderDetails) => {
    if (!order?.id) {
      Alert.alert("Error", "Cannot accept job: order details not available");
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");

      // Get provider's current location - use correct AsyncStorage keys
      let providerLat = await AsyncStorage.getItem("latitude");
      let providerLng = await AsyncStorage.getItem("longitude");

      // If not found, try to get current location
      if (!providerLat || !providerLng) {
        console.log(
          "📍 Provider location not in AsyncStorage, getting current location..."
        );
        try {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          providerLat = currentLocation.coords.latitude.toString();
          providerLng = currentLocation.coords.longitude.toString();

          // Save to AsyncStorage for future use
          await AsyncStorage.setItem("latitude", providerLat);
          await AsyncStorage.setItem("longitude", providerLng);
          console.log("📍 Provider location saved:", {
            lat: providerLat,
            lng: providerLng,
          });
        } catch (error) {
          console.error("❌ Error getting provider location:", error);
          Alert.alert(
            "Error",
            "Could not get your location. Please enable location services."
          );
          setIsLoading(false);
          return;
        }
      }

      if (!userId) {
        Alert.alert("Error", "User information not found");
        setIsLoading(false);
        return;
      }

      if (!providerLat || !providerLng) {
        Alert.alert("Error", "Location information not found");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "order_history");
      formData.append("order_id", order.id);
      formData.append("user_id", userId);
      formData.append("lat", providerLat);
      formData.append("lng", providerLng);
      formData.append("status", "accepted");

      console.log("✅ Provider Accepting Order:", {
        order_id: order.id,
        user_id: userId,
        provider_lat: providerLat,
        provider_lng: providerLng,
        status: "accepted",
      });

      const response = await apiCall(formData);

      if (response && response.result === true) {
        await AsyncStorage.setItem("order_id", order.id);

        setJobRequests((prev) => prev.filter((req) => req.id !== order.id));

        // Navigate to orders screen
        router.push({
          pathname: "/order/order_place",
          params: { orderId: order.id },
        });
      } else {
        Alert.alert("Error", "Failed to accept job request");
      }
    } catch (error) {
      console.error("Error accepting job request:", error);
      Alert.alert("Error", "An error occurred while accepting the job request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHideJob = async (orderId: string) => {
    if (!orderId) {
      Alert.alert("Error", "Cannot decline job: order details not available");
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");
      const providerLat = await AsyncStorage.getItem("latitude");
      const providerLng = await AsyncStorage.getItem("longitude");

      if (!userId) {
        Alert.alert("Error", "User information not found");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "order_history");
      formData.append("order_id", orderId);
      formData.append("user_id", userId);
      formData.append("lat", providerLat || "");
      formData.append("lng", providerLng || "");
      formData.append("status", "reject");

      console.log("❌ Provider Declining Order:", {
        order_id: orderId,
        user_id: userId,
        provider_lat: providerLat,
        provider_lng: providerLng,
        status: "reject",
      });

      const response = await apiCall(formData);

      if (response && response.result === true) {
        setJobRequests((prev) => prev.filter((job) => job.id !== orderId));
      } else {
        Alert.alert("Error", "Failed to accept job request");
      }
    } catch (error) {
      console.error("Error accepting job request:", error);
      Alert.alert("Error", "An error occurred while accepting the job request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleToggleChange = async (value: boolean) => {
    setIsOn(value);
    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert("Error", "User information not found");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("type", "update_data");
      formData.append("table_name", "users");
      formData.append("id", userId);
      formData.append("online_status", value ? "1" : "0");

      console.log("Accepting order:", formData);

      const response = await apiCall(formData);

      if (response && response.result === true) {
      } else {
        Alert.alert("Error", "Failed to accept job request");
      }
    } catch (error) {
      console.error("Error accepting job request:", error);
      Alert.alert("Error", "An error occurred while accepting the job request");
    } finally {
      setIsLoading(false);
    }
  };
  console.log(jobRequests);
  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000080" />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            moveOnMarkerPress={false}
            onMapReady={handleMapReady}
          />
          {jobRequests.length === 0 && (
            <View style={styles.onlineIcon}>
              {isOn ? <OnlineIcon /> : <OfflineIcon />}
            </View>
          )}
        </>
      )}

      <View style={[styles.overlay, { bottom: overlayBottom }]}>
        <Text style={styles.greeting}>{greeting}</Text>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={18} color="#000" />
          <Text style={styles.address}>{location.address}</Text>
        </View>
        <View style={styles.toggleContainer}>
          <ToggleJob initialValue={isOn} onToggle={handleToggleChange} />
        </View>

        {/* Job Requests – scrollable on small screens so Accept/Decline stay above tab bar */}
        {jobRequests.length > 0 &&
          (() => {
            const item = jobRequests[0];

            const serviceImageUrl =
              item?.category?.image && item?.image_url
                ? { uri: `${item.image_url}${item.category.image}` }
                : require("@/assets/images/default-profile.png");

            return (
              <ScrollView
                style={styles.jobCardScrollView}
                contentContainerStyle={styles.jobCardScrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                <JobRequestCard
                  userName={item.provider?.name || "Client"}
                  serviceTitle={item.category?.name || "Service"}
                  packageTitle={item.package_id}
                  distance={`${item.distance || "N/A"}`}
                  duration={item?.reach_time || "N/A"}
                  jobLocation={item?.address || "Address unavailable"}
                  currentLocation={location.address}
                  onDecline={() => handleHideJob(item.id)}
                  onAccept={() => handleAcceptJob(item)}
                  serviceImage={serviceImageUrl}
                  maxHeight={CARD_MAX_HEIGHT}
                  screenWidth={SCREEN_WIDTH}
                />
              </ScrollView>
            );
          })()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000080",
    fontFamily: FONTS.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    padding: 20,
    fontFamily: FONTS.regular,
  },
  overlay: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.06,
    left: 0,
    right: 0,
    bottom: 20,
    padding: SCREEN_WIDTH * 0.04,
    justifyContent: "flex-start",
  },
  jobCardScrollView: {
    flex: 1,
    marginTop: 8,
  },
  jobCardScrollContent: {
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: "#000080",
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: 8,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  address: {
    fontSize: 14,
    marginLeft: 5,
    flex: 1,
    flexWrap: "wrap",
    fontFamily: FONTS.regular,
  },
  toggleContainer: {
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  centerButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 10,
  },
  centerButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  requestsList: {
    maxHeight: "100%",
  },
  requestsContent: {
    paddingVertical: 10,
  },
  onlineIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -110 }, { translateY: -75 }],
    zIndex: 70,
  },
});

export default EmployeeHome;
