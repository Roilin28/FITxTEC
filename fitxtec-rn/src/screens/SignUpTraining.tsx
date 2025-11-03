import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import colors from "../theme/color";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signUpTraining } from "../services/SignUp";

type RootStackParamList = {
  SignUpTraining: { usuario: any };
  SignUpSettings: { usuario: any };
};

export default function SignUpTrainingScreen() {
  const route = useRoute();
  const { usuario } = route.params as { usuario: any };
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [workouts, setWorkouts] = useState("");

  const onNext = async () => {
    if (!goal || !experience || !workouts) {
      alert("Please fill in all fields.");
      return;
    }

    const updatedUsuario = await signUpTraining(goal, experience, workouts, usuario);
    if (!updatedUsuario) {
      alert("Error updating user information.");
      return;
    }

    navigation.navigate("SignUpSettings", { usuario: updatedUsuario });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <Text style={styles.title}>FITxTEC</Text>
            <Text style={styles.subtitle}>Training Preferences</Text>

            <View style={styles.card}>
              {/* PRIMARY GOAL */}
              <Text style={styles.label}>Primary Goal</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={goal}
                  onValueChange={setGoal}
                  style={styles.input}
                  dropdownIconColor="white"
                  itemStyle={Platform.OS === "ios" ? { color: "white", fontSize: 16 } : undefined}
                >
                  <Picker.Item label="Hypertrophy" value="Hypertrophy" />
                  <Picker.Item label="Strength" value="Strength" />
                  <Picker.Item label="Endurance" value="Endurance" />
                  <Picker.Item label="Weight Loss" value="Weight Loss" />
                  <Picker.Item label="General Fitness" value="General Fitness" />
                </Picker>
              </View>

              {/* EXPERIENCE */}
              <Text style={styles.label}>Experience Level</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={experience}
                  onValueChange={setExperience}
                  style={styles.input}
                  dropdownIconColor="white"
                  itemStyle={Platform.OS === "ios" ? { color: "white", fontSize: 16 } : undefined}
                >
                  <Picker.Item label="Beginner" value="Beginner" />
                  <Picker.Item label="Intermediate" value="Intermediate" />
                  <Picker.Item label="Advanced" value="Advanced" />
                </Picker>
              </View>

              {/* WORKOUTS */}
              <Text style={styles.label}>Workouts per Week</Text>
              <View style={styles.input}>
                <Picker
                  selectedValue={workouts}
                  onValueChange={setWorkouts}
                  style={styles.input}
                  dropdownIconColor="white"
                  itemStyle={Platform.OS === "ios" ? { color: "white", fontSize: 16 } : undefined}
                >
                  <Picker.Item label="1 day" value="1 day" />
                  <Picker.Item label="2 days" value="2 days" />
                  <Picker.Item label="3 days" value="3 days" />
                  <Picker.Item label="4 days" value="4 days" />
                  <Picker.Item label="5 days" value="5 days" />
                </Picker>
              </View>

              <TouchableOpacity onPress={onNext} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: colors.text,
    marginBottom: 14,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
