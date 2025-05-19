import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocalSearchParams, router } from "expo-router";
import Header from "~/components/header";
import ProviderCard from "~/components/provider_card";
import { Colors } from "~/constants/Colors";
import Accepted from "@/assets/svgs/Button.svg";
import OTW from "@/assets/svgs/RecordButton.svg";
import Arrived from "@/assets/svgs/TrackButton.svg";
import Profile from "@/assets/svgs/profile-circle.svg";
import Button from "~/components/button";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { OrderType } from "~/types/dataTypes";
import { apiCall } from "~/utils/api";
import ArrivedLocation from "@/assets/svgs/arrived.svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
type LocationStateType = {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
  lat1: any;
  lon1: any;
  lat2: any;
  lon2: any;
  remove: any;
};

export default function Track() {
  const [status, setStatus] = useState<string>("OnTheWay");
  const slideAnim = useRef(new Animated.Value(800)).current;
  const [location, setLocation] = useState<LocationStateType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOrderLoaded, setIsOrderLoaded] = useState<boolean>(false);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const mapRef = useRef<MapView | null>(null);
  const [order, setOrder] = useState<OrderType | null>(null);
  const params = useLocalSearchParams();
  const orderId = useMemo(
    () => params.orderId?.toString() || "",
    [params.orderId]
  );
  const locationSubscriptionRef = useRef(null);

  const getOrderDetails = useCallback(async () => {
    if (isOrderLoaded || !orderId) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append("type", "get_data");
    formData.append("table_name", "orders");
    formData.append("id", orderId);

    try {
      const response = await apiCall(formData);
      if (response && response.data && response.data.length > 0) {
        const orderData = response.data[0];
        setOrder(orderData);
      } else {
        console.log("No order details found");
        setOrder(null);
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      setOrder(null);
    } finally {
      setIsLoading(false);
      setIsOrderLoaded(true); // Mark as loaded to prevent refetching
    }
  }, [orderId, isOrderLoaded]);

  // Get the customer location from the order
  const customerLocation = useMemo(() => {
    if (order?.user?.lat && order?.user?.lng) {
      return {
        latitude: parseFloat(order.user.lat),
        longitude: parseFloat(order.user.lng),
      };
    }
    return { latitude: 25.276987, longitude: 55.296249 };
  }, [order]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // distance in meters

    return distance;
  };

  useEffect(() => {
    if (location && customerLocation) {
      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;
      const customerLat = customerLocation.latitude;
      const customerLng = customerLocation.longitude;
      console.log(customerLat, customerLng);
      const distance = calculateDistance(
        currentLat,
        currentLng,
        customerLat,
        customerLng
      );

      console.log("Distance to customer:", distance, "meters");

      if (distance < 50) {
        setStatus("Arrived");
      }
    }
  }, [location, customerLocation]);

  useEffect(() => {
    if (orderId && !isOrderLoaded) {
      getOrderDetails();
    }
  }, [orderId, getOrderDetails, isOrderLoaded]);

  useEffect(() => {
    // Animate bottom sheet
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Get current location and subscribe to updates
    let isMounted = true;

    const setupLocationTracking = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) {
            setErrorMsg("Permission to access location was denied");
            setIsLoading(false);
          }
          return;
        }

        // Get initial location
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (isMounted) {
          setLocation(currentLocation);
        }

        // Subscribe to location updates - properly store the subscription
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5, // Update every 5 meters
            timeInterval: 5000, // Or every 5 seconds
          },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation);
            }
          }
        );

        // Store the subscription reference
        locationSubscriptionRef.current = subscription;
      } catch (error) {
        console.error("Error getting location:", error);
        if (isMounted) {
          setErrorMsg("Failed to get your location");
          setIsLoading(false);
        }
      }
    };

    setupLocationTracking();

    return () => {
      isMounted = false;
      // Use the ref for cleanup instead of the variable
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (location && customerLocation) {
      const startPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Create a simple straight-line route
      setRouteCoordinates([startPoint, customerLocation]);

      // Fit map to show both points
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([startPoint, customerLocation], {
            edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
            animated: true,
          });
        }
      }, 1000);

      // Set loading to false since we have both locations
      setIsLoading(false);
    }
  }, [location, customerLocation]);

  const handleAlert = useCallback(() => {
    // Implement alert functionality
    console.log("Alert sent to customer");
    Alert.alert("Success", "Alert sent to customer");
  }, []);

  if (isLoading && !errorMsg && !order) {
    return (
      <View style={styles.fullScreenLoading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  const handleArrived = async () => {
    if (!order?.id) {
      Alert.alert("Error", "Cannot accept job: order details not available");
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");

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
      formData.append("status", "arrived");

      const response = await apiCall(formData);

      if (response && response.result === true) {
        router.push({
          pathname: "/order/order_place",
          params: { orderId: orderId },
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

  const handleOnway = async () => {
    if (!order?.id) {
      Alert.alert("Error", "Cannot accept job: order details not available");
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");

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
      formData.append("status", "on-way");

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

  return (
    <SafeAreaProvider style={styles.container}>
      {/* Map View */}
      {isLoading && !order ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
            paddingvertical={12}
          />
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.coords.latitude || customerLocation.latitude,
            longitude: location?.coords.longitude || customerLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Customer marker */}
          <Marker
            coordinate={customerLocation}
            title={order?.user?.name || "Customer"}
            description={order?.user?.address || "Customer location"}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Marker>

          {/* Route line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={3}
              strokeColor={Colors.primary}
            />
          )}
        </MapView>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Header
          backBtn={true}
          title={"Track Customer"}
          icon={true}
          support={true}
        />
      </View>

      {/* Animated Bottom Sheet */}
      <Animated.View
        style={[
          styles.contentWrapper,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {status === "Arrived" ? (
          <View style={styles.arrived}>
            <ArrivedLocation />
            <Text style={styles.arrivedTitle}>Arrived At Location</Text>
            <Text style={styles.arrivedText}>
              You've arrived. The order will start once approved by the customer
              or automatically in 5 minutes. Contact support for any issues.
            </Text>
            <Button title="Continue" onPress={handleArrived} width={"100%"} />
          </View>
        ) : (
          <>
            {" "}
            <View style={styles.contentHeader}>
              <Profile />
              <Text style={styles.title}>
                You are estimated to arrive at the customers location in 13
                minutes
              </Text>
            </View>
            <View style={styles.content}>
              {/* Status Tracking */}
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <Accepted width={40} height={40} />
                  <Text style={styles.statusText}>Order</Text>
                  <Text style={styles.statusText2}>Accepted</Text>
                </View>
                <View style={styles.line} />
                <View style={styles.statusItem}>
                  <OTW width={40} height={40} />
                  <Text
                    style={[
                      styles.statusText,
                      status === "OnTheWay" ? styles.activeStatusText : {},
                    ]}
                  >
                    On the Way
                  </Text>
                </View>
                <View
                  style={[
                    styles.line,
                    status === "Arrived" ? styles.line : styles.lineInactive,
                  ]}
                />
                <View style={styles.statusItem}>
                  <Arrived width={40} height={40} />
                  <Text
                    style={[
                      styles.statusText,
                      status === "Arrived" ? styles.activeStatusText : {},
                    ]}
                  >
                    Arrived
                  </Text>
                </View>
              </View>

              {/* Only render ProviderCard if order is available */}
              {order ? (
                <ProviderCard order={order} />
              ) : (
                <View style={styles.noOrderContainer}>
                  <Text style={styles.noOrderText}>
                    Order details not available
                  </Text>
                </View>
              )}
              {order?.status === "accepted" && (
                <View>
                  <Button title="On the way" onPress={handleOnway} />
                </View>
              )}
            </View>
          </>
        )}
      </Animated.View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: Colors.gray100,
    borderRadius: 14,
    marginVertical: 20,
  },
  statusItem: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    color: Colors.gray300,
    textAlign: "center",
    marginTop: 14,
  },
  statusText2: {
    fontSize: 12,
    color: Colors.gray300,
    textAlign: "center",
  },
  activeStatusText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  line: {
    height: 3,
    flex: 1,
    borderRadius: 99,
    backgroundColor: Colors.primary,
    marginHorizontal: 8,
  },
  lineInactive: {
    height: 3,
    flex: 1,
    borderRadius: 99,
    backgroundColor: Colors.primary100,
    marginHorizontal: 8,
  },
  contentWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    paddingBottom: 50,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: "hidden",
    maxHeight: "60%", // Prevent overflow
  },
  contentHeader: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: "80%",
  },
  content: {
    paddingHorizontal: 16,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
  },
  centerButtonContainer: {
    position: "absolute",
    bottom: 300,
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
  markerContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  noOrderContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray100,
    borderRadius: 8,
  },
  noOrderText: {
    fontSize: 16,
    color: Colors.gray300,
  },
  arrived: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 50,
    gap: 20,
  },
  arrivedTitle: {
    fontSize: 22,
    color: Colors.secondary,
    fontWeight: "700",
    marginTop: 12,
  },
  arrivedText: {
    fontSize: 17,
    paddingHorizontal: 16,
    marginBottom: 12,
    textAlign: "center",
  },
});
