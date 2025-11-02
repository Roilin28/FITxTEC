import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import colors from "../theme/color";
import styles from "../theme/routinesStyles";
import { listRutinas, Rutina } from "../services/Routines";
import AiRoutineGenerator from "./AiRoutineGenerator";

type RootStackParamList = {
  Home: undefined;
  User: undefined;
  Workout: { routineId: string };
  Routines: undefined;
  RoutineDetails: { routineId: string };
};

export default function RoutinesScreen() {
  
  const [routines, setRoutines] = useState<Array<{ id: string } & Rutina>>([]);
 
  const [aiMode, setAiMode] = useState(false);

  useEffect(() => {
    listRutinas().then(setRoutines);
  }, []);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    if (aiMode) {
    return (
      <SafeAreaView style={styles.safe}>
        <AiRoutineGenerator
          onClose={() => setAiMode(false)}
          onSaved={(newId) => {
            setAiMode(false);
            // refresca lista o navega directo al detalle / workout
            listRutinas().then(setRoutines);
            // navigation.navigate("RoutineDetails", { routineId: newId });
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#10131b", "#151820"]}
        style={styles.gradient}
      />

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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Routine</Text>
          <Text style={styles.headerSubtitle}>
            Find the perfect training program for you
          </Text>
        </View>

        {/* Motivational Quote */}
        <View style={styles.motivationBox}>
          <Ionicons name="flame-outline" size={18} color="#9EFF00" />
          <Text style={styles.motivationText}>
            “Discipline beats motivation — train even when you don’t feel like
            it.”
          </Text>
        </View>

        {/* Pre-made Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pre-made Routines</Text>
          <Text style={styles.sectionSubtitle}>
            Designed by professional trainers
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {routines.map((routine, i) => (
              <MotiView
                key={routine.id}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: i * 100 }}
                style={styles.routineCard}
              >
                <View style={styles.routineHeader}>
                  <Ionicons
                    name={"dumbbell" as any}
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.routineName}>{routine.nombre}</Text>
                  <Text style={styles.duration}>
                    {routine.tiempoAproximado}
                  </Text>
                </View>

                <View style={styles.tagsRow}>
                  <Text style={styles.tagDays}>
                    {routine.cantidadDias} days
                  </Text>
                  <View
                    style={[styles.tagLevel, { backgroundColor: "#ffffff" }]}
                  >
                    <Text style={styles.tagLevelText}>
                      {routine.nivelDificultad}
                    </Text>
                  </View>
                </View>

                <Text style={styles.desc}>{routine.descripcion}</Text>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() =>
                      navigation.navigate("RoutineDetails", {
                        routineId: routine.id,
                      })
                    }
                  >
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color={colors.text}
                    />
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.startBtn}
                    onPress={() =>
                      navigation.navigate("Workout", {
                        routineId: routine.id,
                      })
                    }
                  >
                    <Text style={styles.startBtnText}>Start</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>
            ))}
          </ScrollView>
        </View>

        {/* AI Section */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.aiCard}
        >
          <View style={styles.aiHeader}>
            <Ionicons
              name="sparkles-outline"
              size={28}
              color={colors.primary}
            />
            <Text style={styles.aiTitle}>Create a Custom Routine with AI</Text>
          </View>

          <Text style={styles.aiDesc}>
            Tell us your goals and we’ll generate a personalized plan for you.
          </Text>

          <View style={styles.aiBullets}>
            <Text style={styles.aiBullet}>
              • Tailored to your fitness level
            </Text>
            <Text style={styles.aiBullet}>
              • Adjusts to your available time
            </Text>
            <Text style={styles.aiBullet}>• Focused on your unique goals</Text>
          </View>

          <TouchableOpacity style={styles.aiButton} onPress={() => setAiMode(true)}>
        <Text style={styles.aiButtonText}>Generate with AI</Text>
      </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
