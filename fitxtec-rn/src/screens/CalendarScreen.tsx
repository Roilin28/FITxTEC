import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { calendarStyles as styles } from "../theme/calendarStyles";
import { useAuth } from "../services/AuthContext";
import { getWorkoutSessionsPorFecha } from "../services/rutinasEnProgreso";
import {
  getTodayLocal,
  formatLocalDate,
  isSameDay,
  parseLocalDate,
} from "../services/dateUtils";

export default function CalendarScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const today = new Date();

  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLocal());
  const [workouts, setWorkouts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();

  const fetchMonthWorkouts = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date(displayYear, displayMonth, 1);
      const endDate = new Date(displayYear, displayMonth + 1, 0);

      const startString = formatLocalDate(startDate);
      const endString = formatLocalDate(endDate);

      const monthWorkouts = await getWorkoutSessionsPorFecha(
        user.id,
        startString,
        endString
      );

      // Convertir a un objeto indexado por fecha
      const workoutsByDate: Record<string, any> = {};
      monthWorkouts.forEach((workout) => {
        if (workout.fecha) {
          workoutsByDate[workout.fecha] = workout;
        }
      });

      setWorkouts(workoutsByDate);
    } catch (e) {
      console.error("Error al obtener workouts del mes:", e);
    } finally {
      setLoading(false);
    }
  }, [user, displayMonth, displayYear]);

  useEffect(() => {
    fetchMonthWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, displayMonth, displayYear]);

  // Refrescar cuando la pantalla obtiene el foco
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchMonthWorkouts();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const selectedWorkout = workouts[selectedDate];

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#11141a", "#161a22"]}
        style={styles.gradient}
      />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.brand}>FITxTEC</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Calendar</Text>
          <Text style={styles.headerSubtitle}>
            Tap a date to review your performance
          </Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newMonth = displayMonth === 0 ? 11 : displayMonth - 1;
              const newYear =
                displayMonth === 0 ? displayYear - 1 : displayYear;
              setDisplayMonth(newMonth);
              setDisplayYear(newYear);
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#7EE300" />
          </TouchableOpacity>

          <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>
              {new Date(displayYear, displayMonth).toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newMonth = displayMonth === 11 ? 0 : displayMonth + 1;
              const newYear =
                displayMonth === 11 ? displayYear + 1 : displayYear;
              setDisplayMonth(newMonth);
              setDisplayYear(newYear);
            }}
          >
            <Ionicons name="chevron-forward" size={24} color="#7EE300" />
          </TouchableOpacity>
        </View>

        {/* Calendar Month */}
        <View style={styles.calendar}>
          {loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#7EE300" />
            </View>
          ) : (
            days.map((day) => {
              const date = `${displayYear}-${String(displayMonth + 1).padStart(
                2,
                "0"
              )}-${day.toString().padStart(2, "0")}`;
              const completed = !!workouts[date];
              const selected = selectedDate === date;
              const isToday = isSameDay(date, getTodayLocal());
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayBox,
                    completed && styles.dayCompleted,
                    selected && styles.daySelected,
                    isToday && styles.dayToday,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[styles.dayText, isToday && styles.dayTodayText]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Selected Day Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>
            {parseLocalDate(selectedDate).toLocaleDateString("es-ES", {
              month: "short",
              day: "numeric",
            })}
          </Text>

          {selectedWorkout ? (
            <>
              <View style={styles.summaryHeader}>
                <Ionicons name="checkmark-circle" size={22} color="#7EE300" />
                <Text style={styles.summaryText}>Workout Completed</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Ionicons name="barbell-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {selectedWorkout.volumen || 0} kg
                  </Text>
                  <Text style={styles.statLabel}>Total Volume</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="flame-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {selectedWorkout.calorias || 0}
                  </Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="time-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {selectedWorkout.duracion
                      ? `${selectedWorkout.duracion} min`
                      : "N/A"}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              </View>

              {/* Exercises List */}
              {selectedWorkout.ejercicios &&
                selectedWorkout.ejercicios.length > 0 && (
                  <View style={styles.exercisesSection}>
                    <Text style={styles.sectionTitle}>Exercises</Text>
                    {selectedWorkout.ejercicios.map((ej: any, i: number) => {
                      const totalSeries = ej.series?.length || 0;
                      const completedSeries =
                        ej.series?.filter((s: any) => s.done).length || 0;
                      const avgReps =
                        ej.series?.reduce(
                          (sum: number, s: any) => sum + s.reps,
                          0
                        ) / totalSeries || 0;
                      const avgWeight =
                        ej.series?.reduce(
                          (sum: number, s: any) => sum + s.weight,
                          0
                        ) / totalSeries || 0;

                      return (
                        <View key={i} style={styles.exerciseRow}>
                          <View>
                            <Text style={styles.exerciseName}>{ej.nombre}</Text>
                            <Text style={styles.exerciseSub}>
                              {completedSeries}/{totalSeries} sets •{" "}
                              {Math.round(avgReps)} reps •{" "}
                              {Math.round(avgWeight)}kg avg
                            </Text>
                          </View>
                          <Ionicons
                            name="checkmark-done-outline"
                            size={18}
                            color="#7EE300"
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
            </>
          ) : (
            <View style={styles.noWorkoutBox}>
              <Ionicons name="close-circle-outline" size={40} color="#888" />
              <Text style={styles.noWorkoutText}>
                No training recorded for this day.
              </Text>
              <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add-outline" size={18} color="#000" />
                <Text style={styles.addBtnText}>Add Workout</Text>
              </TouchableOpacity>
            </View>
          )}
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
