import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import ExerciseCard from "../../components/ExerciseCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Home: undefined;
  User: undefined;
};

export default function WorkoutScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
      >
        {/* Header*/}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Ionicons name="chevron-back" size={20} color={"#ffffff"} />
            <Text style={styles.headerTitle}>Push Day - Upper Body</Text>
          </View>
          <Text style={styles.headerSub}>3 exercises • 45 min</Text>
        </View>

        <ExerciseCard title="Bench Press" sets={3} restSec={180} />
        <ExerciseCard title="Incline Dumbbell Press" sets={3} restSec={120} />
        <ExerciseCard title="Seated Rows" sets={3} restSec={90} />

        <View style={styles.finishBtn}>
          <Text style={styles.finishText}>Finish Workout</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    margin: 1,
    backgroundColor: colors.bg,
    borderRadius: 18,
    padding: 1,
    marginBottom: 20,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { color: "#ffffff", fontWeight: "800", fontSize: 16 },
  headerSub: { color: "#ffffff", marginTop: 4, opacity: 0.8 },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#0e0f13",
  },
  brand: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileBtn: {
    padding: 4,
  },

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
