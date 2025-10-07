// App.tsx
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./src/screens/Login";
import Tabs from "./src/Navigation/Tabs";
import colors from "./src/theme/color";
import NotFoundScreen from "./src/screens/404Screen";
import { AuthProvider } from "./src/services/AuthContext";
import SignUp1 from "./src/screens/SignUp1";
import SignUpTrainingScreen from "./src/screens/SignUpTraining";
import SignUpSettingsScreen from "./src/screens/SignUpSettingsScreen";
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="SignUp1" component={SignUp1} />
            <Stack.Screen name="SignUpTraining" component={SignUpTrainingScreen} />
            <Stack.Screen name="SignUpSettings" component={SignUpSettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </>
  );
}
