import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import colors from "../theme/color";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signUpSettings } from "../services/SignUp";

type RootStackParamList = {
  SignUpSettings: { usuario: any };
  SignUpTraining: { usuario: any };
  Login: undefined;
};

export default function SignUpSettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute();
  const { usuario } = route.params as { usuario: any };
  console.log("Received usuario:", usuario);
  const [weightUnit, setWeightUnit] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("");

  const onFinish = () => {
    // Guardar datos o enviar al backend si es necesario
        console.log({ weightUnit, distanceUnit });
        signUpSettings(weightUnit, distanceUnit, usuario);
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>FITxTEC</Text>
        <Text style={styles.subtitle}>App Settings</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Weight Unit</Text>
          <View style={[styles.inputWrapper, { backgroundColor: "#1E1E1E" }]}>
            <Picker
              selectedValue={weightUnit}
              onValueChange={setWeightUnit}
              style={{ color: "white" }} // 👈 color de texto igual al UserScreen
              dropdownIconColor="white" // 👈 icono blanco igual
              placeholder="Select weight unit"
            >
              <Picker.Item label="Kilograms (kg)" value="kg" />
              <Picker.Item label="Pounds (lbs)" value="lbs" />
            </Picker>
          </View>

          <Text style={styles.label}>Distance Unit</Text>
          <View style={[styles.inputWrapper, { backgroundColor: "#1E1E1E" }]}>
            <Picker
                selectedValue={distanceUnit}
                onValueChange={setDistanceUnit}
                style={{ color: "white" }} // 👈 color de texto igual al UserScreen
                dropdownIconColor="white" // 👈 icono blanco igual
                placeholder="Select distance unit"
                
            >
              <Picker.Item label="Kilometers (km)" value="km" />
              <Picker.Item label="Miles (mi)" value="mi" />
            </Picker>
          </View>

          <TouchableOpacity onPress={onFinish} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  inputWrapper: {
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    justifyContent: "center",
  },
  input: {
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
