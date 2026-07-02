import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";
const ON_SURFACE_VARIANT = "#43474e";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [focused, setFocused]           = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    const result = await login(username.trim(), password.trim());
    setLoading(false);

    if (result.success) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Gagal", result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>AP</Text>
          </View>
          <Text style={styles.appTitle}>Profil Akademik</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>NAMA PENGGUNA / NIM</Text>
            <View style={[styles.underline, focused === "u" && styles.underlineFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Masukkan NIM kamu"
                placeholderTextColor="#94a1a8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                onFocus={() => setFocused("u")}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>KATA SANDI</Text>
            <View style={[styles.underline, focused === "p" && styles.underlineFocused]}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#94a1a8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocused("p")}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={ON_SURFACE_VARIANT}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.signInText}>
              {loading ? "Memproses..." : "Masuk"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Register */}
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => router.push("/register" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.registerText}>Buat Akun Baru</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Butuh bantuan?{" "}
            <Text style={styles.footerLink}>Dukungan IT</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1, justifyContent: "center",
    alignItems: "center", paddingHorizontal: 32,
  },
  brand: { alignItems: "center", marginBottom: 48 },
  logoBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: PRIMARY, justifyContent: "center",
    alignItems: "center", marginBottom: 16,
  },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  appTitle: { fontSize: 20, fontWeight: "600", color: PRIMARY },

  form: { width: "100%", gap: 24 },
  fieldWrapper: { gap: 6 },
  label: {
    fontSize: 10, fontWeight: "600", color: ON_SURFACE_VARIANT,
    letterSpacing: 1.5, textTransform: "uppercase",
  },
  underline: {
    flexDirection: "row", alignItems: "center",
    borderBottomWidth: 1, borderBottomColor: OUTLINE_VARIANT, paddingBottom: 8,
  },
  underlineFocused: { borderBottomColor: PRIMARY, borderBottomWidth: 1.5 },
  input: { fontSize: 14, color: "#181c1e", paddingVertical: 4, flex: 1 },
  eyeBtn: { paddingLeft: 8 },

  signInBtn: {
    marginTop: 8, backgroundColor: PRIMARY,
    borderRadius: 999, paddingVertical: 14, alignItems: "center",
  },
  signInText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  dividerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: OUTLINE_VARIANT },
  dividerText: { fontSize: 12, color: ON_SURFACE_VARIANT },

  registerBtn: {
    borderWidth: 1.5, borderColor: PRIMARY,
    borderRadius: 999, paddingVertical: 13, alignItems: "center",
  },
  registerText: { color: PRIMARY, fontSize: 14, fontWeight: "600" },

  footer: { position: "absolute", bottom: 32 },
  footerText: { fontSize: 12, color: ON_SURFACE_VARIANT + "99" },
  footerLink: { color: PRIMARY + "cc" },
});
