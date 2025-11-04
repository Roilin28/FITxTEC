// src/screens/InsightsHistoryScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../services/AuthContext";
import { listInsightsHistory } from "../services/Insights";
import colors from "../theme/color";

export default function InsightsHistoryScreen() {
  const { user } = useAuth();
  const uid = user?.id!;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await listInsightsHistory(uid);
      setItems(data);
      setLoading(false);
    })();
  }, [uid]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        <Text style={s.title}>Historial de Consejos (IA)</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          items.map((it) => (
            <View key={it.id} style={s.card}>
              <Text style={s.meta}>{new Date(Number(it.createdAt ?? 0)).toLocaleString()}</Text>
              {(it.advice ?? []).map((a: string, i: number) => (
                <Text key={i} style={s.line}>• {a}</Text>
              ))}
            </View>
          ))
        )}
        {!loading && items.length === 0 && <Text style={s.meta}>Sin registros aún.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { color: colors.text, fontWeight: "800", fontSize: 16, marginBottom: 10 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, marginBottom: 10 },
  meta: { color: colors.textMuted, marginBottom: 6 },
  line: { color: colors.text, marginBottom: 4 },
});
