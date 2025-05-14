import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase } from "@react-native-firebase/messaging";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
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

// Define the order type
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
}

// Define notification data type
interface NotificationData {
  order_id?: string;
  status?: string;
}

const EmployeeHome = () => {
  const [greeting, setGreeting] = useState("Good Afternoon!");
  const [address, setAddress] = useState("Loading address...");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [isOn, setIsOn] = useState(false);
  const [jobRequest, setJobRequest] = useState<number | null>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState<MapView | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);

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

  // Get order details function
  const getOrderDetails = async (orderId: string) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("id", orderId);
    console.log(formData);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orderDetails = response.data[0];
        console.log(response);
        setOrder(orderDetails);
      } else {
        Alert.alert("Error", "No order details found");
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      Alert.alert("Error", "Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initFCM = async () => {
      const userId = await AsyncStorage.getItem("user_id");
      await requestFCMPermission();
      const token = await getFCMToken();
      console.log("📲 User FCM Token:", token);
      console.log("Firebase App Config:", firebase.app().options);
    };

    const handleNotificationPress = (data: NotificationData) => {
      console.log(
        "🚨 Notification received (foreground/background/quit):",
        data
      );
      if (data?.status === "pending" && data?.order_id) {
        setJobRequest(1);
        const orderId = data.order_id;
        getOrderDetails(orderId);
      }
    };

    initFCM();
    const unsubscribe = setupNotificationListeners(handleNotificationPress);
    return () => unsubscribe(); // Clean up listeners
  }, []);

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
            setAddress("Permission to access location was denied");
            setIsLoading(false);
          }
          return;
        }

        // Get current position with high accuracy
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Use balanced for better performance
        });

        if (!isMounted) return;

        setLocation(currentLocation);

        // Get address from coordinates
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });

          if (!isMounted) return;

          if (geocode && geocode.length > 0) {
            const { street, streetNumber, city, region, postalCode } =
              geocode[0];
            const formattedAddress = `${streetNumber || ""} ${street || ""}, ${
              city || ""
            }, ${region || ""} ${postalCode || ""}`.trim();

            setAddress(
              formattedAddress || "Address found but details unavailable"
            );
          } else {
            setAddress("Address unavailable");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          if (isMounted) {
            setAddress("Could not retrieve address");
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

  // Function to center map on user's location - using useCallback for performance
  const centerMapOnUser = useCallback(() => {
    if (location && map && mapReady) {
      try {
        map.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } catch (error) {
        console.log("Error animating map:", error);
      }
    }
  }, [location, map, mapReady]);

  const handleAcceptJob = async () => {
    if (!order?.id) {
      Alert.alert("Error", "Cannot accept job: order details not available");
      return;
    }

    setIsLoading(true);

    try {
      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem("user_id");

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
      formData.append("status", "accepted");

      console.log("Accepting order:", formData);

      const response = await apiCall(formData);

      if (response && response.result === true) {
        await AsyncStorage.setItem("order_id", JSON.stringify(order.id));
        // Hide the job request card
        setJobRequest(null);

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

  const handleHideJob = () => {
    setJobRequest(null);
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleMapRef = useCallback((ref: MapView | null) => {
    setMap(ref);
  }, []);

  // Center map when location changes and map is ready
  useEffect(() => {
    if (location && map && mapReady) {
      // Slight delay to ensure map is fully initialized
      const timer = setTimeout(() => {
        centerMapOnUser();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location, map, mapReady, centerMapOnUser]);

  // Determine service and package titles based on order
  const getServiceTitle = () => {
    if (order?.cat_id === "2") {
      return "Detection Service";
    }
    return "Service";
  };

  const getPackageTitle = () => {
    if (order?.package_id === "1") {
      return "Express Service Package";
    }
    return "Standard Package";
  };

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
      ) : location ? (
        <MapView
          ref={handleMapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={false}
          onMapReady={handleMapReady}
          onLayout={() => {}}
        >
          {mapReady && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              description="Your current location"
            />
          )}
        </MapView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load map</Text>
        </View>
      )}

      {/* Overlay with location information */}
      <View style={styles.overlay}>
        <Text style={styles.greeting}>{greeting}</Text>
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={18} color="#000" />
          <Text style={styles.address}>{address}</Text>
        </View>
        <View style={styles.toggleContainer}>
          <ToggleJob
            initialValue={false}
            onToggle={(value) => {
              setIsOn(value);
            }}
          />
        </View>
        {jobRequest && location && (
          <JobRequestCard
            userName="Daud"
            serviceTitle={getServiceTitle()}
            packageTitle={getPackageTitle()}
            distance="3.1km"
            duration="60min"
            jobLocation={order?.address || "Address unavailable"}
            currentLocation={address}
            onDecline={handleHideJob}
            onAccept={handleAcceptJob}
          />
        )}
      </View>

      {/* Center on user button */}
      {location && (
        <View style={styles.centerButtonContainer}>
          <Ionicons
            name="locate"
            size={24}
            color="#000080"
            style={styles.centerButton}
            onPress={centerMapOnUser}
          />
        </View>
      )}
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000080",
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  address: {
    fontSize: 14,
    marginLeft: 5,
    flex: 1, // Allow text to wrap
    flexWrap: "wrap",
  },
  toggleContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  centerButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
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
});

export default EmployeeHome;
