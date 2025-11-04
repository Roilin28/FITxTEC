import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import colors from "../theme/color";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signUpTraining } from "../services/SignUp";
import WebDateInput from "../../components/WebDateInput";

type RootStackParamList = {
  SignUpTraining: { usuario: any };
  SignUpSettings: { usuario: any };
};

export default function SignUpTrainingScreen() {
  const route = useRoute();
  const { usuario } = route.params as { usuario: any };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [workouts, setWorkouts] = useState("");
  const [loading, setLoading] = useState(false);

  const goals = [
    "Hypertrophy",
    "Strength",
    "Endurance",
    "Weight Loss",
    "General Fitness",
  ];

  const experienceLevels = ["Beginner", "Intermediate", "Advanced"];

  const workoutDays = ["1 day", "2 days", "3 days", "4 days", "5 days"];

  const onNext = async () => {
    if (!goal || !experience || !workouts) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    setLoading(true);
    try {
      const updatedUsuario = await signUpTraining(
        goal,
        experience,
        workouts,
        usuario
      );
      if (!updatedUsuario) {
        Alert.alert("Error", "No se pudo actualizar la información.");
        return;
      }

      navigation.navigate("SignUpSettings", { usuario: updatedUsuario });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#10131b", "#151820"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "66%" }]} />
          </View>
          <Text style={styles.progressText}>Paso 2 de 3</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Ionicons name="barbell-outline" size={40} color={colors.primary} />
          <Text style={styles.title}>Preferencias de Entrenamiento</Text>
          <Text style={styles.subtitle}>
            Cuéntanos sobre tus objetivos y experiencia
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Primary Goal */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Objetivo Principal</Text>
            <View style={styles.optionsRow}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.optionChip,
                    goal === g && styles.optionChipActive,
                  ]}
                  onPress={() => setGoal(g)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      goal === g && styles.optionChipTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nivel de Experiencia</Text>
            <View style={styles.optionsRow}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionChip,
                    experience === level && styles.optionChipActive,
                  ]}
                  onPress={() => setExperience(level)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      experience === level && styles.optionChipTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Workouts per Week */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Entrenamientos por Semana</Text>
            <View style={styles.optionsRow}>
              {workoutDays.map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.optionChip,
                    workouts === days && styles.optionChipActive,
                  ]}
                  onPress={() => setWorkouts(days)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      workouts === days && styles.optionChipTextActive,
                    ]}
                  >
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            onPress={onNext}
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>Continuar</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.primaryText}
                  style={{ marginLeft: 8 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  titleSection: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainer: {
    marginBottom: 28,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 100,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  optionChipTextActive: {
    color: colors.primaryText,
  },
  primaryBtn: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
