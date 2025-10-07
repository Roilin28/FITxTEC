import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../theme/color";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { loginWithEmailPassword } from "../services/login";
import { useAuth } from "../services/AuthContext";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Tabs: undefined;
};

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithEmailPassword(email, password);
      if (!user) {
        setError("Credenciales inválidas");
      } else {
        console.log("Login: ", user, user.id);
        setUser(user);
        navigation.reset({
          index: 0,
          routes: [{ name: "Tabs" as keyof RootStackParamList }],
        });
      }
    } catch (e: any) {
      console.error(e);
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    // TODO: implementar Google (expo-auth-session o Firebase)
    console.log("Google sign-in");
  };

  const onSignup = () => {
    // TODO: navegar a SignUp
    console.log("Go to SignUp");
    navigation.navigate("SignUp1" as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Título */}
        <Text style={styles.title}>FITxTEC</Text>
        <Text style={styles.subtitle}>Track your fitness progress</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Email */}
          <View style={styles.inputWrapper}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {/* Botón Login */}
          <TouchableOpacity
            onPress={onLogin}
            activeOpacity={0.9}
            style={styles.primaryBtn}
            accessibilityRole="button"
            accessibilityLabel="Login"
          >
            <Text style={styles.primaryBtnText}>{loading ? "Cargando..." : "Login"}</Text>
          </TouchableOpacity>

          {error && (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}

          {/* Separador */}
          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR CONTINUE WITH</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            onPress={onGoogle}
            activeOpacity={0.9}
            style={styles.googleBtn}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <FontAwesome
              name="google"
              size={18}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={onSignup} accessibilityRole="link">
              <Text style={styles.signupLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const RADIUS = 16;
const ROW_H = 44; // misma altura para inputs y botones

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // centra el “stack” vertical y da espacio arriba como en el mockup
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    backgroundColor: colors.bg,
  },

  // título verde y subtítulo
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

  // card centrada, ancho similar al mockup, borde y radio suaves
  card: {
    width: "100%",
    maxWidth: 360, // <- hace que se vea “estrecho” como tu diseño
    backgroundColor: colors.card,
    borderRadius: RADIUS,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // INPUTS
  inputWrapper: {
    backgroundColor: colors.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: ROW_H,
    justifyContent: "center",
  },
  input: {
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 15,
  },

  // BOTÓN LOGIN (mismo alto que inputs)
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: ROW_H,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },

  // Separador fino con “pill” al centro
  separatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.border },
  separatorText: {
    color: colors.text,
    fontSize: 10,
    letterSpacing: 1,
    marginHorizontal: 10,
    backgroundColor: colors.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  // Botón Google oscuro, misma altura
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b1e27",
    borderRadius: 12,
    height: ROW_H,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleText: { color: colors.text, fontSize: 15, fontWeight: "600" },

  // footer
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 18,
    marginBottom: 4,
  },
  footerText: { color: colors.textMuted },
  signupLink: { color: colors.primary, fontWeight: "700" },
  errorText: {
    color: "#ff5a5f",
    textAlign: "center",
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
  },
});
