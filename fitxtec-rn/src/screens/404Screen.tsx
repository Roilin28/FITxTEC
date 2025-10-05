import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import { useNavigation } from "@react-navigation/native";
import HomeScreen from "./HomeScreen";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
};

export default function NotFoundScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons
          name="alert-circle-outline"
          size={80}
          color={colors.primary}
        />
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>

        <Text style={styles.text}>
          The screen you’re looking for doesn’t exist or has been moved.
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.9}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: colors.primary,
    fontSize: 72,
    fontWeight: "900",
    marginTop: 12,
  },
  subtitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  text: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
