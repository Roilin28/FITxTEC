// App.tsx
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/screens/Login";
import Tabs from "./src/navigation/Tabs";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import RoutinesScreen from "./src/screens/RoutinesScreen";
import colors from "./src/theme/color";
import NotFoundScreen from "./src/screens/404Screen";
import UserScreen from "./src/screens/UserScreen";
import CalendarScreen from "./src/screens/CalendarScreen";

const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="User" component={UserScreen} />
          <Stack.Screen name="NotFound" component={NotFoundScreen} />
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="Routines" component={RoutinesScreen} />
          <Stack.Screen name="RoutineDetails" component={RoutinesScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
