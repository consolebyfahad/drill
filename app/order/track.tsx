import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
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

export default function Track() {
  const [status, setStatus] = useState("OnTheWay");
  const slideAnim = useRef(new Animated.Value(800)).current;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const mapRef = useRef(null);

  // Get the provider data passed from the ProviderCard component
  const params = useLocalSearchParams();
  const provider = params.provider ? JSON.parse(params.provider) : null;
  const image_url = params.image_url;

  // Set default provider location if lat/lng are empty
  const providerLocation = {
    latitude: provider?.lat ? parseFloat(provider.lat) : 25.377342,
    longitude: provider?.lng ? parseFloat(provider.lng) : 46.462546,
  };

  useEffect(() => {
    // Animate bottom sheet
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Get current location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setIsLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location);

        // Generate simple straight line route for demonstration
        // In a real app, you would use a routing API like Google Directions API
        if (location) {
          const startPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          // Create a simple straight-line route (in real app, use Directions API)
          setRouteCoordinates([startPoint, providerLocation]);

          // Fit map to show both points
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates([startPoint, providerLocation], {
                edgePadding: { top: 50, right: 50, bottom: 250, left: 50 },
                animated: true,
              });
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Failed to get your location");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleAlert = () => {
    // Implement alert functionality
    console.log("Alert sent");
  };

  const centerMapOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Getting location...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: location?.coords.latitude || 25.276987,
            longitude: location?.coords.longitude || 55.296249,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* Provider Marker */}
          <Marker
            coordinate={providerLocation}
            title={provider?.name || "Provider"}
            description={provider?.address || "Provider location"}
          >
            <View style={styles.markerContainer}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </Marker>

          {/* Draw route between user and provider */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={3}
              strokeColor={Colors.primary}
            />
          )}
        </MapView>
      )}

      {/* Center on user button */}
      <View style={styles.centerButtonContainer}>
        <Ionicons
          name="locate"
          size={24}
          color={Colors.primary}
          style={styles.centerButton}
          onPress={centerMapOnUser}
        />
      </View>

      <View style={styles.header}>
        <Header
          backBtn={true}
          title={`Track ${provider?.name || "Customer"}`}
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
        <View style={styles.contentHeader}>
          <Profile />
          <Text style={styles.title}>
            You are estimated to arrive at the customer's location in 13 minutes
          </Text>
        </View>
        <View style={styles.content}>
          {/* Status Tracking */}
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Accepted width={40} height={40} marginBottom={4} />
              <Text style={styles.statusText}> Order</Text>
              <Text style={styles.statusText}>Accepted</Text>
            </View>
            <View style={styles.line} />
            <View style={styles.statusItem}>
              <OTW width={40} height={40} marginBottom={4} />
              <Text style={styles.statusText}>On the Way</Text>
            </View>
            <View style={styles.lineInactive} />
            <View style={styles.statusItem}>
              <Arrived width={40} height={40} marginBottom={4} />
              <Text style={styles.statusText}>Arrived</Text>
            </View>
          </View>

          {/* Display the ProviderCard if provider data exists */}
          {provider && (
            <ProviderCard provider={provider} image_url={image_url} />
          )}
        </View>

        {status === "Arrived" && (
          <View style={styles.buttonContainer}>
            <Button title="Send Alert" onPress={handleAlert} />
          </View>
        )}
      </Animated.View>
    </View>
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
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    padding: 20,
  },
  header: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
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
    borderRadius: 20,
    width: "100%",
    elevation: 1,
    shadowColor: Colors.gray100,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    overflow: "hidden",
    shadowRadius: 4,
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
  },
  content: {
    paddingHorizontal: 16,
  },
  buttonContainer: {
    padding: 16,
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
});
