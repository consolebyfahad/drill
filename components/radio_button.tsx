import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "~/constants/Colors";
import { FONTS } from "~/constants/Fonts";

type RadioButtonProps = {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
};

const RadioButton: React.FC<RadioButtonProps> = ({
  options,
  selectedOption,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={styles.optionContainer}
          onPress={() => onSelect(option)}
        >
          <View
            style={[
              styles.radioCircle,
              selectedOption === option && styles.selected,
            ]}
          >
            {selectedOption === option && <View style={styles.innerCircle} />}
          </View>
          <Text
            style={[
              styles.label,
              {
                color:
                  selectedOption === option
                    ? Colors.secondary
                    : Colors.secondary300,
              },
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.secondary300,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  innerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
});

export default RadioButton;
