import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../theme/color";
import { userStyles as styles } from "../theme/userStyles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../services/AuthContext";

type RootStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
};

export default function UserScreen() {
  // Campos de perfil
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [workoutsPorSemana, setWorkoutsPorSemana] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut, updateUserFields } = useAuth();

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setAge(user.edad ? String(user.edad) : "");
      setObjetivo(user.objetivo || "");
      setExperiencia(user.experiencia || "");
      setWorkoutsPorSemana(
        user.workoutsPorSemana ? String(user.workoutsPorSemana) : ""
      );
      // Campos adicionales que pueden no estar en la interfaz
      const userAny = user as any;
      setHeight(userAny.altura ? String(userAny.altura) : "");
      setWeight(userAny.peso ? String(userAny.peso) : "");
      setGender(userAny.genero || "");
    }
  }, [user]);

  const onSignout = async () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updates: any = {};

      if (nombre.trim()) updates.nombre = nombre.trim();
      if (age.trim()) updates.edad = parseInt(age) || undefined;
      if (height.trim()) updates.altura = parseFloat(height) || undefined;
      if (weight.trim()) updates.peso = parseFloat(weight) || undefined;
      if (gender) updates.genero = gender;
      if (objetivo) updates.objetivo = objetivo;
      if (experiencia) updates.experiencia = experiencia;
      if (workoutsPorSemana) updates.workoutsPorSemana = workoutsPorSemana;

      await updateUserFields(updates);
      setEditing(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0e0f13", "#10131b", "#151820"]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.brand}>Mi Perfil</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Ionicons name="settings-outline" size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
      >
        {/* PERSONAL INFO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
            {!editing && (
              <TouchableOpacity
                onPress={() => setEditing(true)}
                style={{ marginLeft: "auto" }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {nombre.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>{nombre || "Usuario"}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
              {experiencia && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{experiencia}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, !editing && { opacity: 0.6 }]}
              placeholder="Nombre completo"
              value={nombre}
              editable={editing}
              onChangeText={setNombre}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { opacity: 0.6 }]}
              placeholder="email@ejemplo.com"
              value={email}
              editable={false}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Edad</Text>
            <TextInput
              style={[styles.input, !editing && { opacity: 0.6 }]}
              placeholder="28"
              keyboardType="numeric"
              value={age}
              editable={editing}
              onChangeText={setAge}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput
              style={[styles.input, !editing && { opacity: 0.6 }]}
              placeholder="175"
              keyboardType="numeric"
              value={height}
              editable={editing}
              onChangeText={setHeight}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, !editing && { opacity: 0.6 }]}
              placeholder="75"
              keyboardType="numeric"
              value={weight}
              editable={editing}
              onChangeText={setWeight}
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>Género</Text>
            <View style={styles.optionsRow}>
              {["Masculino", "Femenino", "Otro"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.optionChip,
                    gender === g && styles.optionChipActive,
                    !editing && { opacity: 0.6 },
                  ]}
                  onPress={() => editing && setGender(g)}
                  disabled={!editing}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      gender === g && styles.optionChipTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {editing && (
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { flex: 1, backgroundColor: "#444" },
                ]}
                onPress={() => {
                  setEditing(false);
                  // Resetear valores
                  if (user) {
                    setNombre(user.nombre || "");
                    setAge(user.edad ? String(user.edad) : "");
                    const userAny = user as any;
                    setHeight(userAny.altura ? String(userAny.altura) : "");
                    setWeight(userAny.peso ? String(userAny.peso) : "");
                    setGender(userAny.genero || "");
                  }
                }}
                disabled={saving}
              >
                <Text style={styles.primaryBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.primaryText} />
                ) : (
                  <Text style={styles.primaryBtnText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* TRAINING GOALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="golf-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Objetivos de Entrenamiento</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Objetivo Principal</Text>
            <View style={styles.optionsRow}>
              {[
                "Hipertrofia",
                "Fuerza",
                "Resistencia",
                "Pérdida de Peso",
                "Fitness General",
              ].map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.optionChip,
                    objetivo === goal && styles.optionChipActive,
                  ]}
                  onPress={async () => {
                    setObjetivo(goal);
                    await updateUserFields({ objetivo: goal });
                  }}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      objetivo === goal && styles.optionChipTextActive,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nivel de Experiencia</Text>
            <View style={styles.optionsRow}>
              {["Principiante", "Intermedio", "Avanzado"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionChip,
                    experiencia === level && styles.optionChipActive,
                  ]}
                  onPress={async () => {
                    setExperiencia(level);
                    await updateUserFields({ experiencia: level });
                  }}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      experiencia === level && styles.optionChipTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Entrenamientos por Semana</Text>
            <View style={styles.optionsRow}>
              {["1 día", "2 días", "3 días", "4 días", "5 días"].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[
                    styles.optionChip,
                    workoutsPorSemana === days && styles.optionChipActive,
                  ]}
                  onPress={async () => {
                    setWorkoutsPorSemana(days);
                    await updateUserFields({ workoutsPorSemana: days });
                  }}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      workoutsPorSemana === days && styles.optionChipTextActive,
                    ]}
                  >
                    {days}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ACCOUNT INFO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Miembro desde</Text>
              <Text style={styles.infoValue}>
                {formatDate((user as any)?.createdAt)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Último acceso</Text>
              <Text style={styles.infoValue}>
                {formatDate((user as any)?.lastLoginAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="shield-outline" size={18} color="white" />
            <Text style={styles.actionText}>Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="cloud-download-outline" size={18} color="white" />
            <Text style={styles.actionText}>Exportar Datos</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSignout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
