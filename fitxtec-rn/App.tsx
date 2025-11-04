// App.tsx
import React, { useEffect, useRef } from "react";
import { NavigationContainer, DefaultTheme, CommonActions, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";
import LoginScreen from "./src/screens/Login";
import Tabs from "./src/navigation/Tabs";
import colors from "./src/theme/color";
import NotFoundScreen from "./src/screens/404Screen";

import { AuthProvider, useAuth } from "./src/services/AuthContext";
import SignUp1 from "./src/screens/SignUp1";
import SignUpTrainingScreen from "./src/screens/SignUpTraining";
import SignUpSettingsScreen from "./src/screens/SignUpSettingsScreen";
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg },
};

function RootNavigator() {
  const { user, loading } = useAuth();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);

  // Redirigir a Login cuando el usuario cierra sesión
  useEffect(() => {
    if (!loading && !user && navigationRef.current) {
      navigationRef.current.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} />
        <Stack.Screen name="SignUp1" component={SignUp1} />
        <Stack.Screen name="SignUpTraining" component={SignUpTrainingScreen} />
        <Stack.Screen name="SignUpSettings" component={SignUpSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </>
  );
}
