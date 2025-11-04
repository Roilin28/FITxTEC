import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../src/theme/color";

type SetData = { set: number; reps: number; weight: number; done: boolean };
type Props = { 
  title: string; 
  sets: number; 
  restSec?: number;
  initialData?: SetData[];
  onDataChange?: (data: SetData[]) => void;
};

/** Tamaños y layout */
const ROW_H = 40;          // alto de fila (más compacto)
const BTN = 28;            // tamaño del botón +/- dentro del input
const VALUE_MIN_W = 34;    // ancho mínimo del número para que no brinque
const GUTTER = 10;         // separación entre columnas

/** proporciones de columnas (Set chico, Reps/Weight amplios) */
const COL = { set: 0.5, reps: 1.5, weight: 1.5, done: 0.8 };

export default function ExerciseCard({ title, sets, restSec = 120, initialData, onDataChange }: Props) {
  // Inicializar con initialData o valores por defecto
  const getInitialState = () => {
    if (initialData && initialData.length > 0) {
      return initialData;
    }
    return Array.from({ length: sets }, (_, i) => ({
      set: i + 1,
      reps: 8,
      weight: 40,
      done: false,
    }));
  };

  const [rows, setRows] = useState<SetData[]>(getInitialState);

  // Sincronizar con initialData si cambia, pero solo si es diferente
  React.useEffect(() => {
    if (initialData && initialData.length > 0) {
      // Solo actualizar si realmente cambió para evitar loops
      setRows((prev) => {
        const hasChanged = prev.length !== initialData.length || 
          prev.some((p, i) => 
            p.reps !== initialData[i]?.reps || 
            p.weight !== initialData[i]?.weight || 
            p.done !== initialData[i]?.done
          );
        return hasChanged ? initialData : prev;
      });
    }
  }, [initialData]);

  const completed = useMemo(() => rows.filter((r) => r.done).length, [rows]);

  // Usar una referencia para el callback para evitar problemas de dependencias
  const onDataChangeRef = React.useRef(onDataChange);
  React.useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // Usar useCallback para evitar recrear las funciones en cada render
  const bump = React.useCallback((idx: number, key: "reps" | "weight", delta: number) => {
    setRows((prev) => {
      const updated = prev.map((r, i) =>
        i === idx ? { ...r, [key]: Math.max(0, (r as any)[key] + delta) } : r
      );
      // Llamar onDataChange usando la referencia después del update
      // Usar queueMicrotask para ejecutar después de que React termine el update
      if (onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(updated);
        });
      }
      return updated;
    });
  }, []);

  const toggleDone = React.useCallback((idx: number) => {
    setRows((prev) => {
      const updated = prev.map((r, i) => (i === idx ? { ...r, done: !r.done } : r));
      // Llamar onDataChange usando la referencia después del update
      if (onDataChangeRef.current) {
        queueMicrotask(() => {
          onDataChangeRef.current?.(updated);
        });
      }
      return updated;
    });
  }, []);

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
      <View style={[styles.tableHead, { columnGap: GUTTER }]}>
        <Text style={[styles.th, { flex: COL.set }]}>Set</Text>
        <Text style={[styles.th, { flex: COL.reps }]}>Reps</Text>
        <Text style={[styles.th, { flex: COL.weight }]}>Weight</Text>
        <Text style={[styles.th, { flex: COL.done }]}>
          Done
        </Text>
      </View>

      {/* Rows */}
      {rows.map((r, i) => (
        <View
          key={i}
          style={[styles.row, { columnGap: GUTTER }, r.done && styles.rowDone]}
        >
          {/* Set (pill compacto) */}
          <View style={{ flex: COL.set }}>
            <Text style={styles.setPill}>{r.set}</Text>
          </View>

          {/* Reps: input con - valor + dentro de la misma caja */}
          <View style={{ flex: COL.reps }}>
            <Counter
              value={r.reps}
              onMinus={() => bump(i, "reps", -1)}
              onPlus={() => bump(i, "reps", +1)}
            />
          </View>

          {/* Weight */}
          <View style={{ flex: COL.weight }}>
            <Counter
              value={r.weight}
              onMinus={() => bump(i, "weight", -2.5)}
              onPlus={() => bump(i, "weight", +2.5)}
            />
          </View>

          {/* Done al extremo derecho */}
          <View style={{ flex: COL.done, alignItems: "flex-end" }}>
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

      {/* Rest */}
      <View style={styles.restRow}>
        <Ionicons name="time-outline" color={colors.textMuted} size={16} />
        <Text style={styles.restText}> Rest: {restSec}s</Text>
      </View>
    </View>
  );
}

/** Input compacto: [-]  value  [+] dentro de la MISMA caja */
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
      <TouchableOpacity
        onPress={onMinus}
        activeOpacity={0.85}
        style={counterStyles.btn}
      >
        <Ionicons name="remove" size={16} color={colors.text} />
      </TouchableOpacity>

      <Text style={counterStyles.value}>
        {Number.isInteger(value) ? value : value.toFixed(1)}
      </Text>

      <TouchableOpacity
        onPress={onPlus}
        activeOpacity={0.85}
        style={counterStyles.btn}
      >
        <Ionicons name="add" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
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
  th: { color: colors.textMuted, fontSize: 12, textAlign: "center"},

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

  setPill: {
    backgroundColor: "#222632",
    color: colors.text,
    minWidth: 30,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: "hidden",
  },

  doneBtn: {
    width: 34,
    height: 34,
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
    height: ROW_H,
    backgroundColor: "#0f1118",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: 8,
    backgroundColor: "#1a1e29",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: {
    color: colors.text,
    minWidth: VALUE_MIN_W,
    textAlign: "center",
    fontWeight: "700",
  },
});
