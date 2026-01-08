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
import { useTranslation } from "react-i18next";
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
import { FONTS } from "~/constants/Fonts";

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

// Default location (you can set this to your city's coordinates)
const DEFAULT_LOCATION = {
  latitude: 37.78825,
  longitude: -122.4324,
};

// Google Maps API Key (from app.json)
const GOOGLE_MAPS_API_KEY = "AIzaSyAQiilQ_i4LRPFyMhfLB5ZT3UGMTIxqL0Y";

// Function to decode polyline from Google Directions API
const decodePolyline = (
  encoded: string
): Array<{ latitude: number; longitude: number }> => {
  let poly = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({
      latitude: lat * 1e-5,
      longitude: lng * 1e-5,
    });
  }
  return poly;
};

// Function to fetch route from Google Directions API
const fetchRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<Array<{ latitude: number; longitude: number }> | null> => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destinationStr = `${destination.latitude},${destination.longitude}`;

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const points = route.overview_polyline.points;
      return decodePolyline(points);
    } else {
      console.error("Directions API error:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};

export default function Track() {
  const { t } = useTranslation();
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
  const locationSubscriptionRef = useRef<any>(null);

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
        setStatus(orderData?.status || "OnTheWay");
        console.log("orderData?.status", orderData);
      } else {
        console.log("No order details found");
        setOrder(null);
        setErrorMsg("Order details not found");
      }
    } catch (error) {
      console.error("Failed to fetch order details", error);
      setOrder(null);
      setErrorMsg("Failed to load order details. Please try again.");
    } finally {
      setIsLoading(false);
      setIsOrderLoaded(true);
    }
  }, [orderId, isOrderLoaded]);

  // Get the customer location from the order with proper error handling
  const customerLocation = useMemo(() => {
    if (order?.lat && order?.lng) {
      const lat = parseFloat(order.lat);
      const lng = parseFloat(order.lng);

      // Validate coordinates
      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
      ) {
        return {
          latitude: lat,
          longitude: lng,
        };
      }
    }
    return null;
  }, [order]);

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

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
    },
    []
  );

  useEffect(() => {
    if (location && customerLocation) {
      const currentLat = location.coords.latitude;
      const currentLng = location.coords.longitude;
      const customerLat = customerLocation.latitude;
      const customerLng = customerLocation.longitude;

      console.log("Customer location:", customerLat, customerLng);
      const distance = calculateDistance(
        currentLat,
        currentLng,
        customerLat,
        customerLng
      );

      console.log("Distance to customer:", distance, "meters");

      if (distance < 1021) {
        setStatus("Arrived");
      }
    }
  }, [location, customerLocation, calculateDistance]);

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

        // Subscribe to location updates
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5,
            timeInterval: 5000,
          },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation);
            }
          }
        );

        locationSubscriptionRef.current = subscription;
      } catch (error) {
        console.error("Error getting location:", error);
        if (isMounted) {
          setErrorMsg(
            "Failed to get your location. Please check your GPS settings."
          );
        }
      }
    };

    setupLocationTracking();

    return () => {
      isMounted = false;
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

      // Fetch route from Google Directions API to show road-based route
      const getRoute = async () => {
        const route = await fetchRoute(startPoint, customerLocation);
        if (route && route.length > 0) {
          setRouteCoordinates(route);

          // Fit map to show the route
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates(route, {
                edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
                animated: true,
              });
            }
          }, 500);
        } else {
          // Fallback to straight line if API fails
          setRouteCoordinates([startPoint, customerLocation]);

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates([startPoint, customerLocation], {
                edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
                animated: true,
              });
            }
          }, 500);
        }
      };

      getRoute();

      // Set loading to false since we have both locations
      setIsLoading(false);
    } else if (location && !customerLocation && order) {
      // We have location but no customer location, still show map
      setIsLoading(false);
    }
  }, [location, customerLocation, order]);

  const handleAlert = useCallback(() => {
    console.log("Alert sent to customer");
    Alert.alert("Success", "Alert sent to customer");
  }, []);

  // Show loading screen
  if (isLoading && !errorMsg && !order) {
    return (
      <View style={styles.fullScreenLoading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t("order.loadingOrderDetails")}</Text>
      </View>
    );
  }

  // Show error screen
  if (errorMsg && !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Button
          title={t("order.retry")}
          onPress={() => {
            setErrorMsg(null);
            setIsOrderLoaded(false);
            getOrderDetails();
          }}
          variant="primary"
          paddingvertical={12}
        />
        <Button
          title={t("order.goBack")}
          onPress={() => router.back()}
          variant="secondary"
          paddingvertical={12}
        />
      </View>
    );
  }

  const handleArrived = async () => {
    if (!order?.id) {
      Alert.alert(t("error"), t("order.cannotAcceptJob"));
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert(t("error"), t("order.userInfoNotFound"));
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
        Alert.alert(t("error"), t("order.failedToAcceptJob"));
      }
    } catch (error) {
      console.error("Error accepting job request:", error);
      Alert.alert(t("error"), t("order.errorAcceptingJob"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnway = async () => {
    if (!order?.id) {
      Alert.alert(t("error"), t("order.cannotAcceptJob"));
      return;
    }

    setIsLoading(true);

    try {
      const userId = await AsyncStorage.getItem("user_id");

      if (!userId) {
        Alert.alert(t("error"), t("order.userInfoNotFound"));
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
        router.push({
          pathname: "/order/order_place",
          params: { orderId: orderId },
        });
      } else {
        Alert.alert(t("error"), t("order.failedToAcceptJob"));
      }
    } catch (error) {
      console.error("Error accepting job request:", error);
      Alert.alert(t("error"), t("order.errorAcceptingJob"));
    } finally {
      setIsLoading(false);
    }
  };

  // Determine the initial region for the map
  const getInitialRegion = () => {
    if (location) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else if (customerLocation) {
      return {
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else {
      return {
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      {/* Map View */}
      {isLoading && !order ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t("order.gettingLocation")}</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Customer marker - only show if customerLocation exists */}
          {customerLocation && (
            <Marker
              coordinate={customerLocation}
              title={order?.user?.name || "Customer"}
              description={order?.user?.address || "Customer location"}
            >
              <View style={styles.markerContainer}>
                <Ionicons name="person" size={20} color="#fff" />
              </View>
            </Marker>
          )}

          {/* Route line - only show if we have both locations */}
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
          title={t("order.trackCustomer")}
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
            <Text style={styles.arrivedTitle}>
              {t("order.arrivedAtLocation")}
            </Text>
            <Text style={styles.arrivedText}>{t("order.arrivedMessage")}</Text>
            <Button
              title={t("continue")}
              onPress={handleArrived}
              width={"100%"}
            />
          </View>
        ) : (
          <>
            <View style={styles.contentHeader}>
              <Profile />
              <Text style={styles.title}>{t("order.estimatedArrival")}</Text>
            </View>
            <View style={styles.content}>
              {/* Status Tracking */}
              <View style={styles.statusContainer}>
                <View style={styles.statusItem}>
                  <Accepted width={40} height={40} />
                  <Text style={styles.statusText}>
                    {t("order.orderAccepted")}
                  </Text>
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
                    {t("order.onTheWay")}
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
                      status === "Arrived" || status === "Started"
                        ? styles.activeStatusText
                        : {},
                    ]}
                  >
                    {t("order.arrived")}
                  </Text>
                </View>
              </View>

              {/* Only render ProviderCard if order is available */}
              {order ? (
                <ProviderCard order={order} />
              ) : (
                <View style={styles.noOrderContainer}>
                  <Text style={styles.noOrderText}>
                    {t("order.orderDetailsNotAvailable")}
                  </Text>
                </View>
              )}

              {order?.status === "accepted" && (
                <View>
                  <Button
                    title={t("order.onTheWayButton")}
                    onPress={handleOnway}
                  />
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
    fontFamily: FONTS.regular,
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.regular,
    marginTop: 14,
  },
  statusText2: {
    fontSize: 12,
    color: Colors.gray300,
    textAlign: "center",
    fontFamily: FONTS.regular,
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
    maxHeight: "60%",
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
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.bold,
    marginTop: 12,
  },
  arrivedText: {
    fontSize: 17,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontFamily: FONTS.regular,
    textAlign: "center",
  },
});
