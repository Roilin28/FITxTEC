import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import ExerciseCard from "../../components/ExerciseCard";

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header “pill” verde */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Ionicons name="chevron-back" size={20} color={"#0b0f0a"} />
          <Text style={styles.headerTitle}>Push Day - Upper Body</Text>
        </View>
        <Text style={styles.headerSub}>3 exercises • 45 min</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
      >
        <ExerciseCard title="Bench Press" sets={3} restSec={180} />
        <ExerciseCard title="Incline Dumbbell Press" sets={3} restSec={120} />
        <ExerciseCard title="Seated Rows" sets={3} restSec={90} />
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <View style={styles.finishBtn}>
          <Text style={styles.finishText}>Finish Workout</Text>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    margin: 14,
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 14,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#0b0f0a", fontWeight: "800", fontSize: 16 },
  headerSub: { color: "#0b0f0a", marginTop: 4, opacity: 0.8 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    backgroundColor: "transparent",
  },
  finishBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  finishText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
});
