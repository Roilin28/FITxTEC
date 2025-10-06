import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../theme/color";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenW = Dimensions.get("window").width;
const CARD_PAD = 14;
const CHART_W = screenW - CARD_PAD * 2 - 4; // margen sutil
const CHART_H_LINE = 220;
const CHART_H_BAR = 220;

const chartConfig = {
  backgroundGradientFrom: "#15171f",
  backgroundGradientTo: "#15171f",
  decimalPlaces: 0,
  color: () => colors.primary, // azul o el que tengas en tu theme
  labelColor: (o = 1) => `rgba(156,163,175,${o})`,
  propsForBackgroundLines: { strokeDasharray: "4 6", stroke: "#2a2d3a" },
  propsForDots: { r: "3" },
};

type PR = { name: string; date: string; value: string; delta: string };


/* ==================== NUEVO: datos por grupo muscular ==================== */
type MGKey = "Chest" | "Back" | "Shoulders" | "Quads" | "Hamstrings" | "Biceps" | "Triceps";

type MuscleStats = {
  name: MGKey;
  // volumen semana actual vs pasada (sets*reps*peso)
  volumeWeek: [current: number, prev: number];
  // historial para el gráfico de líneas (5 semanas)
  volumeHistory: number[];
  // ROP (% cambio vs semana pasada)
  ropPct: number;
};

const MG: MGKey[] = ["Chest","Back","Shoulders","Quads","Hamstrings","Biceps","Triceps"];

// MOCK: cámbialo cuando conectes tus datos
const mock: Record<MGKey, MuscleStats> = {
  Chest:      { name: "Chest",      volumeWeek: [5200, 4800], volumeHistory: [4200, 4500, 4700, 4800, 5200], ropPct:  +8.3 },
  Back:       { name: "Back",       volumeWeek: [6100, 6400], volumeHistory: [6000, 6100, 6200, 6400, 6100], ropPct:  -4.7 },
  Shoulders:  { name: "Shoulders",  volumeWeek: [3100, 2400], volumeHistory: [2000, 2300, 2400, 2400, 3100], ropPct: +29.2 },
  Quads:      { name: "Quads",      volumeWeek: [7300, 7300], volumeHistory: [7000, 7150, 7200, 7300, 7300], ropPct:  +0.0 },
  Hamstrings: { name: "Hamstrings", volumeWeek: [3800, 3600], volumeHistory: [3200, 3400, 3600, 3600, 3800], ropPct:  +5.6 },
  Biceps:     { name: "Biceps",     volumeWeek: [2100, 2500], volumeHistory: [2500, 2400, 2300, 2500, 2100], ropPct: -16.0 },
  Triceps:    { name: "Triceps",    volumeWeek: [1500, 2500], volumeHistory: [1800, 1900, 2000, 2500, 1500], ropPct: -40.0 },
};

/* ==================== FIN NUEVO ==================== */

export default function ProgressScreen() {
  /* ---------- LÍNEAS: ahora por grupos musculares (3 claves) ---------- */
  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    datasets: [
      { data: mock.Chest.volumeHistory,     color: () => colors.primary, strokeWidth: 2 }, // Chest
      { data: mock.Back.volumeHistory,      color: () => colors.accent1, strokeWidth: 2 }, // Back
      { data: mock.Shoulders.volumeHistory, color: () => colors.accent2, strokeWidth: 2 }, // Shoulders
    ],
    legend: ["Chest", "Back", "Shoulders"],
  };

  /* ---------- BARRAS: volumen por músculo (semana actual) ---------- */
  const muscleLabels = useMemo(() => MG.map((m) => m), []);
  const volumeCurrent = useMemo(() => MG.map((m) => mock[m].volumeWeek[0]), []);
  const volumePrev    = useMemo(() => MG.map((m) => mock[m].volumeWeek[1]), []);
  const ropArray      = useMemo(() => MG.map((m) => mock[m].ropPct), []);

  // coloreamos barras: verde si sube, rojo si baja, gris si igual
  const barData = useMemo(() => ({
    labels: muscleLabels,
    datasets: [{
      data: volumeCurrent,
      colors: ropArray.map(pct => () => pct > 2 ? "#16A34A" : pct < -2 ? "#EF4444" : "#9CA3AF")
    }]
  }), []);

  // músculos con caída (para mostrar "dónde redujo")
  const decreased = useMemo(() => MG.filter(m => mock[m].ropPct < -2), []);

  const onExport = () => {
    Alert.alert("Progress report", "Export placeholder (PDF/CSV próximamente).");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: 28 }}
      >
        {/* Header simple */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
            <Text style={styles.headerTitle}>Progress Tracking</Text>
          </View>
        </View>

        {/* ===== NUEVO: Estado de rutina por grupos musculares ===== */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="dumbbell" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Routine Progress (current week)</Text>
          </View>
          <View style={styles.chipsWrap}>
            {MG.map((m) => {
              const rop = mock[m].ropPct;
              const up = rop > 2, down = rop < -2;
              const bg = up ? "#0b1f12" : down ? "#1f0b0b" : "#0f1118";
              const bd = up ? "#1e3a24" : down ? "#3a1e1e" : colors.border;
              const dot = up ? "#16A34A" : down ? "#EF4444" : "#6B7280";
              return (
                <View key={m} style={[styles.chip, { backgroundColor: bg, borderColor: bd }]}>
                  <View style={[styles.dot, { backgroundColor: dot }]} />
                  <Text style={styles.chipText}>{m}</Text>
                  <Text style={[styles.chipText, { color: up ? "#16A34A" : down ? "#EF4444" : colors.textMuted }]}>
                    {rop > 0 ? `+${rop.toFixed(1)}%` : `${rop.toFixed(1)}%`}
                  </Text>
                </View>
              );
            })}
          </View>
          {decreased.length > 0 && (
            <Text style={styles.helperText}>
              ↓ Progreso reducido en: {decreased.join(", ")} — considera ajustar volumen/descanso.
            </Text>
          )}
        </View>
        {/* ===== FIN NUEVO ===== */}
    
        {/* Exercise Progress -> ahora “Muscle Progress (volume)” */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons
              name="trending-up"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.cardTitle}>Muscle Progress (volume)</Text>
          </View>

          <LineChart
            data={lineData as any}
            width={CHART_W}
            height={CHART_H_LINE}
            chartConfig={chartConfig}
            bezier={false}
            withShadow={false}
            withDots
            withInnerLines
            withOuterLines={false}
            style={styles.chart}
            fromZero
            segments={5}
          />

          {/* Leyenda personalizada */}
          <View style={styles.legendRow}>
            <LegendDot color={colors.primary} label="Chest" />
            <LegendDot color={colors.accent1} label="Back" />
            <LegendDot color={colors.accent2} label="Shoulders" />
          </View>
        </View>

        {/* Weekly Training Volume -> por músculo (Now) con color por cambio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Volume by Muscle</Text>
          {/* @ts-ignore: algunos tipos no incluyen estas props */}
          <BarChart
            data={barData as any}
            width={CHART_W}
            height={CHART_H_BAR}
            chartConfig={chartConfig as any}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            showValuesOnTopOfBars={false}
            style={styles.chart}
            withInnerLines
            withCustomBarColorFromData
            flatColor
          />
          <View style={styles.legendRow}>
            <LegendDot color="#16A34A" label="Up vs last week" />
            <LegendDot color="#EF4444" label="Down vs last week" />
            <LegendDot color="#9CA3AF" label="No change" />
          </View>
        </View>

        {/* KPIs + Export */}
        <View style={styles.kpiRow}>
          <KPI title="Strength Increase" value="47%" subtitle="vs last month" />
          <KPI title="Total PRs" value="15" subtitle="this month" />
        </View>

        {/* ===== NUEVO: recomendaciones IA (breve) ===== */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="robot-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Recomendaciones (IA)</Text>
          </View>
          <View style={{ gap: 8, width: "100%" }}>
            <Tip>Tríceps por debajo de Bíceps (~40% menos volumen). Añade 2 series de extensiones por encima de la cabeza al final de Push Day.</Tip>
            <Tip>Quads estancado. Intenta +2.5 kg en las 2 primeras series de Squat manteniendo repeticiones.</Tip>
            <Tip>Back a la baja vs histórico. Reduce 5% la carga hoy para cuidar técnica.</Tip>
          </View>
        </View>
        {/* ===== FIN NUEVO ===== */}

        <TouchableOpacity onPress={onExport} activeOpacity={0.9} style={styles.exportBtn}>
          <Text style={styles.exportText}>Export Progress Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------- Subcomponentes ----------------- */

function PRItem({ name, date, value, delta }: PR) {
  return (
    <View style={styles.prItem}>
      <View style={styles.prIcon}>
        <MaterialCommunityIcons name="dumbbell" size={16} color={"#0b0f0a"} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.prName}>{name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={styles.prDate}>{date}</Text>
        </View>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.prValue}>{value}</Text>
        <View style={styles.prDeltaPill}>
          <Text style={styles.prDeltaText}>{delta}</Text>
        </View>
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function KPI({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
      <Text style={styles.kpiSub}>{subtitle}</Text>
    </View>
  );
}

/* chip tip */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 }} />
      <Text style={{ flex: 1, color: colors.textMuted }}>{children}</Text>
    </View>
  );
}

/* ----------------- Estilos ----------------- */

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    color: colors.text,      
    fontWeight: "800",
    fontSize: 16,
  },
  headerSub: {
    color: colors.textMuted, 
    marginTop: 4,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: CARD_PAD,
    marginBottom: 14,
    alignItems: "center",
  },
  cardTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: { color: colors.text, fontWeight: "700", fontSize: 14 },

  chart: {
    borderRadius: 12,
  },

  legendRow: {
    width: "100%",
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 8,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textMuted, fontSize: 12 },

  prItem: {
    width: "100%",
    backgroundColor: "#0f1118",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  prIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  prName: { color: colors.text, fontWeight: "700" },
  prDate: { color: colors.textMuted, fontSize: 12 },
  prValue: { color: colors.text, fontSize: 18, fontWeight: "800" },
  prDeltaPill: {
    marginTop: 4,
    backgroundColor: "#12260a",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#1e3a17",
  },
  prDeltaText: { color: colors.primary, fontSize: 12, fontWeight: "700" },

  kpiRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 12 },
  kpiCard: {
    flex: 1,
    backgroundColor: "#0f1118",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: "center",
  },
  kpiValue: { color: colors.primary, fontSize: 22, fontWeight: "800", marginBottom: 6 },
  kpiTitle: { color: colors.text, fontWeight: "700" },
  kpiSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  exportBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  exportText: { color: "#0b0f0a", fontWeight: "800", fontSize: 16 },

  /* NUEVO: chips de rutina */
  chipsWrap: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  chipText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  helperText: { color: colors.textMuted, marginTop: 10, width: "100%" },
});
