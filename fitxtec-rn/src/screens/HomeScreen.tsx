import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MotiView } from "moti";
import styles from "../theme/homeStyles";
import { local_Notification_Start_Workout } from "../services/notifications";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  User: undefined;
};

const HomeScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 150 }}
          style={styles.hero}
        >
          <View>
            <Text style={styles.greeting}>Good morning, John Doe</Text>
            <Text style={styles.motivation}>
              Ready to crush your goals today?
            </Text>
          </View>
        </MotiView>

        {/* Weekly Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: "70%" }]} />
          </View>
          <Text style={styles.progressLabel}>3 of 4 workouts completed</Text>
        </View>

        {/* AI Recommendation */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          style={styles.aiCard}
        >
          <Ionicons name="sparkles-outline" size={22} color="#7EE300" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.aiTitle}>AI Recommendation</Text>
            <Text style={styles.aiText}>
              Add 5 min of warm-up to boost your muscle activation.
            </Text>
          </View>
        </MotiView>

        {/* Upcoming Workouts (Horizontal Carousel) */}
        <View style={styles.daysSection}>
          <Text style={styles.sectionTitle}>Upcoming Workouts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
              <View key={i} style={styles.dayCard}>
                <Text style={styles.dayText}>{day}</Text>
                <Ionicons name="checkmark-circle" size={22} color="#7EE300" />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Today’s Workout */}
        <View style={styles.workoutContainer}>
          <View style={styles.header}>
            <Ionicons name="calendar-outline" size={22} color="#7EE300" />
            <Text style={styles.headerText}>Today&apos;s Workout</Text>
          </View>

          <Text style={styles.title}>Push Day - Upper Body</Text>
          <Text style={styles.subtitle}>4 exercises • 45 min estimated</Text>

          <TouchableOpacity 
          style={styles.startButton}
          onPress={() => local_Notification_Start_Workout()}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Choose Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="calendar-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
