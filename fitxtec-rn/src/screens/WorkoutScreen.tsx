import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import ExerciseCard from "../../components/ExerciseCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getRutinaDeepOrAi,
  RutinaCompleta,
  DiaRutina,
} from "../services/Routines";
import { useAuth } from "../services/AuthContext";
import {
  getRutinaEnProgreso,
  crearWorkoutSession,
  avanzarDiaRutina,
  EjercicioWorkout,
} from "../services/rutinasEnProgreso";
import { local_Notification_Finish_Workout } from "../services/notifications";

type RootStackParamList = {
  WorkoutMain: undefined;
  WorkoutDetail: { rutinaEnProgresoId: string };
};

export default function WorkoutScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { user } = useAuth();
  const routeParams = route.params as
    | { rutinaEnProgresoId: string }
    | undefined;
  const rutinaEnProgresoId = routeParams?.rutinaEnProgresoId;

  const [rutina, setRutina] = useState<RutinaCompleta | null>(null);
  const [rutinaEnProgreso, setRutinaEnProgreso] = useState<any>(null);
  const [diaActual, setDiaActual] = useState<DiaRutina | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  // Estado para almacenar los datos de cada ejercicio
  const [exerciseData, setExerciseData] = useState<
    Record<
      string,
      { set: number; reps: number; weight: number; done: boolean }[]
    >
  >({});
  const [inicioTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!rutinaEnProgresoId) {
          setError("NO_WORKOUT");
          setLoading(false);
          return;
        }

        if (!user) {
          setError("NO_USER");
          setLoading(false);
          return;
        }

        // Obtener la rutina en progreso
        const rutinaProg = await getRutinaEnProgreso(rutinaEnProgresoId);
        if (!rutinaProg) {
          setError("NOT_FOUND");
          setLoading(false);
          return;
        }

        setRutinaEnProgreso(rutinaProg);

        // Obtener los detalles completos de la rutina (busca en ambas colecciones)
        const data = await getRutinaDeepOrAi(rutinaProg.rutinaId, user.id);
        if (!data) {
          setError("NOT_FOUND");
          setLoading(false);
          return;
        }

        setRutina(data);

        // Obtener el día actual de la rutina
        const currentDay = rutinaProg.diaActual;
        const dia = data.dias.find((d) => d.id === currentDay?.toString());

        if (dia) {
          setDiaActual(dia);
          // Limpiar datos de ejercicios al cambiar de día
          setExerciseData({});
        } else {
          setError("NO_DAY");
        }
      } catch (e) {
        console.error("Error al obtener datos:", e);
        setError("ERROR");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [rutinaEnProgresoId, user]);

  const handleCompleteDay = async () => {
    if (!rutinaEnProgresoId || !rutina || !user || !diaActual) return;

    setCompleting(true);
    try {
      // Recopilar datos reales de ejercicios desde el estado
      const ejercicios: EjercicioWorkout[] = (diaActual.ejercicios || []).map(
        (ej) => {
          const ejercicioId = ej.id || ej.nombre;
          const datosEjercicio = exerciseData[ejercicioId];

          // Si hay datos guardados, usarlos con todos los campos; si no, usar valores por defecto
          const series =
            datosEjercicio && datosEjercicio.length > 0
              ? datosEjercicio.map((s, idx) => ({
                  set: idx + 1,
                  reps: s.reps || 8,
                  weight: s.weight || 40,
                  done: s.done || false,
                  restTime: 90, // Tiempo de descanso por defecto
                }))
              : Array.from({ length: ej.series }, (_, i) => ({
                  set: i + 1,
                  reps: 8,
                  weight: 40,
                  done: false,
                  restTime: 90,
                }));

          return {
            nombre: ej.nombre,
            series: series,
          };
        }
      );

      // Calcular duración desde inicioTimestamp
      const duracion = inicioTimestamp
        ? Math.round((Date.now() - inicioTimestamp) / 1000 / 60)
        : undefined;

      // Crear la sesión de workout
      await crearWorkoutSession(
        rutinaEnProgresoId,
        user.id,
        rutinaEnProgreso.diaActual,
        ejercicios,
        duracion
      );

      // Avanzar al siguiente día
      const result = await avanzarDiaRutina(rutinaEnProgresoId);

      // Después de completar, volver para refrescar datos
      if (result.terminada) {
        Alert.alert("¡Felicidades!", "Has completado toda la rutina.", [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("WorkoutMain");
            },
          },
        ]);
        local_Notification_Finish_Workout();
      } else {
        Alert.alert(
          "¡Día completado!",
          "Has completado este día exitosamente.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("WorkoutMain");
              },
            },
          ]
        );
      }
    } catch (e) {
      console.error("Error al completar día:", e);
      Alert.alert("Error", "No se pudo completar el día. Intenta de nuevo.");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Mostrar mensaje si no hay rutina activa
  if (error === "NO_WORKOUT" || !rutina) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("WorkoutMain")}
          >
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.brand}>FITxTEC</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons
            name="barbell-outline"
            size={80}
            color={colors.primary}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>No hay rutina activa</Text>
          <Text style={styles.emptyMessage}>
            No tienes una rutina en progreso. {"\n"}
            Selecciona una rutina para comenzar tu entrenamiento.
          </Text>
          <TouchableOpacity
            style={styles.goToRoutinesButton}
            onPress={() => navigation.navigate("WorkoutMain")}
          >
            <Ionicons
              name="arrow-back-outline"
              size={20}
              color={colors.primaryText}
            />
            <Text style={styles.goToRoutinesText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (error === "NOT_FOUND") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("WorkoutMain")}
          >
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.brand}>FITxTEC</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Rutina no encontrada.</Text>
          <TouchableOpacity
            style={styles.goToRoutinesButton}
            onPress={() => navigation.navigate("WorkoutMain")}
          >
            <Ionicons
              name="arrow-back-outline"
              size={20}
              color={colors.primaryText}
            />
            <Text style={styles.goToRoutinesText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("WorkoutMain")}
        >
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.brand}>FITxTEC</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.workoutTitle}>{rutina.nombre}</Text>
          <Text style={styles.dayIndicator}>
            Día {rutinaEnProgreso?.diaActual || 1} de {rutina.cantidadDias}
          </Text>
        </View>

        {/* Day Info */}
        <View style={styles.dayCard}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <Text style={styles.dayName}>
            {diaActual?.nombre || "Día Actual"}
          </Text>
        </View>

        {/* Exercises */}
        {diaActual?.ejercicios && diaActual.ejercicios.length > 0 ? (
          <View style={styles.exercisesContainer}>
            {diaActual.ejercicios.map((ejercicio, index) => (
              <ExerciseCard
                key={ejercicio.id || ejercicio.nombre || index}
                title={ejercicio.nombre}
                sets={ejercicio.series}
                restSec={120}
                initialData={exerciseData[ejercicio.id || ejercicio.nombre]}
                onDataChange={(data) => {
                  setExerciseData((prev) => ({
                    ...prev,
                    [ejercicio.id || ejercicio.nombre]: data,
                  }));
                }}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyExercises}>
            <Ionicons name="barbell-outline" size={48} color="#888" />
            <Text style={styles.emptyExercisesText}>
              No hay ejercicios para este día
            </Text>
          </View>
        )}

        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            completing && styles.completeButtonDisabled,
          ]}
          onPress={handleCompleteDay}
          disabled={completing}
        >
          {completing ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <>
              <Text style={styles.completeButtonText}>Completar Día</Text>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.primaryText}
              />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
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
  profileBtn: {
    padding: 4,
  },
  header: {
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  dayIndicator: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1d24",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  exercisesContainer: {
    gap: 16,
  },
  emptyExercises: {
    alignItems: "center",
    padding: 40,
  },
  emptyExercisesText: {
    color: "#888",
    fontSize: 16,
    marginTop: 16,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 24,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 32,
  },
  goToRoutinesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  goToRoutinesText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "#ff5a5f",
    marginBottom: 24,
  },
});
