import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

type ScreensHeaderProps = {
  title: string;
};

export default function ScreensHeader({ title }: ScreensHeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center mb-6">
      <TouchableOpacity
        className="bg-gray-200 p-2 rounded-full"
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text className="text-2xl font-bold ml-4 text-secondary">{title}</Text>
    </View>
  );
}
