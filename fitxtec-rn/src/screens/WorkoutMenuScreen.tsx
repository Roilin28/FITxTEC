import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import colors from "../theme/color";
import { useAuth } from "../services/AuthContext";
import {
  getRutinasEnProgreso,
  getWorkoutSessionsDeRutina,
  terminarRutinaEnProgreso,
} from "../services/rutinasEnProgreso";
import { getRutinaDeepOrAi, RutinaCompleta } from "../services/Routines";

type RootStackParamList = {
  WorkoutMain: undefined;
  WorkoutDetail: { rutinaEnProgresoId: string };
};

type TabParamList = {
  Home: undefined;
  Routines: undefined;
  Workout: undefined;
  Progress: undefined;
  Profile: undefined;
};

interface RutinaConProgreso {
  id: string;
  rutinaId: string;
  rutinaCompleta: RutinaCompleta;
  diaActual: number;
  totalDias: number;
  progress: number; // porcentaje completado
}

export default function WorkoutMenuScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { user } = useAuth();
  const [rutinas, setRutinas] = useState<RutinaConProgreso[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedRutinas, setSelectedRutinas] = useState<Set<string>>(
    new Set()
  );

  const fetchRutinasEnProgreso = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Obtener todas las rutinas en progreso del usuario (no terminadas)
      const rutinasEnProgreso = await getRutinasEnProgreso(user.id);

      // Obtener los detalles de cada rutina y calcular el progreso
      // Usar Promise.allSettled para manejar rutinas que no se encuentren
      const resultados = await Promise.allSettled(
        rutinasEnProgreso.map(async (rutinaProg) => {
          const rutinaCompleta = await getRutinaDeepOrAi(
            rutinaProg.rutinaId,
            user.id
          );

          if (!rutinaCompleta) {
            // Si la rutina no se encuentra, terminarla automáticamente
            console.warn(
              `Rutina ${rutinaProg.rutinaId} no encontrada, marcando rutina en progreso como terminada`
            );
            try {
              await terminarRutinaEnProgreso(rutinaProg.id!);
            } catch (e) {
              console.error(
                `Error al terminar rutina en progreso ${rutinaProg.id}:`,
                e
              );
            }
            throw new Error(`Rutina ${rutinaProg.rutinaId} no encontrada`);
          }

          // Obtener todas las sesiones de workout de esta rutina
          const sessions = await getWorkoutSessionsDeRutina(rutinaProg.id!);

          // Calcular progreso basado en días completados
          const diasCompletados = sessions.length;
          const progress =
            rutinaCompleta.cantidadDias > 0
              ? (diasCompletados / rutinaCompleta.cantidadDias) * 100
              : 0;

          return {
            id: rutinaProg.id!,
            rutinaId: rutinaProg.rutinaId,
            rutinaCompleta,
            diaActual: rutinaProg.diaActual,
            totalDias: rutinaCompleta.cantidadDias,
            progress,
          };
        })
      );

      // Filtrar solo los resultados exitosos
      const rutinasConDetalles: RutinaConProgreso[] = resultados
        .filter(
          (resultado): resultado is PromiseFulfilledResult<RutinaConProgreso> =>
            resultado.status === "fulfilled"
        )
        .map((resultado) => resultado.value);

      // Ordenar por progreso descendente
      rutinasConDetalles.sort((a, b) => b.progress - a.progress);

      setRutinas(rutinasConDetalles);
    } catch (e) {
      console.error("Error al obtener rutinas en progreso:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      fetchRutinasEnProgreso();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  const handleStartWorkout = (rutinaEnProgresoId: string) => {
    if (editing) {
      toggleSelectRutina(rutinaEnProgresoId);
    } else {
      navigation.navigate("WorkoutDetail", { rutinaEnProgresoId });
    }
  };

  const toggleSelectRutina = (rutinaId: string) => {
    setSelectedRutinas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rutinaId)) {
        newSet.delete(rutinaId);
      } else {
        newSet.add(rutinaId);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    if (selectedRutinas.size === 0) return;

    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedRutinas).map((id) => terminarRutinaEnProgreso(id))
      );
      setSelectedRutinas(new Set());
      setEditing(false);
      await fetchRutinasEnProgreso();
    } catch (e) {
      console.error("Error al eliminar rutinas:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <LinearGradient
          colors={["#0e0f13", "#11141a", "#161a22"]}
          style={styles.gradient}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#11141a", "#161a22"]}
        style={styles.gradient}
      />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={{ width: 40 }} />
        <Text style={styles.brand}>FITxTEC</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Workouts</Text>
          <Text style={styles.headerSubtitle}>
            Continúa tus entrenos en progreso
          </Text>
        </View>

        {/* Edit Controls */}
        {rutinas.length > 0 && (
          <View style={styles.editControls}>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Ionicons
                name={editing ? "close" : "create-outline"}
                size={24}
                color="#7EE300"
              />
            </TouchableOpacity>
            {editing && selectedRutinas.size > 0 && (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color="#ff4444" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Empty State */}
        {rutinas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={64} color="#888" />
            <Text style={styles.emptyTitle}>No tienes rutinas en progreso</Text>
            <Text style={styles.emptyMessage}>
              Guarda rutinas desde la sección de Rutinas y comienza a
              entrenarlas
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => tabNavigation.navigate("Routines")}
            >
              <Text style={styles.buttonText}>Ver Rutinas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.routinesContainer}>
            {rutinas.map((rutina) => {
              const isSelected = selectedRutinas.has(rutina.id);
              return (
                <TouchableOpacity
                  key={rutina.id}
                  style={[
                    styles.routineCard,
                    editing &&
                      isSelected && {
                        borderColor: colors.primary,
                        borderWidth: 2,
                      },
                  ]}
                  onPress={() => handleStartWorkout(rutina.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.routineHeader}>
                    {editing && (
                      <Ionicons
                        name={
                          isSelected ? "checkmark-circle" : "ellipse-outline"
                        }
                        size={24}
                        color={isSelected ? colors.primary : "#888"}
                      />
                    )}
                    <View style={styles.routineTitleContainer}>
                      <Text style={styles.routineName}>
                        {rutina.rutinaCompleta.nombre}
                      </Text>
                      <Text style={styles.routineMeta}>
                        {rutina.rutinaCompleta.tiempoAproximado} •{" "}
                        {rutina.rutinaCompleta.nivelDificultad}
                      </Text>
                    </View>
                    {!editing && (
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color={colors.primary}
                      />
                    )}
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${rutina.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {rutina.progress.toFixed(0)}% completado
                    </Text>
                  </View>

                  {/* Day Info */}
                  <View style={styles.dayContainer}>
                    <View style={styles.dayBadge}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.primary}
                      />
                      <Text style={styles.dayText}>
                        Día {rutina.diaActual} de {rutina.totalDias}
                      </Text>
                    </View>
                    <View style={styles.activeBadge}>
                      <View style={styles.activeDot} />
                      <Text style={styles.activeText}>En Progreso</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
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
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  brand: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888",
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#888",
  },
  editControls: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginTop: 24,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  routinesContainer: {
    gap: 16,
  },
  routineCard: {
    backgroundColor: "#1a1d24",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  routineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  routineTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  routineName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  routineMeta: {
    fontSize: 14,
    color: "#888",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#25282f",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#888",
  },
  dayContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dayText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(126, 227, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  activeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
});
