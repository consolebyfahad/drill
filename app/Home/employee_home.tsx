import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase } from "@react-native-firebase/messaging";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import JobRequestCard from "~/components/jobrequest_card";
import ToggleJob from "~/components/toggle_job";
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

const EmployeeHome = () => {
  // Refs
  const mapRef = useRef<MapView | null>(null);

  // State variables
  const [greeting, setGreeting] = useState("Good Afternoon!");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    latitude: 37.7749,
    longitude: -122.4194,
    address: "Loading address...",
  });
  const [jobRequests, setJobRequests] = useState<OrderDetails[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning!");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Good Afternoon!");
    } else {
      setGreeting("Good Evening!");
    }
  }, []);

  // Calculate distance between two coordinates
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km
      return parseFloat(distance.toFixed(1));
    },
    []
  );

  // Calculate estimated duration based on distance
  const calculateDuration = useCallback((distanceKm: number): string => {
    if (!distanceKm) return "N/A";

    // Assuming average speed of 30 km/h in city traffic
    const avgSpeedKmH = 30;
    const timeHours = distanceKm / avgSpeedKmH;
    const timeMinutes = timeHours * 60;

    if (timeMinutes < 1) {
      return "1min"; // Minimum time
    } else if (timeMinutes < 60) {
      return `${Math.ceil(timeMinutes)}min`;
    } else {
      const hours = Math.floor(timeHours);
      const minutes = Math.ceil((timeHours - hours) * 60);
      return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
    }
  }, []);

  // Get order details function
  const getOrderDetails = useCallback(
    async (orderId: string) => {
      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "orders");
      formData.append("id", orderId);

      try {
        const response = await apiCall(formData);
        if (response && response.data && response.data.length > 0) {
          const orderDetails = response.data[0];

          // Get current user location from AsyncStorage
          const userLat = await AsyncStorage.getItem("user_lat");
          const userLng = await AsyncStorage.getItem("user_lng");

          // Check if provider has coordinates
          const providerLat = orderDetails?.provider?.lat;
          const providerLng = orderDetails?.provider?.lng;

          // Calculate distance if coordinates are available
          let distance = 0;
          if (userLat && userLng && providerLat && providerLng) {
            distance = calculateDistance(
              parseFloat(userLat),
              parseFloat(userLng),
              parseFloat(providerLat),
              parseFloat(providerLng)
            );
            orderDetails.distance = distance;
          }

          // Calculate estimated duration
          orderDetails.estimatedDuration = calculateDuration(distance);

          // Add to job requests instead of replacing
          setJobRequests((prevRequests) => {
            // Check if this order is already in the list
            const exists = prevRequests.some(
              (req) => req.id === orderDetails.id
            );
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
    },
    [calculateDistance, calculateDuration]
  );

  // Initialize FCM
  useEffect(() => {
    const initFCM = async () => {
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

      // Only process notifications if the toggle is on
      if (isOn && data?.status === "pending" && data?.order_id) {
        const orderId = data.order_id;
        await getOrderDetails(orderId);
      }
    };

    initFCM();
    const unsubscribe = setupNotificationListeners(handleNotificationPress);
    return () => unsubscribe(); // Clean up listeners
  }, [getOrderDetails, isOn]);

  // Get current location and address
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

        // Get current position with high accuracy
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        const { latitude, longitude } = currentLocation.coords;

        // Save location to AsyncStorage
        await AsyncStorage.setItem("user_lat", latitude.toString());
        await AsyncStorage.setItem("user_lng", longitude.toString());

        setLocation((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        // Get address from coordinates
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

    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      getLocationAsync();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Center map on user's location
  const centerMapOnUser = useCallback(() => {
    if (mapRef.current && mapReady && location.latitude && location.longitude) {
      try {
        mapRef.current.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } catch (error) {
        console.log("Error animating map:", error);
      }
    }
  }, [location, mapReady]);

  // Handle job acceptance
  const handleAcceptJob = async (order: OrderDetails) => {
    if (!order?.id) {
      Alert.alert("Error", "Cannot accept job: order details not available");
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");
      const userLat = await AsyncStorage.getItem("user_lat");
      const userLng = await AsyncStorage.getItem("user_lng");

      if (!userId) {
        Alert.alert("Error", "User information not found");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("type", "add_data");
      formData.append("table_name", "order_history");
      formData.append("order_id", order.id);
      formData.append("user_id", userId);
      formData.append("lat", userLat || "");
      formData.append("lng", userLng || "");
      formData.append("status", "accepted");

      console.log("Accepting order:", formData);

      const response = await apiCall(formData);

      if (response && response.result === true) {
        await AsyncStorage.setItem("order_id", order.id);

        // Remove this job from the list
        setJobRequests((prev) => prev.filter((req) => req.id !== order.id));

        // Navigate to orders screen
        router.push("/order/order_place");
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

  // Hide/decline a specific job
  const handleHideJob = (orderId: string) => {
    setJobRequests((prev) => prev.filter((job) => job.id !== orderId));
  };

  // Handle map events
  const handleMapReady = () => {
    setMapReady(true);
  };

  // Handle toggle change
  const handleToggleChange = (value: boolean) => {
    setIsOn(value);

    // Clear job requests when turning off
    if (!value) {
      setJobRequests([]);
    }
  };

  // Center map on user when map is ready
  useEffect(() => {
    if (mapReady && location.latitude && location.longitude) {
      const timer = setTimeout(() => {
        centerMapOnUser();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location, mapReady, centerMapOnUser]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={false}
          onMapReady={handleMapReady}
        >
          {mapReady && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="You are here"
              description="Your current location"
            />
          )}
        </MapView>
      )}

      {/* Overlay with location information */}
      <View style={styles.overlay}>
        <Text style={styles.greeting}>{greeting}</Text>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={18} color="#000" />
          <Text style={styles.address}>{location.address}</Text>
        </View>
        <View style={styles.toggleContainer}>
          <ToggleJob initialValue={isOn} onToggle={handleToggleChange} />
        </View>

        {/* Job Requests List */}
        {jobRequests.length > 0 && (
          <FlatList
            data={jobRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // Get image URL for the service
              const serviceImageUrl =
                item?.category?.image && item?.image_url
                  ? { uri: `${item.image_url}${item.category.image}` }
                  : require("@/assets/images/default-profile.png");

              return (
                <JobRequestCard
                  userName={item.provider?.name || "Client"}
                  serviceTitle={item.category?.name || "Service"}
                  packageTitle={item.package_id}
                  distance={`${item.distance || "N/A"}km`}
                  duration={item.estimatedDuration || "N/A"}
                  jobLocation={item.provider?.address || "Address unavailable"}
                  currentLocation={location.address}
                  onDecline={() => handleHideJob(item.id)}
                  onAccept={() => handleAcceptJob(item)}
                  serviceImage={serviceImageUrl}
                />
              );
            }}
            style={styles.requestsList}
            contentContainerStyle={styles.requestsContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Center on user button */}
      <TouchableOpacity
        style={styles.centerButtonContainer}
        onPress={centerMapOnUser}
      >
        <Ionicons
          name="locate"
          size={24}
          color="#000080"
          style={styles.centerButton}
        />
      </TouchableOpacity>
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
  },
  overlay: {
    position: "absolute",
    top: 20,
    left: 0,
    right: 0,
    padding: 15,
    maxHeight: "100%",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  address: {
    fontSize: 14,
    marginLeft: 5,
    flex: 1,
    flexWrap: "wrap",
  },
  toggleContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
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
});

export default EmployeeHome;
