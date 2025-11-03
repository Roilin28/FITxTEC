import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../theme/color";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { UsuarioIngresar } from "../services/SignUp";
import { signUpWithEmailPassword } from "../services/SignUp";

type RootStackParamList = {
  SignUpPersonal: undefined;
  SignUpTraining: { usuario: UsuarioIngresar };
  SignUpSettings: undefined;
  Login: undefined;
};

export default function SignUp1() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [name, setName] = useState("");
  // DOB se moved to SignUpTraining
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onNext = async () => {
    if (!name) {
      alert("Please enter your full name.");
      return;
    }

    if (!email ) {
      alert("Please enter a valid email.");
      return;
    }
    if (!password) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    try {
  const usuario = await signUpWithEmailPassword(email, password, name);
      if (!usuario) {
        alert("Sign up failed. Please try again.");
        return;
      }
  navigation.navigate("SignUpTraining", { usuario });
  console.log({ name, email, password });
    } catch (error) {
      alert("An error occurred during sign up.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>FITxTEC</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>

          {/* Date of Birth moved to SignUpTraining */}

          {/* Email */}
          <View style={[styles.inputWrapper, { marginTop: 12 }]}>
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

          <TouchableOpacity onPress={onNext} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const RADIUS = 16;
const ROW_H = 44;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    backgroundColor: colors.bg,
  },
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
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.card,
    borderRadius: RADIUS,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
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
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: ROW_H,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  primaryBtnText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
