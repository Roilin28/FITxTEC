import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MotiView } from "moti";
import styles from "../theme/homeStyles";
import { useAuth } from "../services/AuthContext";
import {
  getRutinasEnProgreso,
  getWorkoutSessionsPorFecha,
} from "../services/rutinasEnProgreso";
import { getRutina } from "../services/Routines";
import {
  formatLocalDate,
  getTodayLocal,
  parseLocalDate,
} from "../services/dateUtils";

type RootStackParamList = {
  HomeMain: undefined;
  Calendar: undefined;
};

type TabParamList = {
  HomeTab: undefined;
  RoutinesTab: undefined;
  WorkoutTab: {
    screen?: string;
    params?: { rutinaEnProgresoId: string };
  };
  ProgressTab: undefined;
  ProfileTab: undefined;
};

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { user } = useAuth();
  const [activeRutinaEnProgreso, setActiveRutinaEnProgreso] =
    useState<any>(null);
  const [rutina, setRutina] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<
    {
      day: string;
      date: string;
      status: "done" | "pending" | "rest";
      workout?: any;
    }[]
  >([]);
  const [weeklyProgress, setWeeklyProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });

  // === Obtener rango semanal (lunes a domingo) ===
  const getWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      inicio: formatLocalDate(monday),
      fin: formatLocalDate(sunday),
      monday,
      sunday,
    };
  };

  // === Determinar si un día es de descanso ===
  const isRestDay = (dayIndex: number, rutinaData: any) => {
    if (!rutinaData || !rutinaData.dias) return true;

    const workoutsPerWeek = rutinaData.cantidadDias || 0;

    if (workoutsPerWeek === 3) {
      return dayIndex !== 1 && dayIndex !== 3 && dayIndex !== 5;
    } else if (workoutsPerWeek === 4) {
      return (
        dayIndex !== 1 && dayIndex !== 2 && dayIndex !== 4 && dayIndex !== 5
      );
    } else if (workoutsPerWeek === 5) {
      return dayIndex === 0 || dayIndex === 6;
    } else if (workoutsPerWeek === 6) {
      return dayIndex === 0;
    }

    return dayIndex === 0;
  };

  // === Obtener datos ===
  const fetchData = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Obtener rutinas en progreso y tomar la primera
      const rutinasEnProgreso = await getRutinasEnProgreso(user.id);
      const primeraRutina =
        rutinasEnProgreso.length > 0 ? rutinasEnProgreso[0] : null;
      setActiveRutinaEnProgreso(primeraRutina);

      let rutinaData = null;
      if (primeraRutina) {
        rutinaData = await getRutina(primeraRutina.rutinaId);
        setRutina(rutinaData);
      } else {
        setRutina(null);
      }

      // Obtener rango semanal
      const weekRange = getWeekRange();
      let weeklyData: any[] = [];

      try {
        weeklyData = await getWorkoutSessionsPorFecha(
          user.id,
          weekRange.inicio,
          weekRange.fin
        );
      } catch (e: any) {
        console.error("Error al obtener workouts de la semana:", e);
        weeklyData = [];
      }

      // Construir arreglo de días con lógica mejorada
      const daysOfWeek: {
        day: string;
        date: string;
        status: "done" | "pending" | "rest";
        workout?: any;
      }[] = [];
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const today = getTodayLocal();
      const todayDate = parseLocalDate(today);

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekRange.monday);
        currentDate.setDate(weekRange.monday.getDate() + i);
        const dateString = formatLocalDate(currentDate);
        const dayOfWeek = currentDate.getDay();
        const dayName = dayNames[i];

        const workoutForDay = weeklyData.find((w) => w.fecha === dateString);

        const currentDateParsed = parseLocalDate(dateString);
        const isPastDay = currentDateParsed < todayDate;
        const isRest = rutinaData ? isRestDay(dayOfWeek, rutinaData) : false;

        let status: "done" | "pending" | "rest" = "pending";

        if (workoutForDay) {
          // Si hay workout completado
          status = "done";
        } else if (isRest && isPastDay) {
          // Si ya pasó y era día de descanso
          status = "rest";
        } else if (!isRest && isPastDay) {
          // Si ya pasó y NO era día de descanso (debería haber hecho workout)
          status = "rest"; // Marcar como descanso perdido
        } else if (isRest) {
          // Si es día de descanso futuro
          status = "rest";
        } else {
          // Si aún no ha pasado y no es día de descanso
          status = "pending";
        }

        daysOfWeek.push({
          day: dayName,
          date: dateString,
          status,
          workout: workoutForDay || undefined,
        });
      }

      setWeeklyWorkouts(daysOfWeek);

      // Calcular progreso semanal
      const completedWorkouts = weeklyData;
      let expectedWorkouts = 0;

      if (rutinaData && rutinaData.cantidadDias) {
        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(weekRange.monday);
          currentDate.setDate(weekRange.monday.getDate() + i);
          const dayOfWeek = currentDate.getDay();
          if (!isRestDay(dayOfWeek, rutinaData)) expectedWorkouts++;
        }
      } else {
        expectedWorkouts = Math.max(completedWorkouts.length, 3);
      }

      const progressPercentage =
        expectedWorkouts > 0
          ? (completedWorkouts.length / expectedWorkouts) * 100
          : 0;

      setWeeklyProgress({
        completed: completedWorkouts.length,
        total: expectedWorkouts,
        percentage: Math.min(100, progressPercentage),
      });
    } catch (e) {
      console.error("Error al obtener datos:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // === Refrescar cuando la pantalla obtiene foco ===
  useFocusEffect(
    React.useCallback(() => {
      if (user) fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  // === Refrescar periódicamente ===
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // === Render principal ===
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#10131b", "#151820"]}
        style={styles.gradient}
      />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.brand}>FITxTEC</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => tabNavigation.navigate("ProfileTab")}
        >
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.hero}
        >
          <View>
            <Text style={styles.greeting}>
              {user?.nombre ? `Hola, ${user.nombre}` : "¡Hola!"}
            </Text>
            <Text style={styles.motivation}>
              Ready to crush your goals today?
            </Text>
          </View>
        </MotiView>

        {/* Weekly Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressFill,
                { width: `${weeklyProgress.percentage}%` },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {weeklyProgress.completed} of {weeklyProgress.total} workouts
            completed
          </Text>
        </View>

        {/* AI Recommendation */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.aiCard}
        >
          <Ionicons name="sparkles-outline" size={22} color="#7EE300" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.aiTitle}>AI Recommendation</Text>
            <Text style={styles.aiText}>
              Add 5 min of warm-up to boost your muscle activation.
            </Text>
          </View>
        </MotiView>

        {/* Weekly Workouts */}
        <View style={styles.daysSection}>
          <Text style={styles.sectionTitle}>Weekly Workouts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {weeklyWorkouts.length > 0
              ? weeklyWorkouts.map(({ day, status }, i) => {
                  let icon = "ellipse-outline";
                  let color = "#555";
                  let backgroundColor = "#1b1e27";

                  if (status === "done") {
                    icon = "checkmark-circle";
                    color = "#7EE300";
                    backgroundColor = "#182016";
                  } else if (status === "rest") {
                    icon = "bed-outline";
                    color = "#777";
                    backgroundColor = "#1a1d24";
                  } else if (status === "pending") {
                    icon = "time-outline";
                    color = "#f5b342";
                    backgroundColor = "#251f13";
                  }

                  return (
                    <View
                      key={i}
                      style={[
                        styles.dayCard,
                        { backgroundColor, borderColor: color + "33" },
                      ]}
                    >
                      <Text style={styles.dayText}>{day}</Text>
                      <Ionicons name={icon} size={22} color={color} />
                    </View>
                  );
                })
              : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dayCard,
                        { backgroundColor: "#1b1e27", borderColor: "#55533" },
                      ]}
                    >
                      <Text style={styles.dayText}>{day}</Text>
                      <Ionicons name="ellipse-outline" size={22} color="#555" />
                    </View>
                  )
                )}
          </ScrollView>
        </View>

        {/* Today's Workout */}
        <View style={styles.workoutContainer}>
          <View style={styles.header}>
            <Ionicons name="calendar-outline" size={22} color="#7EE300" />
            <Text style={styles.headerText}>Today&apos;s Workout</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="small"
              color="#7EE300"
              style={{ marginVertical: 20 }}
            />
          ) : activeRutinaEnProgreso && rutina ? (
            <>
              <Text style={styles.title}>
                {rutina.nombre}{" "}
                {activeRutinaEnProgreso.diaActual
                  ? `- Día ${activeRutinaEnProgreso.diaActual}`
                  : ""}
              </Text>
              <Text style={styles.subtitle}>
                {rutina.tiempoAproximado} • {rutina.nivelDificultad}
              </Text>
              {activeRutinaEnProgreso.diaActual && (
                <Text style={[styles.subtitle, { marginTop: 4, opacity: 0.8 }]}>
                  Progreso: Día {activeRutinaEnProgreso.diaActual} de{" "}
                  {rutina.cantidadDias}
                </Text>
              )}

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                  if (activeRutinaEnProgreso?.id) {
                    // Navigate to WorkoutTab first, then to WorkoutDetail
                    tabNavigation.navigate("WorkoutTab", {
                      screen: "WorkoutDetail",
                      params: { rutinaEnProgresoId: activeRutinaEnProgreso.id },
                    });
                  }
                }}
              >
                <Text style={styles.startButtonText}>
                  {activeRutinaEnProgreso.diaActual
                    ? "Continuar Workout"
                    : "Iniciar Workout"}
                </Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => tabNavigation.navigate("RoutinesTab")}
                >
                  <Text style={styles.secondaryButtonText}>Cambiar Rutina</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("Calendar")}
                >
                  <Ionicons name="calendar-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>No hay rutina activa</Text>
              <Text style={styles.subtitle}>
                Selecciona una rutina para comenzar
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={() => tabNavigation.navigate("RoutinesTab")}
              >
                <Text style={styles.startButtonText}>Elegir Rutina</Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => tabNavigation.navigate("RoutinesTab")}
                >
                  <Text style={styles.secondaryButtonText}>Ver Rutinas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate("Calendar")}
                >
                  <Ionicons name="calendar-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
