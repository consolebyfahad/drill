import React from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "~/constants/Colors";

interface CustomInputFieldProps {
  label: string;
  placeholder: string;
  IconComponent: React.ReactNode;
  value: string | undefined;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  fieldName: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  numbersOnly?: boolean;
}

const CustomInputField: React.FC<CustomInputFieldProps> = ({
  label,
  placeholder,
  IconComponent,
  value,
  onChangeText,
  keyboardType,
  fieldName,
  required = true,
  error,
  maxLength,
  numbersOnly = false,
}) => {
  // For numbers-only input
  const handleTextChange = (text: string) => {
    if (numbersOnly) {
      // Replace any non-digit with empty string
      const sanitizedText = text.replace(/[^0-9]/g, "");
      onChangeText(sanitizedText);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: "red" }}>*</Text>}
      </Text>
      <View
        style={[styles.customInputContainer, error ? styles.inputError : null]}
      >
        {IconComponent && <View>{IconComponent}</View>}
        <TextInput
          style={styles.customInput}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondary300}
          value={value}
          onChangeText={handleTextChange}
          keyboardType={numbersOnly ? "numeric" : keyboardType}
          maxLength={maxLength}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.secondary,
    marginBottom: 8,
  },
  customInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary300,
    padding: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputError: {
    borderColor: "red",
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.secondary,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default CustomInputField;
