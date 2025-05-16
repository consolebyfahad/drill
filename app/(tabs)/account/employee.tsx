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

// Employee type definition
type Employee = {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  employeeCode: string;
  status: "Active" | "In-Active" | "NA";
  verificationStatus: "Verified" | "Pending" | "Rejected";
  pendingApproval?: string;
};

// Filter options for the dropdown
const filterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
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

  // Function to filter employees
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
        filtered = employees.filter((emp) => emp.status === "Active");
        break;
      case "inactive":
        filtered = employees.filter((emp) => emp.status === "In-Active");
        break;
      case "pending":
        filtered = employees.filter(
          (emp) => emp.verificationStatus === "Pending"
        );
        break;
      case "verified":
        filtered = employees.filter(
          (emp) => emp.verificationStatus === "Verified"
        );
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

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      const formData = new FormData();
      formData.append("type", "data");
      formData.append("table_name", "user");
      formData.append("user_type", "employee");
      formData.append("company_id", userId);

      const response = await apiCall(formData);

      if (!response || !Array.isArray(response)) {
        throw new Error("Invalid response from server");
      }

      setEmployees(response);
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
    router.push({
      pathname: "/account/view_profile",
      params: { employeeId },
    });
  };

  // Add a new employee
  const handleAddEmployee = () => {
    router.push("/account/add_employee");
  };

  // Employee card component
  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => handleViewProfile(employee.id)}
      activeOpacity={0.7}
    >
      {/* Employee image */}
      <View style={styles.employeeImageContainer}>
        <Image
          source={employee.image ? { uri: employee.image } : defaultAvatar}
          style={styles.employeeImage}
          resizeMode="cover"
          defaultSource={defaultAvatar}
        />
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

        {employee.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>
              {employee.rating.toFixed(1)} ({employee.reviewCount}+ review)
            </Text>
          </View>
        )}

        <Text style={styles.employeeCode} numberOfLines={1}>
          Employee Code: {employee.employeeCode}
        </Text>

        <Text style={styles.employeeStatus}>
          Status:{" "}
          <Text style={getStatusStyle(employee.status)}>{employee.status}</Text>
        </Text>

        {employee.pendingApproval && (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingLabel}>Action: </Text>
            <Text style={styles.pendingText}>{employee.pendingApproval}</Text>
          </View>
        )}
      </View>

      {/* Verification status */}
      <View style={styles.verificationContainer}>
        {employee.verificationStatus === "Verified" ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : employee.verificationStatus === "Pending" ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>Pending</Text>
          </View>
        ) : employee.verificationStatus === "Rejected" ? (
          <View style={styles.rejectedBadge}>
            <Text style={styles.rejectedText}>Rejected</Text>
          </View>
        ) : null}
      </View>

      {/* Arrow indicator for navigation */}
      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.secondary300}
        />
      </View>
    </TouchableOpacity>
  );

  // Get style based on employee status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Active":
        return styles.activeStatus;
      case "In-Active":
        return styles.inactiveStatus;
      default:
        return styles.naStatus;
    }
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
        <Text style={styles.filterLabel}>Filter Employees:</Text>
        <DropDownPicker
          open={open}
          value={filterValue}
          items={items}
          setOpen={setOpen}
          setValue={setFilterValue}
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
    fontWeight: "500",
    color: Colors.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  dropdownContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    zIndex: 100,
  },
  dropdown: {
    borderColor: "#e0e0e0",
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
    color: Colors.secondary,
  },
  dropdownPlaceholder: {
    color: "#aaa",
  },
  listContainer: {
    // paddingBottom: 80,
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
    fontWeight: "bold",
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
    fontWeight: "500",
    color: Colors.secondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.secondary300,
    textAlign: "center",
    marginTop: 8,
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
  },
  employeeImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f0f0", // Placeholder background
  },
  employeeDetails: {
    flex: 1,
    justifyContent: "center",
  },
  employeeName: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.secondary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.secondary,
    marginLeft: 4,
  },
  employeeCode: {
    fontSize: 14,
    color: Colors.secondary300,
    marginBottom: 4,
  },
  employeeStatus: {
    fontSize: 14,
    color: Colors.secondary300,
  },
  activeStatus: {
    color: Colors.success,
    fontWeight: "500",
  },
  inactiveStatus: {
    color: Colors.danger,
    fontWeight: "500",
  },
  naStatus: {
    color: Colors.secondary300,
    fontWeight: "500",
  },
  pendingContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  pendingLabel: {
    fontSize: 14,
    color: Colors.secondary300,
  },
  pendingText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  verificationContainer: {
    position: "absolute",
    top: 16,
    right: 36, // Make space for the arrow
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
    fontWeight: "500",
  },
  pendingBadge: {
    backgroundColor: "#fff8e1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pendingBadgeText: {
    color: "#ffa000",
    fontSize: 12,
    fontWeight: "500",
  },
  rejectedBadge: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rejectedText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: "500",
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
  },
});
