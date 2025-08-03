import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import Header from "~/components/header";
import { Colors } from "~/constants/Colors";
import defaultAvatar from "~/assets/images/default-profile.png";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiCall } from "~/utils/api";
import { FONTS } from "~/constants/Fonts";

// Updated Employee type definition to match API response
type Employee = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  thumb?: string;
  image_url: string;
  phone: string;
  address: string;
  city: string;
  iqama_id: string;
  dob: string;
  status: string; // "1" or "0"
  online_status: string; // "1" or "0"
  company_verified: string; // "1" or "0"
  platform_status: string; // "1" or "0"
  rating?: number;
  review?: number;
  employeeCode?: string;
  pendingApproval?: string;
  timestamp: string;
};

// Filter options for the dropdown
const filterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function Employee() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("all");
  const [items, setItems] = useState(filterOptions);

  const router = useRouter();

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter the employees when filter changes or employees data changes
  useEffect(() => {
    filterEmployees(filterValue);
  }, [filterValue, employees]);

  const filterEmployees = (filter: string) => {
    if (!employees || employees.length === 0) {
      setFilteredEmployees([]);
      return;
    }

    if (filter === "all") {
      setFilteredEmployees(employees);
      return;
    }

    let filtered: Employee[] = [];

    switch (filter) {
      case "active":
        filtered = employees.filter((emp) => emp.status === "1");
        break;
      case "inactive":
        filtered = employees.filter((emp) => emp.status === "0");
        break;
      default:
        filtered = employees;
    }

    setFilteredEmployees(filtered);
  };

  // Function to fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = await AsyncStorage.getItem("user_id");
      console.log(userId);
      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("type", "get_data");
      formData.append("table_name", "users");
      formData.append("user_type", "employee");
      formData.append("company_id", userId);

      const response = await apiCall(formData);

      // Handle the response structure based on your API
      const employeeData = response.data || response;
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEmployees();
  };

  // Navigate to employee profile
  const handleViewProfile = (employeeId: string) => {
    // router.push({
    //   pathname: "/account/view_profile",
    //   params: { employeeId },
    // });
  };

  // Add a new employee
  const handleAddEmployee = () => {
    router.push("/account/add_employee");
  };

  // Helper function to get employee image URL
  const getEmployeeImageUrl = (employee: Employee) => {
    if (employee.thumb) {
      return employee.thumb;
    } else if (employee.image && employee.image_url) {
      return employee.image_url + employee.image;
    }
    return null;
  };

  // Helper function to get status text and style
  const getEmployeeStatus = (employee: Employee) => {
    const isActive = employee.status === "1";
    const isOnline = employee.online_status === "1";

    if (isActive && isOnline)
      return { text: "Active & Online", style: styles.activeStatus };
    if (isActive && !isOnline)
      return { text: "Active & Offline", style: styles.activeOfflineStatus };
    return { text: "Inactive", style: styles.inactiveStatus };
  };

  // Helper function to get verification status
  const getVerificationStatus = (employee: Employee) => {
    return employee.company_verified === "1" && employee.platform_status === "1"
      ? "Verified"
      : "Pending";
  };

  // Employee card component
  const EmployeeCard = ({ employee }: { employee: Employee }) => {
    const statusInfo = getEmployeeStatus(employee);
    const verificationStatus = getVerificationStatus(employee);
    const imageUrl = getEmployeeImageUrl(employee);

    return (
      <TouchableOpacity
        style={styles.employeeCard}
        onPress={() => handleViewProfile(employee.id)}
        activeOpacity={0.7}
      >
        {/* Employee image */}
        <View style={styles.employeeImageContainer}>
          <Image
            source={imageUrl ? { uri: imageUrl } : defaultAvatar}
            style={styles.employeeImage}
            resizeMode="cover"
            defaultSource={defaultAvatar}
          />
          {/* Online status indicator */}
          {employee.online_status === "1" && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

        {/* Employee details */}
        <View style={styles.employeeDetails}>
          <Text
            style={styles.employeeName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {employee.name}
          </Text>

          {employee?.rating && (
            <Text style={styles.employeeEmail} numberOfLines={1}>
              {employee?.rating} ( {employee?.review})
            </Text>
          )}

          <Text style={styles.employeePhone} numberOfLines={1}>
            Employee Code: {employee?.code}
          </Text>
          <Text style={styles.employeeStatus}>
            Status: <Text style={statusInfo.style}>{statusInfo.text}</Text>
          </Text>
        </View>

        {/* Verification status */}
        <View style={styles.verificationContainer}>
          {verificationStatus === "Verified" ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>1/2 Pending</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        backBtn={true}
        title="Employees"
        icon={true}
        onpress={handleAddEmployee}
      />

      {/* Filter dropdown */}
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={filterValue}
          items={items}
          setOpen={setOpen}
          setValue={(callback) => {
            const value =
              typeof callback === "function" ? callback(filterValue) : callback;
            setFilterValue(value);
          }}
          setItems={setItems}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          placeholderStyle={styles.dropdownPlaceholder}
          textStyle={styles.dropdownText}
          ArrowDownIconComponent={() => (
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          )}
          ArrowUpIconComponent={() => (
            <Ionicons name="chevron-up" size={20} color={Colors.secondary} />
          )}
          zIndex={1000}
          listMode="SCROLLVIEW"
        />
      </View>

      {/* Employee list */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="red" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEmployees}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EmployeeCard employee={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ddd" />
              <Text style={styles.emptyText}>No employees found</Text>
              <Text style={styles.emptySubtext}>
                {filterValue !== "all"
                  ? "Try changing your filter"
                  : "Add employees by clicking the + button"}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          ListFooterComponent={
            filteredEmployees && filteredEmployees.length > 0 ? (
              <Text style={styles.totalEmployees}>
                Total: {filteredEmployees.length} employee(s)
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  filterLabel: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownContainer: {
    marginTop: 16,
    marginBottom: 26,
    zIndex: 100,
  },
  dropdown: {
    borderColor: "#f5f5f5",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: Colors.secondary,
  },
  dropdownPlaceholder: {
    color: "#aaa",
  },
  listContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: Colors.secondary,
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
    marginBottom: 16,
    marginTop: 8,
    fontFamily: FONTS.regular,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: "white",
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: Colors.secondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.secondary300,
    textAlign: "center",
    marginTop: 8,
    fontFamily: FONTS.regular,
  },
  employeeCard: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  employeeImageContainer: {
    marginRight: 16,
    position: "relative",
  },
  employeeImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f0f0",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  employeeDetails: {
    flex: 1,
    gap: 3,
    justifyContent: "center",
  },
  employeeName: {
    fontSize: 20,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary,
    marginBottom: 4,
  },
  employeeEmail: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
    marginBottom: 2,
  },
  employeePhone: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
    marginBottom: 2,
  },
  employeeCode: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
    marginBottom: 4,
  },
  employeeStatus: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: Colors.secondary300,
  },
  activeStatus: {
    color: Colors.success,
    fontWeight: "500",
  },
  activeOfflineStatus: {
    color: "#FF9800",
    fontWeight: "500",
  },
  inactiveStatus: {
    color: Colors.danger,
    fontWeight: "500",
  },
  verificationContainer: {
    position: "absolute",
    top: 16,
    right: 10,
  },
  verifiedBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  pendingBadge: {
    backgroundColor: Colors.danger100,
    padding: 12,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: Colors.danger,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  arrowContainer: {
    position: "absolute",
    right: 16,
    top: "50%",
    marginTop: -10,
  },
  totalEmployees: {
    textAlign: "center",
    padding: 16,
    color: Colors.secondary300,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
});
