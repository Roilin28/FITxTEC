import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signUpSettings } from "../services/SignUp";
import { sendWelcomeEmail } from "../services/webhooks";

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
  const [weightUnit, setWeightUnit] = useState("kg");
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    if (!weightUnit || !distanceUnit) {
      Alert.alert("Error", "Por favor selecciona todas las unidades.");
      return;
    }

    setLoading(true);
    try {
      // Guardamos los datos
      await signUpSettings(weightUnit, distanceUnit, usuario);

      // Enviamos correo de bienvenida
      await sendWelcomeEmail(usuario.nombre || "", usuario.email);

      // Navegamos al login
      Alert.alert(
        "¡Cuenta creada!",
        "Tu cuenta ha sido creada exitosamente. Bienvenido a FITxTEC.",
        [
          {
            text: "Continuar",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error) {
      console.error("Error en registro final:", error);
      Alert.alert("Error", "Ocurrió un error al completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#10131b", "#151820"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
          <Text style={styles.progressText}>Paso 3 de 3</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Ionicons name="settings-outline" size={40} color={colors.primary} />
          <Text style={styles.title}>Configuración</Text>
          <Text style={styles.subtitle}>
            Último paso: configura tus preferencias
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Weight Unit */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons
                name="scale-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.label}>Unidad de Peso</Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  weightUnit === "kg" && styles.optionButtonActive,
                ]}
                onPress={() => setWeightUnit("kg")}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    weightUnit === "kg" && styles.optionButtonTextActive,
                  ]}
                >
                  Kilogramos (kg)
                </Text>
                {weightUnit === "kg" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primaryText}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  weightUnit === "lbs" && styles.optionButtonActive,
                ]}
                onPress={() => setWeightUnit("lbs")}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    weightUnit === "lbs" && styles.optionButtonTextActive,
                  ]}
                >
                  Libras (lbs)
                </Text>
                {weightUnit === "lbs" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primaryText}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Distance Unit */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Ionicons
                name="map-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.label}>Unidad de Distancia</Text>
            </View>
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  distanceUnit === "km" && styles.optionButtonActive,
                ]}
                onPress={() => setDistanceUnit("km")}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    distanceUnit === "km" && styles.optionButtonTextActive,
                  ]}
                >
                  Kilómetros (km)
                </Text>
                {distanceUnit === "km" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primaryText}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  distanceUnit === "mi" && styles.optionButtonActive,
                ]}
                onPress={() => setDistanceUnit("mi")}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    distanceUnit === "mi" && styles.optionButtonTextActive,
                  ]}
                >
                  Millas (mi)
                </Text>
                {distanceUnit === "mi" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primaryText}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={onFinish}
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primaryText}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryBtnText}>Crear Cuenta</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Al crear tu cuenta, aceptas nuestros{" "}
            </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Términos de Servicio</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}> y </Text>
            <TouchableOpacity>
              <Text style={styles.linkText}>Política de Privacidad</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainer: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  optionsContainer: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  optionButton: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  optionButtonTextActive: {
    color: colors.primaryText,
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
  linkText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
