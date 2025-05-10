import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import Header from "~/components/header";
import { Colors } from "~/constants/Colors";
import defaultAvatar from "~/assets/images/default-profile.png";

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

// Sample employee data (replace with API data later)
const sampleEmployees: Employee[] = [
  {
    id: "1",
    name: "Dawood Abdullah",
    image: null,
    rating: 4.9,
    reviewCount: 120,
    employeeCode: "001",
    status: "Active",
    verificationStatus: "Verified",
  },
  {
    id: "2",
    name: "Ali Zahid",
    image: null,
    rating: 4.9,
    reviewCount: 120,
    employeeCode: "002",
    status: "In-Active",
    verificationStatus: "Verified",
  },
  {
    id: "3",
    name: "Osama Zahid",
    image: null,
    rating: 0,
    reviewCount: 0,
    employeeCode: "003",
    status: "NA",
    verificationStatus: "Pending",
    pendingApproval: "1/2 Pending",
  },
  {
    id: "4",
    name: "Muhammad Shoaib",
    image: null,
    rating: 0,
    reviewCount: 0,
    employeeCode: "001",
    status: "NA",
    verificationStatus: "Pending",
    pendingApproval: "2/2 Pending",
  },
  {
    id: "5",
    name: "Dawood Abdullah",
    image: null,
    rating: 4.9,
    reviewCount: 120,
    employeeCode: "004",
    status: "Active",
    verificationStatus: "Verified",
  },
];

// Filter options for the dropdown
const filterOptions = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
];

export default function Employee() {
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees);
  const [filteredEmployees, setFilteredEmployees] =
    useState<Employee[]>(sampleEmployees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [filterValue, setFilterValue] = useState("all");

  const router = useRouter();

  // Filter the employees when filter changes
  useEffect(() => {
    filterEmployees(filterValue);
  }, [filterValue, employees]);

  // Function to filter employees
  const filterEmployees = (filter: string) => {
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

  // Function to fetch employees (implement with actual API later)
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      // Replace with actual API call
      // const response = await apiCall({ type: 'get_employees' });
      // setEmployees(response.employees);

      // Using sample data for now
      setEmployees(sampleEmployees);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
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
    >
      {/* Employee image */}
      <View style={styles.employeeImageContainer}>
        <Image
          source={employee.image ? { uri: employee.image } : defaultAvatar}
          style={styles.employeeImage}
          resizeMode="cover"
        />
      </View>

      {/* Employee details */}
      <View style={styles.employeeDetails}>
        <Text style={styles.employeeName}>{employee.name}</Text>

        {employee.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>
              {employee.rating} ({employee.reviewCount}+ review)
            </Text>
          </View>
        )}

        <Text style={styles.employeeCode}>
          Employee Code: {employee.employeeCode}
        </Text>

        <Text style={styles.employeeStatus}>
          Status:{" "}
          <Text style={getStatusStyle(employee.status)}>{employee.status}</Text>
        </Text>

        {employee.pendingApproval && (
          <View style={styles.pendingContainer}>
            <Text style={styles.pendingLabel}>Action: </Text>
            <Text style={styles.pendingText}>Pending Approval</Text>
          </View>
        )}
      </View>

      {/* Verification status */}
      <View style={styles.verificationContainer}>
        {employee.verificationStatus === "Verified" ? (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : employee.pendingApproval ? (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>
              {employee.pendingApproval}
            </Text>
          </View>
        ) : null}
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
    <SafeAreaView style={styles.container}>
      <Header
        backBtn={true}
        title="Employee"
        icon={true}
        onIconPress={handleAddEmployee}
      />

      {/* Filter dropdown */}
      <View style={styles.dropdownContainer}>
        <DropDownPicker
          open={open}
          value={filterValue}
          items={filterOptions}
          setOpen={setOpen}
          setValue={setFilterValue}
          setItems={() => {}}
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
        />
      </View>

      {/* Employee list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
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
              <Text style={styles.emptyText}>No employees found</Text>
            </View>
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
  dropdownContainer: {
    marginBottom: 16,
    zIndex: 100,
  },
  dropdown: {
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  dropdownList: {
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "white",
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.secondary,
  },
  dropdownPlaceholder: {
    color: "#aaa",
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  employeeCard: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: "relative",
  },
  employeeImageContainer: {
    marginRight: 16,
  },
  employeeImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  employeeDetails: {
    flex: 1,
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
    right: 16,
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
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pendingBadgeText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: "500",
  },
});
