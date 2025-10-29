import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import ExerciseCard from "../../components/ExerciseCard";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getRutinaDeep, RutinaCompleta } from "../services/Routines";

type RootStackParamList = {
  Home: undefined;
  User: undefined;
  Workout: { routineId: string };
};
import { local_Notification_Finish_Workout } from "../services/notifications";

export default function WorkoutScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { routineId } = route.params as { routineId: string };

  const [rutina, setRutina] = useState<RutinaCompleta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRutina = async () => {
      setLoading(true);
      try {
        const data = await getRutinaDeep(routineId);
        setRutina(data);
      } catch (e) {
        console.error("Error al obtener rutina:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchRutina();
  }, [routineId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!rutina) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Rutina no encontrada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={"#ffffff"} />
          </TouchableOpacity>

          <View>
            <Text style={styles.headerTitle}>{rutina.nombre}</Text>
            <Text style={styles.headerSub}>
              {rutina.cantidadDias} días • {rutina.tiempoAproximado} •{" "}
              {rutina.nivelDificultad}
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <Text style={styles.description}>{rutina.descripcion}</Text>
        {rutina.notas && <Text style={styles.notes}>💡 {rutina.notas}</Text>}

        {/* Días y ejercicios */}
        {rutina.dias?.map((dia) => (
          <View key={dia.id} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{dia.nombre}</Text>
            {dia.ejercicios?.map((ej) => (
              <ExerciseCard
                key={ej.id}
                title={ej.nombre}
                sets={ej.series}
                restSec={90}
              />
            ))}
          </View>
        ))}
        <SafeAreaView edges={["bottom"]} style={styles.finishBtn}>
        <TouchableOpacity style={styles.finishBtn}
        onPress={() => local_Notification_Finish_Workout()}
        >
          <Text style={styles.finishText}>Finish Workout</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  brand: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  profileBtn: { padding: 4 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "#ccc", fontSize: 13 },
  description: {
    color: "#bbb",
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  notes: {
    color: colors.primary,
    marginBottom: 20,
    fontSize: 13,
  },
  dayContainer: { marginBottom: 24 },
  dayTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  finishBtn: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  finishText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  errorText: { color: "#fff", textAlign: "center", marginTop: 50 },
});
