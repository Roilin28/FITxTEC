import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { calendarStyles as styles } from "../theme/calendarStyles";

type WorkoutDay = {
  date: string;
  completed: boolean;
  type?: string;
  duration?: string;
  volume?: number; // total kg
  calories?: number;
  exercises?: { name: string; sets: number; reps: number; weight: number }[];
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string>("2025-10-05");

  // Simulación de datos del mes
  const mockData: WorkoutDay[] = [
    {
      date: "2025-10-01",
      completed: true,
      type: "Full Body",
      duration: "55 min",
      volume: 6250,
      calories: 410,
      exercises: [
        { name: "Squats", sets: 3, reps: 10, weight: 80 },
        { name: "Bench Press", sets: 3, reps: 10, weight: 50 },
        { name: "Deadlift", sets: 3, reps: 8, weight: 90 },
      ],
    },
    {
      date: "2025-10-03",
      completed: true,
      type: "Push Day - Upper Body",
      duration: "48 min",
      volume: 5200,
      calories: 375,
      exercises: [
        { name: "Bench Press", sets: 4, reps: 8, weight: 60 },
        { name: "Overhead Press", sets: 3, reps: 10, weight: 35 },
        { name: "Dips", sets: 3, reps: 12, weight: 0 },
      ],
    },
    {
      date: "2025-10-05",
      completed: false,
    },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const selectedWorkout = mockData.find((d) => d.date === selectedDate);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#11141a", "#161a22"]}
        style={styles.gradient}
      />

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backBtn}>
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

        {/* Calendar Month */}
        <View style={styles.calendar}>
          {days.map((day) => {
            const date = `2025-10-${day.toString().padStart(2, "0")}`;
            const completed = mockData.some(
              (d) => d.date === date && d.completed
            );
            const selected = selectedDate === date;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayBox,
                  completed && styles.dayCompleted,
                  selected && styles.daySelected,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={styles.dayText}>{day}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Day Summary */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.summaryCard}
        >
          <Text style={styles.summaryTitle}>
            {selectedDate.replace("2025-", "Oct ")}
          </Text>

          {selectedWorkout?.completed ? (
            <>
              <View style={styles.summaryHeader}>
                <Ionicons name="checkmark-circle" size={22} color="#7EE300" />
                <Text style={styles.summaryText}>Workout Completed</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Ionicons name="barbell-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {selectedWorkout.volume} kg
                  </Text>
                  <Text style={styles.statLabel}>Total Volume</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="flame-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {selectedWorkout.calories}
                  </Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons name="time-outline" size={20} color="#fff" />
                  <Text style={styles.statValue}>
                    {selectedWorkout.duration}
                  </Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              </View>

              {/* Exercises List */}
              <View style={styles.exercisesSection}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                {selectedWorkout.exercises?.map((ex, i) => (
                  <View key={i} style={styles.exerciseRow}>
                    <View>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseSub}>
                        {ex.sets}×{ex.reps} • {ex.weight}kg
                      </Text>
                    </View>
                    <Ionicons
                      name="checkmark-done-outline"
                      size={18}
                      color="#7EE300"
                    />
                  </View>
                ))}
              </View>
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
