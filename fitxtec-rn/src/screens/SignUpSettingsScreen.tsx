import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { usuario } = route.params as { usuario: any };

  const [weightUnit, setWeightUnit] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("");

  const onFinish = async () => {
    try {
      // 🔹 Guardamos los datos
      await signUpSettings(weightUnit, distanceUnit, usuario);

      // 🔹 Enviamos correo de bienvenida
      await fetch("https://hooks.zapier.com/hooks/catch/25224730/usotvwu/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          name: usuario.nombre,
          email: usuario.email,
          }),
    });

      // 🔹 Navegamos al login
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error en registro final:", error);
      alert("Ocurrió un error al completar el registro.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>FITxTEC</Text>
            <Text style={styles.subtitle}>App Settings</Text>

            <View style={styles.card}>
              {/* WEIGHT */}
              <Text style={styles.label}>Weight Unit</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={weightUnit}
                  onValueChange={setWeightUnit}
                  style={styles.input}
                  dropdownIconColor="white"
                  itemStyle={Platform.OS === "ios" ? { color: "white", fontSize: 16 } : undefined}
                >
                  <Picker.Item label="Kilograms (kg)" value="kg" />
                  <Picker.Item label="Pounds (lbs)" value="lbs" />
                </Picker>
              </View>

              {/* DISTANCE */}
              <Text style={styles.label}>Distance Unit</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={distanceUnit}
                  onValueChange={setDistanceUnit}
                  style={styles.input}
                  dropdownIconColor="white"
                  itemStyle={Platform.OS === "ios" ? { color: "white", fontSize: 16 } : undefined}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    alignItems: "center",
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
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.text,
    marginBottom: 14,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});