import React, { useState } from "react";
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
import colors from "../theme/color";
import { userStyles as styles } from "../theme/userStyles";


export default function UserScreen() {
  const [reminders, setReminders] = useState(true);
  const [progress, setProgress] = useState(true);
  const [rest, setRest] = useState(false);
  const [celebrations, setCelebrations] = useState(true);

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
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View>
              <Text style={styles.profileName}>John Doe</Text>
              <Text style={styles.profileEmail}>john.doe@example.com</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Intermediate</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="John Doe" />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john.doe@example.com"
            />
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="28"
              keyboardType="numeric"
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
            <TextInput style={styles.input} placeholder="Hypertrophy" />
            <Text style={styles.label}>Experience Level</Text>
            <TextInput style={styles.input} placeholder="Intermediate" />
            <Text style={styles.label}>Workouts per Week</Text>
            <TextInput style={styles.input} placeholder="4 days" />
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
            <TextInput style={styles.input} placeholder="Kilograms (kg)" />
            <Text style={styles.label}>Distance Unit</Text>
            <TextInput style={styles.input} placeholder="Kilometers" />
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

          <TouchableOpacity style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="white" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}