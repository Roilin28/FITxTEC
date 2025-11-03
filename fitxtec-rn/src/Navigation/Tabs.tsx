// src/navigation/Tabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../theme/color";

import HomeScreen from "../screens/HomeScreen";
import WorkoutMenuScreen from "../screens/WorkoutMenuScreen";
import ProgressScreen from "../screens/ProgressScreen";
import RoutinesScreen from "../screens/RoutinesScreen";
import UserScreen from "../screens/UserScreen";
import WorkoutScreen from "../screens/WorkoutScreen";
import RoutineDetailsScreen from "../screens/RoutineDetailsScreen";
import CalendarScreen from "../screens/CalendarScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack Navigator for Home tab
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Routines tab
function RoutinesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RoutinesMain" component={RoutinesScreen} />
      <Stack.Screen name="RoutineDetails" component={RoutineDetailsScreen} />
    </Stack.Navigator>
  );
}

// Stack Navigator for Workout tab
function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WorkoutMain" component={WorkoutMenuScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutScreen} />
    </Stack.Navigator>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size, focused }) => {
          switch (route.name) {
            case "HomeTab":
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              );
            case "WorkoutTab":
              return (
                <MaterialCommunityIcons
                  name="dumbbell"
                  size={size}
                  color={color}
                />
              );
            case "RoutinesTab":
              return (
                <Ionicons
                  name={focused ? "grid" : "grid-outline"}
                  size={size}
                  color={color}
                />
              );
            case "ProgressTab":
              return (
                <Ionicons
                  name={focused ? "stats-chart" : "stats-chart-outline"}
                  size={size}
                  color={color}
                />
              );
            case "ProfileTab":
              return (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={size}
                  color={color}
                />
              );
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="RoutinesTab" component={RoutinesStack} />
      <Tab.Screen name="WorkoutTab" component={WorkoutStack} />
      <Tab.Screen name="ProgressTab" component={ProgressScreen} />
      <Tab.Screen name="ProfileTab" component={UserScreen} />
    </Tab.Navigator>
  );
}
