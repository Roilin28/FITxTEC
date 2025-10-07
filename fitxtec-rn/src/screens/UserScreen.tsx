import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import colors from "../theme/color";
import { userStyles as styles } from "../theme/userStyles";
import { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { useAuth } from "../services/AuthContext";
import { Picker } from "@react-native-picker/picker";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Tabs: undefined;
};

export default function UserScreen() {
  const [reminders, setReminders] = useState(true);
  const [progress, setProgress] = useState(true);
  const [rest, setRest] = useState(false);
  const [celebrations, setCelebrations] = useState(true);

  // Campos de perfil
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [workoutsPorSemana, setWorkoutsPorSemana] = useState("");
  const [unidadPeso, setUnidadPeso] = useState("");
  const [unidadDistancia, setUnidadDistancia] = useState("");

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut, updateUserFields } = useAuth();

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      setAge(user.edad ? String(user.edad) : "");
      setObjetivo(user.objetivo || "");
      setExperiencia(user.experiencia || "");
      setWorkoutsPorSemana(user.workoutsPorSemana ? String(user.workoutsPorSemana) : "");
      if (user.unidadPeso) setUnidadPeso(user.unidadPeso);
      if (user.unidadDistancia) setUnidadDistancia(user.unidadDistancia);
    }
  }, [user]);

  const onSignout = () => {
    signOut();
    navigation.navigate("Login" as keyof RootStackParamList);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.brand}>FITxTEC</Text>
        <TouchableOpacity style={styles.profileBtn}>
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
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{nombre.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.profileName}>{nombre}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{experiencia}</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={nombre}
              accessibilityState={{ disabled: true }}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john.doe@example.com"
              value={email}
              accessibilityState={{ disabled: true }}
              autoCapitalize="none"
            />
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="28"
              keyboardType="numeric"
              value={age}
              accessibilityState={{ disabled: true }}
            />
          </View>
        </View>

        {/* TRAINING GOALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="golf-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Training Goals</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Primary Goal</Text>
            <View style={styles.input}>
              <Picker
                selectedValue={objetivo}
                onValueChange={async (itemValue: string) => {
                  setObjetivo(itemValue);
                  await updateUserFields({ objetivo: itemValue });
                }}
                style={styles.input}
              >
              <Picker.Item label="Hypertrophy" value="Hypertrophy" />
              <Picker.Item label="Strength" value="Strength" />
              <Picker.Item label="Endurance" value="Endurance" />
              <Picker.Item label="Weight Loss" value="Weight Loss" />
              <Picker.Item label="General Fitness" value="General Fitness" />
              </Picker>
            </View>
            <Text style={styles.label}>Experience Level</Text>
            <View style={styles.input}>
              <Picker
                selectedValue={experiencia}
                onValueChange={async (itemValue: string) => {
                  setExperiencia(itemValue);
                  await updateUserFields({ experiencia: itemValue });
                }}
                style={styles.input}
              >
              <Picker.Item label="Beginner" value="Beginner" />
              <Picker.Item label="Intermediate" value="Intermediate" />
              <Picker.Item label="Advanced" value="Advanced" />
              </Picker>
            </View>
            <Text style={styles.label}>Workouts per Week</Text>
            <Picker
              selectedValue={workoutsPorSemana}
              onValueChange={async (itemValue: string) => {
                setWorkoutsPorSemana(itemValue);
                await updateUserFields({ workoutsPorSemana: itemValue });
              }}
              style={styles.input}
            >
              <Picker.Item label="1 day" value="1 day" />
              <Picker.Item label="2 days" value="2 days" />
              <Picker.Item label="3 days" value="3 days" />
              <Picker.Item label="4 days" value="4 days" />
              <Picker.Item label="5 days" value="5 days" />
              </Picker>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight Unit</Text>
            <Picker
              selectedValue={unidadPeso}
              onValueChange={async (itemValue: string) => {
                setUnidadPeso(itemValue);
                await updateUserFields({ unidadPeso: itemValue });
              }}
              style={styles.input}
            >
              <Picker.Item label="Kilograms (kg)" value="kg" />
              <Picker.Item label="Pounds (lbs)" value="lbs" />
              </Picker>
            <Text style={styles.label}>Distance Unit</Text>
            <Picker
              selectedValue={unidadDistancia}
              onValueChange={async (itemValue: string) => {
                setUnidadDistancia(itemValue);
                await updateUserFields({ unidadDistancia: itemValue });
              }}
              style={styles.input}
            >
              <Picker.Item label="Kilometers (km)" value="km" />
              <Picker.Item label="Miles (mi)" value="mi" />
              </Picker>
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Notifications & Reminders</Text>
          </View>

          {[
            { label: "Workout Reminders", state: reminders, set: setReminders },
            { label: "Progress Updates", state: progress, set: setProgress },
            { label: "Rest Day Reminders", state: rest, set: setRest },
            {
              label: "PR Celebrations",
              state: celebrations,
              set: setCelebrations,
            },
          ].map((item, index) => (
            <View key={index} style={styles.switchRow}>
              <Text style={styles.switchLabel}>{item.label}</Text>
              <Switch
                value={item.state}
                onValueChange={item.set}
                thumbColor={item.state ? colors.primary : "#888"}
                trackColor={{ false: "#444", true: "#9EFF0044" }}
              />
            </View>
          ))}
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="shield-outline" size={18} color="white" />
            <Text style={styles.actionText}>Privacy Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="cloud-download-outline" size={18} color="white" />
            <Text style={styles.actionText}>Data Export</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onSignout}
            style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}