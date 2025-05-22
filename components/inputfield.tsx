import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";
import { FONTS } from "~/constants/Fonts";

interface InputFieldProps {
  label?: any;
  placeholder?: string;
  IconComponent?: React.ReactNode;
  value?: string;
  required?: boolean;
  keyboardType?: KeyboardTypeOptions;
  onChangeText: (text: string) => void;
  error?: any;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  IconComponent,
  value,
  onChangeText,
  keyboardType,
  required,
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          <Text style={styles.errorText}>{required ? "*" : ""}</Text>
        </Text>
      )}
      <View style={styles.inputContainer}>
        {IconComponent && <View>{IconComponent}</View>}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.secondary300}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
        />
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.errorText}> </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: Colors.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary300,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: Colors.secondary,
  },

  errorText: {
    color: "red",
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;
