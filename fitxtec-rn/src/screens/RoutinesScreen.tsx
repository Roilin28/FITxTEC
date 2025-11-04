import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import colors from "../theme/color";
import styles from "../theme/routinesStyles";
import {
  listRutinas,
  listAiRoutinesForUser,
  getRutinaDeepOrAi,
  Rutina,
} from "../services/Routines";
import { useAuth } from "../services/AuthContext";
import {
  crearRutinaEnProgreso,
  getRutinasEnProgreso,
} from "../services/rutinasEnProgreso";
import AiRoutineGenerator from "./AiRoutineGenerator";

type RootStackParamList = {
  RoutinesMain: undefined;
  RoutineDetails: { routineId: string; isAiRoutine?: boolean };
  Settings: undefined;
};

type TabParamList = {
  Home: undefined;
  Routines: undefined;
  Workout: {
    screen?: string;
    params?: { rutinaEnProgresoId: string };
  };
  Progress: undefined;
  Profile: undefined;
};

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<({ id: string } & Rutina)[]>([]);
  const [aiRoutines, setAiRoutines] = useState<({ id: string } & Rutina)[]>([]);
  const [aiMode, setAiMode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    listRutinas().then(setRoutines);
  }, []);

  useEffect(() => {
    if (user) {
      listAiRoutinesForUser(user.id).then(setAiRoutines);
    }
  }, [user]);

  // Refrescar rutinas AI cuando se vuelve a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        listAiRoutinesForUser(user.id).then(setAiRoutines);
      }
    }, [user])
  );

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tabNavigation = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const handleStartWorkout = async (
    routineId: string,
    isAiRoutine: boolean = false
  ) => {
    if (!user) return;

    try {
      // Verificar si ya existe una rutina en progreso para esta rutina
      const rutinasEnProgreso = await getRutinasEnProgreso(user.id);
      const rutinaExistente = rutinasEnProgreso.find(
        (r) => r.rutinaId === routineId
      );

      if (rutinaExistente) {
        // Si ya hay una rutina en progreso, continuar con esa
        tabNavigation.navigate("Workout", {
          screen: "WorkoutDetail",
          params: { rutinaEnProgresoId: rutinaExistente.id! },
        });
        return;
      }

      // Obtener los detalles de la rutina para saber la cantidad de días
      const rutinaCompleta = await getRutinaDeepOrAi(routineId, user.id);
      if (!rutinaCompleta) {
        console.error("No se pudo obtener los detalles de la rutina");
        return;
      }

      // Crear una nueva rutina en progreso
      const rutinaEnProgresoId = await crearRutinaEnProgreso(
        user.id,
        routineId,
        rutinaCompleta.cantidadDias
      );

      // Navegar a la pantalla de workout
      tabNavigation.navigate("Workout", {
        screen: "WorkoutDetail",
        params: { rutinaEnProgresoId },
      });
    } catch (e) {
      console.error("Error al iniciar workout:", e);
    }
  };

  if (aiMode) {
    return (
      <SafeAreaView style={styles.safe}>
        <AiRoutineGenerator
          onClose={() => setAiMode(false)}
          onSaved={(newId) => {
            setAiMode(false);
            // refresca lista o navega directo al detalle / workout
            listRutinas().then(setRoutines);
            if (user) {
              listAiRoutinesForUser(user.id).then(setAiRoutines);
            }
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
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={28} color="#ffffff" />
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
            &quot;La disciplina vence a la motivación — entrena incluso cuando
            no tengas ganas.&quot;
          </Text>
        </View>

        {/* AI Routines Section */}
        {aiRoutines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="sparkles"
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionTitle}>Tus Rutinas de IA</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Rutinas personalizadas creadas para ti
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {aiRoutines.map((routine, i) => (
                <MotiView
                  key={routine.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: i * 100 }}
                  style={styles.routineCard}
                >
                  <View style={styles.routineHeader}>
                    <Ionicons
                      name={"sparkles" as any}
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
                      {routine.cantidadDias} días
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
                          isAiRoutine: true,
                        })
                      }
                    >
                      <Ionicons
                        name="eye-outline"
                        size={16}
                        color={colors.text}
                      />
                      <Text style={styles.viewBtnText}>Ver</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => handleStartWorkout(routine.id, true)}
                    >
                      <Text style={styles.startBtnText}>Iniciar</Text>
                    </TouchableOpacity>
                  </View>
                </MotiView>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Pre-made Routines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Routines for your goals</Text>
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
                    onPress={() => handleStartWorkout(routine.id, false)}
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
          <ImageBackground
            source={{
              uri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&fm=jpg&fit=crop&grayscale",
            }}
            style={styles.aiCardBackground}
            imageStyle={styles.aiCardBackgroundImage}
            resizeMode="cover"
          >
            <View style={styles.aiCardOverlay} />
            <View style={styles.aiCardContent}>
              <View style={styles.aiHeader}>
                <Ionicons
                  name="sparkles-outline"
                  size={28}
                  color={colors.primary}
                />
                <Text style={styles.aiTitle}>
                  Crea una Rutina Personalizada con IA
                </Text>
              </View>

              <Text style={styles.aiDesc}>
                Cuéntanos tus objetivos y generaremos un plan personalizado para
                ti.
              </Text>

              <View style={styles.aiBullets}>
                <Text style={styles.aiBullet}>
                  • Adaptado a tu nivel de condición física
                </Text>
                <Text style={styles.aiBullet}>
                  • Se ajusta a tu tiempo disponible
                </Text>
                <Text style={styles.aiBullet}>
                  • Enfocado en tus objetivos únicos
                </Text>
              </View>

              <TouchableOpacity
                style={styles.aiButton}
                onPress={() => setAiMode(true)}
              >
                <Text style={styles.aiButtonText}>Generar con IA</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
}
