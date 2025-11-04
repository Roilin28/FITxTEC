import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
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
import { getRutinaDeepOrAi } from "../services/Routines";
import {
  formatLocalDate,
  getTodayLocal,
  parseLocalDate,
} from "../services/dateUtils";
import { getEstadisticasUsuario } from "../services/workout";

type RootStackParamList = {
  HomeMain: undefined;
  Calendar: undefined;
  Settings: undefined;
};

type TabParamList = {
  Home: undefined;
  Routines: undefined;
  Workout: {
    screen?: string;
    params?: { rutinaEnProgresoId: string };
  };
  Progress: undefined;
  Profile: undefined;
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
  const [weeklyStats, setWeeklyStats] = useState({
    totalTime: 0, // minutos
    totalVolume: 0,
  });
  const [currentStreak, setCurrentStreak] = useState(0);

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

  // === Obtener datos ===
  const fetchData = React.useCallback(async () => {
    // === Extraer número de días de entrenamiento del string del usuario ===
    const getWorkoutsPerWeekFromUser = (): number => {
      if (!user?.workoutsPorSemana) return 3; // Default

      const match = user.workoutsPorSemana.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 3;
    };

    // === Determinar si un día es de descanso ===
    const isRestDay = (dayIndex: number, workoutsPerWeek?: number) => {
      // Si no se especifica, usar la preferencia del usuario
      const targetWorkouts = workoutsPerWeek ?? getWorkoutsPerWeekFromUser();

      if (targetWorkouts === 1) {
        // 1 día: solo lunes
        return dayIndex !== 1;
      } else if (targetWorkouts === 2) {
        // 2 días: lunes y jueves
        return dayIndex !== 1 && dayIndex !== 4;
      } else if (targetWorkouts === 3) {
        // 3 días: lunes, miércoles, viernes
        return dayIndex !== 1 && dayIndex !== 3 && dayIndex !== 5;
      } else if (targetWorkouts === 4) {
        // 4 días: lunes, martes, jueves, viernes
        return (
          dayIndex !== 1 && dayIndex !== 2 && dayIndex !== 4 && dayIndex !== 5
        );
      } else if (targetWorkouts === 5) {
        // 5 días: lunes a viernes
        return dayIndex === 0 || dayIndex === 6;
      } else if (targetWorkouts === 6) {
        // 6 días: todos excepto domingo
        return dayIndex === 0;
      }

      // Default: solo domingo de descanso
      return dayIndex === 0;
    };
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
        // Usar getRutinaDeepOrAi para buscar en ambas colecciones (normal o AI)
        rutinaData = await getRutinaDeepOrAi(primeraRutina.rutinaId, user.id);
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
      const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      const todayStr = getTodayLocal();
      const todayDate = parseLocalDate(todayStr);

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekRange.monday);
        currentDate.setDate(weekRange.monday.getDate() + i);
        const dateString = formatLocalDate(currentDate);
        const dayOfWeek = currentDate.getDay();
        const dayName = dayNames[i];

        const workoutForDay = weeklyData.find((w) => w.fecha === dateString);

        const currentDateParsed = parseLocalDate(dateString);
        const isPastDay = currentDateParsed < todayDate;
        // Usar cantidadDias de la rutina si existe, sino usar preferencia del usuario
        const workoutsPerWeek =
          rutinaData?.cantidadDias || getWorkoutsPerWeekFromUser();
        const isRest = isRestDay(dayOfWeek, workoutsPerWeek);

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

      // Usar cantidadDias de la rutina si existe, sino usar preferencia del usuario
      const workoutsPerWeek =
        rutinaData?.cantidadDias || getWorkoutsPerWeekFromUser();

      // Contar días de entrenamiento en la semana
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekRange.monday);
        currentDate.setDate(weekRange.monday.getDate() + i);
        const dayOfWeek = currentDate.getDay();
        if (!isRestDay(dayOfWeek, workoutsPerWeek)) {
          expectedWorkouts++;
        }
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

      // Obtener estadísticas semanales
      try {
        const stats = await getEstadisticasUsuario(
          user.id,
          weekRange.inicio,
          weekRange.fin
        );
        setWeeklyStats({
          totalTime: stats.tiempoTotal,
          totalVolume: stats.volumenTotal,
        });
      } catch (e) {
        console.error("Error al obtener estadísticas semanales:", e);
      }

      // Calcular racha actual (días consecutivos con workout)
      // Solo verificamos en los datos semanales que ya tenemos para evitar llamadas adicionales
      let streak = 0;
      let streakDate = new Date(todayDate);

      // Verificar días hacia atrás desde hoy (máximo 30 días)
      for (let i = 0; i < 30; i++) {
        const dateStr = formatLocalDate(streakDate);
        const hasWorkout = weeklyData.some((w) => w.fecha === dateStr);

        if (hasWorkout) {
          streak++;
          streakDate.setDate(streakDate.getDate() - 1);
        } else {
          // Si el día está en el futuro, no rompe la racha
          const dateParsed = parseLocalDate(dateStr);
          if (dateParsed > todayDate) {
            streakDate.setDate(streakDate.getDate() - 1);
            continue;
          }
          break;
        }
      }
      setCurrentStreak(streak);
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
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={28} color="#ffffff" />
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
              ¿Listo para alcanzar tus objetivos hoy?
            </Text>
          </View>
        </MotiView>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#f5b342" />
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Racha de Días</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#7EE300" />
              <Text style={styles.statValue}>
                {weeklyProgress.completed}/{weeklyProgress.total}
              </Text>
              <Text style={styles.statLabel}>Esta Semana</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#60a5fa" />
              <Text style={styles.statValue}>
                {Math.round(weeklyStats.totalTime)}m
              </Text>
              <Text style={styles.statLabel}>Tiempo</Text>
            </View>
          </View>
          {weeklyProgress.total > 0 && (
            <View style={styles.progressRow}>
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${weeklyProgress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(weeklyProgress.percentage)}%
              </Text>
            </View>
          )}
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
            <Text style={styles.aiTitle}>Recomendación de IA</Text>
            <Text style={styles.aiText}>
              Agrega 5 min de calentamiento para activar mejor tus músculos.
            </Text>
          </View>
        </MotiView>

        {/* Weekly Workouts */}
        <View style={styles.daysSection}>
          <Text style={styles.sectionTitle}>Entrenamientos Semanales</Text>
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
              : ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
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
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&fm=jpg&fit=crop&grayscale",
          }}
          style={styles.workoutContainer}
          imageStyle={styles.workoutBackgroundImage}
          resizeMode="cover"
        >
          <View style={styles.workoutOverlay} />
          <View style={styles.workoutContent}>
            <View style={styles.header}>
              <Ionicons name="calendar-outline" size={22} color="#7EE300" />
              <Text style={styles.headerText}>Entrenamiento de Hoy</Text>
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
                  <Text
                    style={[styles.subtitle, { marginTop: 4, opacity: 0.8 }]}
                  >
                    Progreso: Día {activeRutinaEnProgreso.diaActual} de{" "}
                    {rutina.cantidadDias}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() => {
                    if (activeRutinaEnProgreso?.id) {
                      tabNavigation.navigate("Workout", {
                        screen: "WorkoutDetail",
                        params: {
                          rutinaEnProgresoId: activeRutinaEnProgreso.id,
                        },
                      });
                    }
                  }}
                >
                  <Text style={styles.startButtonText}>
                    {activeRutinaEnProgreso.diaActual
                      ? "Continuar Entrenamiento"
                      : "Iniciar Entrenamiento"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => tabNavigation.navigate("Workout" as any)}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Cambiar Rutina
                    </Text>
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
                  onPress={() => tabNavigation.navigate("Routines")}
                >
                  <Text style={styles.startButtonText}>Elegir Rutina</Text>
                </TouchableOpacity>

                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => tabNavigation.navigate("Workout" as any)}
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
        </ImageBackground>
      </ScrollView>
    </SafeAreaView>
  );
}

export default HomeScreen;
