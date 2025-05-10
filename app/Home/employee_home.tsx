import { Ionicons } from "@expo/vector-icons";
import { firebase } from "@react-native-firebase/messaging";
import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import JobRequestCard from "~/components/jobrequest_card";
import ToggleJob from "~/components/toggle_job";
import {
  getFCMToken,
  requestFCMPermission,
  setupNotificationListeners,
} from "~/utils/notification";

const EmployeeHome = () => {
  const [greeting, setGreeting] = useState("Good Afternoon!");
  const [address, setAddress] = useState("Loading address...");
  const [location, setLocation] = useState(null);
  const [isOn, setIsOn] = useState(false);
  const [jobRequest, setJobRequest] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [map, setMap] = useState(null);

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

  useEffect(() => {
    const initFCM = async () => {
      await requestFCMPermission();
      const token = await getFCMToken();
      console.log("📲 User FCM Token:", token);
      console.log("Firebase App Config:", firebase.app().options);
    };

    const handleNotificationPress = (data: any) => {
      console.log(
        "🚨 Notification received (foreground/background/quit):",
        data
      );
      if (data?.type === "job_request") {
        setJobRequest(data); // Assuming your card uses this to show job info
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

  const handleHideJob = () => {
    setJobRequest(null);
  };

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleMapRef = useCallback((ref) => {
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
        {jobRequest && <JobRequestCard onDecline={handleHideJob} />}
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
