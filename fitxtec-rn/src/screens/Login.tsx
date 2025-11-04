import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import colors from "../theme/color";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { loginWithEmailPassword } from "../services/login";
import { useAuth } from "../services/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Tabs: undefined;
  SignUp1: undefined;
  SignUpTraining: { usuario: any };
  SignUpSettings: { usuario: any };
};

export default function LoginScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleExtra = (Constants.expoConfig?.extra as any)?.google ?? {};
  const demoAuth = (Constants.expoConfig?.extra as any)?.demoAuth === true;
  const isExpoGo = Constants.appOwnership === "expo";
  const hasAndroidClientId =
    typeof googleExtra.androidClientId === "string" &&
    !googleExtra.androidClientId?.startsWith("REPLACE_ME_");
  const proxyRedirectUri = isExpoGo
    ? makeRedirectUri({ useProxy: true } as any)
    : undefined;
  const expectedAuthProxy = `https://auth.expo.io/@${
    (Constants as any)?.expoConfig?.owner ??
    (Constants as any)?.expoConfig?.username ??
    "unknown"
  }/${(Constants as any)?.expoConfig?.slug ?? "app"}`;
  let usernameHint: string | undefined;
  try {
    const host = proxyRedirectUri?.split("://")[1]?.split("/")[0] || "";
    const firstLabel = host.split(".")[0] || "";
    const parts = firstLabel.split("-");
    if (parts.length >= 3) usernameHint = parts[1];
  } catch {}
  const expectedAuthProxyHint = usernameHint
    ? `https://auth.expo.io/@${usernameHint}/${
        (Constants as any)?.expoConfig?.slug ?? "app"
      }`
    : undefined;
  const safeTail = (s?: string) =>
    typeof s === "string" && s.length > 8 ? s.slice(-8) : s ? s : "none";
  const computedProxyRedirect =
    isExpoGo && proxyRedirectUri
      ? `${expectedAuthProxy}?returnUrl=${encodeURIComponent(proxyRedirectUri)}`
      : undefined;
  const googleConfig: any =
    Platform.OS === "android" && (isExpoGo || !hasAndroidClientId)
      ? {
          expoClientId: googleExtra.expoClientId,
          androidClientId: googleExtra.expoClientId,
          webClientId: googleExtra.webClientId,
          redirectUri: expectedAuthProxy,
          scopes: ["openid", "profile", "email"],
        }
      : {
          expoClientId: googleExtra.expoClientId,
          androidClientId: googleExtra.androidClientId,
          iosClientId: googleExtra.iosClientId,
          webClientId: googleExtra.webClientId,
          scopes: ["openid", "profile", "email"],
        };

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  const completeLoginWithEmail = async (email: string, name?: string) => {
    const q = query(collection(db, "usuarios"), where("email", "==", email));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const doc = snap.docs[0];
      const u = { id: doc.id, ...(doc.data() as any) };
      setUser(u);
      navigation.reset({ index: 0, routes: [{ name: "Tabs" as never }] });
      return;
    }

    const randomPwd = Math.random().toString(36).slice(2, 10);
    const minimalUser = {
      email,
      contrasenna: randomPwd,
      nombre: name ?? "",
      createdAt: new Date(),
    };
    const docRef = await addDoc(collection(db, "usuarios"), minimalUser);

    navigation.navigate("SignUpTraining", {
      usuario: { id: docRef.id, ...minimalUser },
    } as any);
  };

  const handleGoogleSuccess = async (accessToken: string) => {
    try {
      const profileRes = await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const profile = await profileRes.json();

      const emailFromGoogle: string | undefined = profile?.email;
      if (!emailFromGoogle) {
        setError("No se pudo obtener el email de Google");
        return;
      }
      await completeLoginWithEmail(emailFromGoogle, profile?.name ?? undefined);
    } catch (e) {
      console.error(e);
      setError("Error al iniciar con Google");
    }
  };

  useEffect(() => {
    if (response?.type === "success") {
      const accessToken = response.authentication?.accessToken as
        | string
        | undefined;
      if (accessToken) {
        handleGoogleSuccess(accessToken);
      }
    } else if (response?.type) {
    }
  }, [response]);

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
        await setUser(user);
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

  const onGoogle = async () => {
    try {
      if (demoAuth) {
        // Modo DEMO: sin OAuth real. Usa un email fijo para simular “Continuar con Google”.
        const demoEmail = "isasctopz@gmail.com";
        const demoName = "Isaac Rojas";
        await completeLoginWithEmail(demoEmail, demoName);
        return;
      }
      const useProxy =
        isExpoGo || (Platform.OS === "android" && !hasAndroidClientId);
      const res = await promptAsync({ useProxy });
      if (res?.type === "success") {
        const token = res.authentication?.accessToken;
        if (token) await handleGoogleSuccess(token);
      }
    } catch (e) {
      console.error(e);
      setError("Error al iniciar con Google");
    }
  };

  const onApple = () => {
    // TODO: implementar Apple Sign In (expo-apple-authentication)
    console.log("Apple sign-in");
  };

  const onSignup = () => {
    navigation.navigate("SignUp1" as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                <Text style={styles.primaryBtnText}>
                  {loading ? "Cargando..." : "Login"}
                </Text>
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
                <Text style={styles.googleText}>
                  {demoAuth ? "Continue with Google" : "Continue with Google"}
                </Text>
              </TouchableOpacity>

              {/* Apple (solo iOS) */}
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  onPress={onApple}
                  activeOpacity={0.9}
                  style={[styles.googleBtn, { marginTop: 12 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Continue with Apple"
                >
                  <FontAwesome
                    name="apple"
                    size={18}
                    color={colors.text}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.googleText}>Continue with Apple</Text>
                </TouchableOpacity>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity onPress={onSignup} accessibilityRole="link">
                  <Text style={styles.signupLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const RADIUS = 16;
const ROW_H = 44; // misma altura para inputs y botones

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  // centra el "stack" vertical y da espacio arriba como en el mockup
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
    minHeight: "100%",
    justifyContent: "center",
  },

  // título verde y subtítulo
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 32,
  },

  // card centrada, ancho similar al mockup, borde y radio suaves
  card: {
    width: "100%",
    maxWidth: 360,
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
