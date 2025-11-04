import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import colors from "../theme/color";
import { useAuth } from "../services/AuthContext";
import {
  getConfiguracionUsuario,
  updateConfiguracionUsuario,
} from "../services/configuraciones";

type RootStackParamList = {
  HomeMain: undefined;
  ProfileMain: undefined;
  Settings: undefined;
};

export default function SettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, updateUserFields } = useAuth();

  // Notificaciones
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [restDayReminders, setRestDayReminders] = useState(false);
  const [prCelebrations, setPrCelebrations] = useState(true);

  // Unidades
  const [weightUnit, setWeightUnit] = useState("kg");
  const [distanceUnit, setDistanceUnit] = useState("km");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar configuración desde Firebase
  useEffect(() => {
    const loadConfig = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const config = await getConfiguracionUsuario(user.id);
          if (config) {
            setWorkoutReminders(config.workoutReminders ?? true);
            setProgressUpdates(config.progressUpdates ?? true);
            setRestDayReminders(config.restDayReminders ?? false);
            setPrCelebrations(config.prCelebrations ?? true);
            setWeightUnit(config.unidadPeso || "kg");
            setDistanceUnit(config.unidadDistancia || "km");
          }
        } catch (error) {
          console.error("Error loading config:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadConfig();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      // Guardar en colección de configuraciones
      const success = await updateConfiguracionUsuario(user.id, {
        workoutReminders,
        progressUpdates,
        restDayReminders,
        prCelebrations,
        unidadPeso: weightUnit,
        unidadDistancia: distanceUnit,
      });

      // También guardar unidades en usuarios para compatibilidad
      await updateUserFields({
        unidadPeso: weightUnit,
        unidadDistancia: distanceUnit,
      });

      if (success) {
        Alert.alert("Éxito", "Configuración guardada correctamente.");
      } else {
        throw new Error("Error al guardar");
      }
    } catch (e) {
      console.error("Error al guardar configuración:", e);
      Alert.alert("Error", "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#10131b", "#151820"]}
        style={styles.gradient}
      />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brand}>Configuración</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando configuración...</Text>
          </View>
        ) : (
          <>
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Notificaciones</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Recordatorios de Workout</Text>
              <Text style={styles.settingDescription}>
                Recibe notificaciones para comenzar tus entrenamientos
              </Text>
            </View>
            <Switch
              value={workoutReminders}
              onValueChange={setWorkoutReminders}
              thumbColor={workoutReminders ? colors.primary : "#888"}
              trackColor={{ false: "#444", true: "#9EFF0044" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Actualizaciones de Progreso</Text>
              <Text style={styles.settingDescription}>
                Notificaciones sobre tu progreso semanal
              </Text>
            </View>
            <Switch
              value={progressUpdates}
              onValueChange={setProgressUpdates}
              thumbColor={progressUpdates ? colors.primary : "#888"}
              trackColor={{ false: "#444", true: "#9EFF0044" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Recordatorios de Días de Descanso</Text>
              <Text style={styles.settingDescription}>
                Notificaciones para tus días de recuperación
              </Text>
            </View>
            <Switch
              value={restDayReminders}
              onValueChange={setRestDayReminders}
              thumbColor={restDayReminders ? colors.primary : "#888"}
              trackColor={{ false: "#444", true: "#9EFF0044" }}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Celebraciones de PR</Text>
              <Text style={styles.settingDescription}>
                Notificaciones cuando logras nuevos récords personales
              </Text>
            </View>
            <Switch
              value={prCelebrations}
              onValueChange={setPrCelebrations}
              thumbColor={prCelebrations ? colors.primary : "#888"}
              trackColor={{ false: "#444", true: "#9EFF0044" }}
            />
          </View>
        </View>

        {/* Units Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="scale-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Unidades</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Unidad de Peso</Text>
              <Text style={styles.settingDescription}>
                Selecciona la unidad para medir peso
              </Text>
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

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Unidad de Distancia</Text>
              <Text style={styles.settingDescription}>
                Selecciona la unidad para medir distancia
              </Text>
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
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Información de la App</Text>
          </View>

          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>Versión</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>Política de Privacidad</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>Términos de Servicio</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Ionicons name="checkmark-circle" size={20} color={colors.primaryText} />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar Configuración"}
          </Text>
        </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.bg,
  },
  backButton: {
    padding: 4,
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  settingItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
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
    padding: 14,
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
  infoItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  infoValue: {
    fontSize: 14,
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 16,
    fontSize: 14,
  },
});

