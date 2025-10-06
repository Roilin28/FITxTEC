import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import colors from "../src/theme/color";

type SetData = {
  set: number;
  reps: number;
  weight: number;
  rpe: number;
  done: boolean;
};

type Props = {
  title: string;
  sets: number;
  restSec?: number;
};

const ROW_H = 44;

export default function ExerciseCard({ title, sets, restSec = 120 }: Props) {
  const [rows, setRows] = useState<SetData[]>(
    Array.from({ length: sets }, (_, i) => ({
      set: i + 1,
      reps: 8,
      weight: 40,
      rpe: 7,
      done: false,
    }))
  );

  const completed = useMemo(() => rows.filter((r) => r.done).length, [rows]);

  const bump = (idx: number, key: "reps" | "weight", delta: number) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, [key]: Math.max(0, (r as any)[key] + delta) } : r
      )
    );
  };

  const toggleDone = (idx: number) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, done: !r.done } : r))
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {completed}/{sets} sets
          </Text>
        </View>
      </View>

      {/* Table header */}
      <View style={styles.tableHead}>
        <Text style={[styles.th, { flex: 0.7 }]}>Set</Text>
        <Text style={styles.th}>Reps</Text>
        <Text style={styles.th}>Weight</Text>
        <Text style={styles.th}>RPE</Text>
        <Text style={[styles.th, { flex: 0.7 }]}>Done</Text>
      </View>

      {/* Rows */}
      {rows.map((r, i) => (
        <View key={i} style={[styles.row, r.done && styles.rowDone]}>
          {/* Set */}
          <View style={[styles.cell, { flex: 0.7 }]}>
            <Text style={styles.setPill}>{r.set}</Text>
          </View>

          {/* Reps counter */}
          <View style={styles.cell}>
            <Counter
              value={r.reps}
              onMinus={() => bump(i, "reps", -1)}
              onPlus={() => bump(i, "reps", +1)}
            />
          </View>

          {/* Weight counter */}
          <View style={styles.cell}>
            <Counter
              value={r.weight}
              onMinus={() => bump(i, "weight", -2.5)}
              onPlus={() => bump(i, "weight", +2.5)}
            />
          </View>

          {/* RPE slider */}
          <View style={[styles.cell, { minWidth: 100 }]}>
            <View style={styles.rpeRow}>
              <Text style={styles.rpeValue}>{r.rpe}</Text>
              <Slider
                style={{ flex: 1 }}
                minimumValue={6}
                maximumValue={10}
                step={1}
                value={r.rpe}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={"#333846"}
                thumbTintColor={colors.primary}
                onValueChange={(v: any) =>
                  setRows((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, rpe: v } : x))
                  )
                }
              />
            </View>
          </View>

          {/* Done */}
          <View style={[styles.cell, { flex: 0.7, alignItems: "flex-end" }]}>
            <TouchableOpacity
              onPress={() => toggleDone(i)}
              style={[styles.doneBtn, r.done && styles.doneBtnOn]}
              activeOpacity={0.9}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color={r.done ? "#0b0f0a" : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Rest info */}
      <View style={styles.restRow}>
        <Ionicons name="time-outline" color={colors.textMuted} size={16} />
        <Text style={styles.restText}> Rest: {restSec}s</Text>
      </View>
    </View>
  );
}

function Counter({
  value,
  onMinus,
  onPlus,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <View style={counterStyles.wrap}>
      <RoundBtn icon="remove" onPress={onMinus} />
      <Text style={counterStyles.value}>
        {Number.isInteger(value) ? value : value.toFixed(1)}
      </Text>
      <RoundBtn icon="add" onPress={onPlus} />
    </View>
  );
}

function RoundBtn({
  icon,
  onPress,
}: {
  icon: "add" | "remove";
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={counterStyles.btn}
    >
      <Ionicons
        name={icon === "add" ? "add" : "remove"}
        size={18}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { color: colors.text, fontSize: 16, fontWeight: "700" },
  badge: {
    backgroundColor: "#0f1118",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: { color: colors.textMuted, fontSize: 12 },

  tableHead: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 6,
  },
  th: { flex: 1, color: colors.textMuted, fontSize: 12 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    paddingHorizontal: 6,
    marginVertical: 4,
    backgroundColor: "#10131a",
  },
  rowDone: { backgroundColor: "#1d2a10" },

  cell: { flex: 1, paddingHorizontal: 4 },

  setPill: {
    backgroundColor: "#222632",
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    overflow: "hidden",
  },

  rpeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rpeValue: { color: colors.text, width: 16, textAlign: "center" },

  doneBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f1118",
  },
  doneBtnOn: { backgroundColor: colors.primary, borderColor: colors.primary },

  restRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  restText: { color: colors.textMuted, marginLeft: 6 },
});

const counterStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1118",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    height: ROW_H - 8,
    paddingHorizontal: 6,
    justifyContent: "space-between",
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#1a1e29",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    color: colors.text,
    minWidth: 28,
    textAlign: "center",
    fontWeight: "600",
  },
});
