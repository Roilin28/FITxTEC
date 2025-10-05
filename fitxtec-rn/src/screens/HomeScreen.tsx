import React, { } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.brand}>FITxTEC</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("User")}
        >
          <Ionicons name="person-circle-outline" size={28} color="#9EFF00" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { flexGrow: 1, justifyContent: "center" },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="calendar-outline" size={22} color="#9EFF00" />
          <Text style={styles.headerText}>Today&apos;s Workout</Text>
        </View>

        {/* Workout Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Push Day - Upper Body</Text>

          <View style={styles.statusBox}>
            <Text style={styles.statusText}>In Progress</Text>
          </View>

          <Text style={styles.subtitle}>4 exercises • 45 min estimated</Text>

          {/* Goals */}
          <View style={styles.goalBox}>
            <View style={styles.goalHeader}>
              <Ionicons name="bullseye-outline" size={20} color="#9EFF00" />
              <Text style={styles.goalTitle}>This Week&apos;s Goals</Text>
            </View>

            <Text style={styles.goalSubtitle}>Complete 4 workouts</Text>
            <Text style={styles.goalProgressText}>2/4</Text>

            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill} />
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.startButton}>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "black",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },
  brand: {
    color: "#9EFF00",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  profileBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 15,
  },
  headerText: { color: "#ccc", fontSize: 16, marginLeft: 8 },
  card: {
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  title: { color: "white", fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  statusBox: {
    backgroundColor: "#2b2b2b",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 8,
  },
  statusText: { color: "#ddd", fontSize: 13 },
  subtitle: { color: "#888", fontSize: 13, marginBottom: 20 },
  goalBox: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  goalHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  goalTitle: { color: "white", fontWeight: "600", marginLeft: 6 },
  goalSubtitle: { color: "#aaa", fontSize: 13 },
  goalProgressText: { color: "#777", fontSize: 12, marginBottom: 6 },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "#444",
    borderRadius: 3,
  },
  progressBarFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#9EFF00",
    borderRadius: 3,
  },
  startButton: {
    backgroundColor: "#9EFF00",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  startButtonText: {
    color: "black",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#9EFF00",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: { color: "black", fontWeight: "700", fontSize: 15 },
  iconButton: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
