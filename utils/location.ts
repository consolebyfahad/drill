import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

/** @deprecated Prefer fetchAndPersistCoordinates for new code — persists lat/lng for maps and APIs */
export const getLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    console.warn("Location permission not granted");
    return null;
  }

  const location = await Location.getCurrentPositionAsync({});
  return location;
};

/**
 * Requests foreground location, saves `latitude` / `longitude` to AsyncStorage (strings),
 * and returns coordinates. Returns `null` if permission is denied.
 */
export async function fetchAndPersistCoordinates(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return null;
  }
  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;
  await AsyncStorage.setItem("latitude", String(latitude));
  await AsyncStorage.setItem("longitude", String(longitude));
  return { latitude, longitude };
}
