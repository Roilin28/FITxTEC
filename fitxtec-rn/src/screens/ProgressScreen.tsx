// src/screens/ProgressScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import colors from "../theme/color";
import { useAuth } from "../services/AuthContext";
import { exportProgressPDF } from "../services/exportReport";

import {
  computeUserStats, saveUserStats, type UserStats, type MGKey,
} from "../services/stats";
import { createAndSaveInsights, getLatestInsight } from "../services/Insights";

type RootStackParamList = {
  Home: undefined;
  User: undefined;
  WorkoutDetail: { routineId: string };
  Routines: undefined;
  RoutineDetails: { routineId: string };
  InsightsHistory: undefined;
};

const screenW = Dimensions.get("window").width;
const CARD_PAD = 14;
const CHART_W = screenW - CARD_PAD * 2 - 4;
const CHART_H_LINE = 220;
const CHART_H_BAR = 220;

const chartConfig = {
  backgroundGradientFrom: "#15171f",
  backgroundGradientTo: "#15171f",
  decimalPlaces: 0,
  color: () => colors.primary,
  labelColor: (o = 1) => `rgba(156,163,175,${o})`,
  propsForBackgroundLines: { strokeDasharray: "4 6", stroke: "#2a2d3a" },
  propsForDots: { r: "3" },
};

const MG: MGKey[] = ["Chest","Back","Shoulders","Quads","Hamstrings","Biceps","Triceps","Calves"];
const SAFE5 = [0,0,0,0,0];
function isSeriesOK(a: any): a is number[] {
  return Array.isArray(a) && a.length === 5 && a.every(n => Number.isFinite(n));
}

export default function ProgressScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const uid = user?.id;

  const [stats, setStats] = useState<UserStats | null>(null);
  const [insight, setInsight] = useState<{ advice?: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  
  const loadStatsAndInsights = useCallback(async () => {
    if (!uid) return;
    setLoading(true);

    const slow = setTimeout(() => {
      Alert.alert("Lento", "La carga está tardando, intentaré modo rápido.");
    }, 10000);

    try {
      const s = await computeUserStats(uid);
      clearTimeout(slow);
      setStats(s);
      saveUserStats(uid, s).catch(() => {});

      // lee último insight si existe
      const li = await getLatestInsight(uid);
      setInsight(li as any);
    } catch (e) {
      clearTimeout(slow);
      console.log("loadStats error:", e);
      Alert.alert("Error", "No se pudieron cargar las estadísticas.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { loadStatsAndInsights(); }, [loadStatsAndInsights]);

  async function refreshInsights() {
    if (!uid || !stats) return;
    const i = await createAndSaveInsights(uid, stats);
    setInsight(i as any);
  }

  /* ----- Datos de gráficos ----- */
  const ready = useMemo(() => {
    if (!stats) return false;
    try {
      return MG.every((k) => isSeriesOK((stats as any).muscles?.[k]?.volumeHistory));
    } catch { return false; }
  }, [stats]);

  const lineData = useMemo(() => {
    const pick: MGKey[] = ["Chest","Back","Shoulders"];
    const labels = ["W-4","W-3","W-2","W-1","W0"];
    return {
      labels,
      datasets: pick.map((m, idx) => ({
        data: ready ? stats!.muscles[m].volumeHistory : SAFE5,
        color: () => [colors.primary, colors.accent1, colors.accent2][idx],
        strokeWidth: 2,
      })),
      legend: pick,
    };
  }, [ready, stats]);

  const barData = useMemo(() => {
    const currents = MG.map(m => ready ? stats!.muscles[m].volumeWeekCurrent : 0);
    const ropArray = MG.map(m => ready ? stats!.muscles[m].ropPct : 0);
    return {
      labels: MG,
      datasets: [{
        data: currents,
        colors: ropArray.map(pct => () => pct > 2 ? "#16A34A" : pct < -2 ? "#EF4444" : "#9CA3AF"),
      }],
    };
  }, [ready, stats]);

    const onExport = async () => {
  if (!uid || !stats) return;
  try {
    const uri = await exportProgressPDF(uid, stats, insight?.advice); // ⬅️ aquí
    Alert.alert("Exportado", `PDF listo.\n${uri}`);
  } catch (e) {
    console.log("export error:", e);
    Alert.alert("Error", "No pude exportar el PDF.");
  }
};

  const decreased = useMemo(
    () => (stats ? stats.decreased : []),
    [stats]
  );

  // const onExport = () => {
  //   Alert.alert("Progress report", "Export placeholder (PDF/CSV próximamente).");
  // };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.brand}>FITxTEC</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("User")}
        >
          <Ionicons name="person-circle-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 28 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
            <Text style={styles.headerTitle}>Progress Tracking</Text>
          </View>
          {loading && (
            <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.headerSub}>Calculando estadísticas…</Text>
            </View>
          )}
        </View>

        {/* Estado por grupos musculares */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="dumbbell" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Routine Progress (current week)</Text>
          </View>

          <View style={styles.chipsWrap}>
            {MG.map((m) => {
              const rop = stats ? stats.muscles[m].ropPct : 0;
              const up = rop > 2, down = rop < -2;
              const bg = up ? "#0b1f12" : down ? "#1f0b0b" : "#0f1118";
              const bd = up ? "#1e3a24" : down ? "#3a1e1e" : colors.border;
              const dot = up ? "#16A34A" : down ? "#EF4444" : "#6B7280";
              return (
                <View key={m} style={[styles.chip, { backgroundColor: bg, borderColor: bd }]}>
                  <View style={[styles.dot, { backgroundColor: dot }]} />
                  <Text style={styles.chipText}>{m}</Text>
                  <Text
                    style={[
                      styles.chipText,
                      { color: up ? "#16A34A" : down ? "#EF4444" : colors.textMuted },
                    ]}
                  >
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

        {/* Line chart */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="trending-up" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Muscle Progress (volume)</Text>
          </View>

          {ready ? (
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
          ) : (
            <Text style={{ color: colors.textMuted, width: "100%" }}>
              Aún sin series válidas — esperando datos…
            </Text>
          )}
        </View>

        {/* Bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Volume by Muscle</Text>
          {/* @ts-ignore */}
          <BarChart
            data={barData as any}
            width={CHART_W}
            height={CHART_H_BAR}
            chartConfig={chartConfig as any}
            fromZero
            withInnerLines
            withCustomBarColorFromData
            flatColor
            style={styles.chart}
          />
          <View style={styles.legendRow}>
            <LegendDot color="#16A34A" label="Up vs last week" />
            <LegendDot color="#EF4444" label="Down vs last week" />
            <LegendDot color="#9CA3AF" label="No change" />
          </View>
        </View>

        {/* KPIs + Export */}
        <View style={styles.kpiRow}>
          <KPI
            title="Strength Increase"
            value={
              stats
                ? `${Math.round(
                    ((stats.totals.volumeWeekCurrent - stats.totals.volumeWeekPrev) /
                      Math.max(stats.totals.volumeWeekPrev, 1)) * 100
                  )}%`
                : "—"
            }
            subtitle="vs last week"
          />
          <KPI
            title="Total Sessions"
            value={stats ? String(stats.totals.sessionsLast30d) : "—"}
            subtitle="last 30 days"
          />
        </View>

        {/* Recomendaciones IA */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="robot-outline" size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Recomendaciones (IA)</Text>
          </View>

          {insight?.advice?.length ? (
            <View style={{ gap: 8, width: "100%" }}>
              {insight.advice.map((t, i) => (
                <Tip key={i}>{t}</Tip>
              ))}
            </View>
          ) : (
            <Text style={{ color: colors.textMuted, width: "100%" }}>
              Aún no hay consejos. Toca “Refrescar consejos”.
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14, width: "100%" }}>
            <TouchableOpacity
              onPress={refreshInsights}
              style={[styles.actionBtn, { backgroundColor: "#1f2530", borderColor: colors.border }]}
            >
              <Text style={styles.actionText}>Refrescar consejos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("InsightsHistory")}
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.actionText, { color: "#0b0f0a" }]}>Ver anteriores</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={onExport} activeOpacity={0.9} style={styles.exportBtn}>
          <Text style={styles.exportText}>Export Progress Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------- Subcomponentes ----------------- */
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
  header: { paddingHorizontal: 4, paddingVertical: 8, marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  headerSub: { color: colors.textMuted, marginTop: 4 },

  navbar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6,
    backgroundColor: "transparent", borderBottomWidth: 1, borderBottomColor: "#0e0f13",
  },
  brand: { color: "#ffffff", fontSize: 20, fontWeight: "800", letterSpacing: 0.5 },
  profileBtn: { padding: 4 },

  actionBtn: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  actionText: { color: "#fff", fontWeight: "700" },

  card: {
    backgroundColor: "#0f1118", borderRadius: 18, borderWidth: 1, borderColor: colors.border,
    padding: CARD_PAD, marginBottom: 14, alignItems: "center",
  },
  cardTitleRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  cardTitle: { color: colors.text, fontWeight: "700", fontSize: 14 },

  chart: { borderRadius: 12 },
  legendRow: { width: "100%", flexDirection: "row", gap: 16, alignItems: "center", marginTop: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textMuted, fontSize: 12 },

  kpiRow: { flexDirection: "row", gap: 12, marginTop: 4, marginBottom: 12 },
  kpiCard: {
    flex: 1, backgroundColor: "#0f1118", borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: 14, alignItems: "center",
  },
  kpiValue: { color: colors.primary, fontSize: 22, fontWeight: "800", marginBottom: 6 },
  kpiTitle: { color: colors.text, fontWeight: "700" },
  kpiSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  exportBtn: {
    backgroundColor: colors.primary, borderRadius: 12, height: 48,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  exportText: { color: "#0b0f0a", fontWeight: "800", fontSize: 16 },

  chipsWrap: { width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1,
  },
  chipText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  helperText: { color: colors.textMuted, marginTop: 10, width: "100%" },
});
