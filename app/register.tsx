import { RegisterData, useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";
const ON_SURFACE_VARIANT = "#43474e";

const Field = ({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, rightEl,
  focused, onFocus, onBlur,
}: {
  label: string; value: string;
  onChangeText: (t: string) => void;
  placeholder?: string; secureTextEntry?: boolean;
  keyboardType?: any; rightEl?: React.ReactNode;
  focused?: boolean; onFocus?: () => void; onBlur?: () => void;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.label}>{label.toUpperCase()}</Text>
    <View style={[styles.underline, focused && styles.underlineFocused]}>
      <TextInput
        style={[styles.input, { flex: 1 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#94a1a8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType ?? "default"}
        autoCapitalize="none"
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {rightEl}
    </View>
  </View>
);

export default function RegisterScreen() {
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterData>({
    username: "", password: "", confirmPassword: "",
    fullName: "", major: "",
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [focused, setFocused]         = useState<string | null>(null);

  const set = (k: keyof RegisterData) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleRegister = async () => {
    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (result.success) {
      Alert.alert("Berhasil! 🎉", result.message, [
        { text: "Login Sekarang", onPress: () => router.replace("/login" as any) },
      ]);
    } else {
      Alert.alert("Gagal", result.message);
    }
  };

  // Password strength indicator
  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Terlalu pendek", color: "#ba1a1a", width: "25%" };
    if (p.length < 8) return { label: "Lemah", color: "#e67e22", width: "50%" };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Kuat", color: "#16a34a", width: "100%" };
    return { label: "Sedang", color: "#d97706", width: "75%" };
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>AP</Text>
            </View>
            <Text style={styles.title}>Buat Akun</Text>
            <Text style={styles.subtitle}>Daftarkan NIM kamu untuk mulai</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            <Field
              label="Nama Lengkap"
              value={form.fullName}
              onChangeText={set("fullName")}
              placeholder="Masukkan nama lengkap"
              focused={focused === "name"}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
            />

            <Field
              label="NIM (Username)"
              value={form.username}
              onChangeText={set("username")}
              placeholder="Masukkan NIM"
              keyboardType="default"
              focused={focused === "nim"}
              onFocus={() => setFocused("nim")}
              onBlur={() => setFocused(null)}
            />

            <Field
              label="Program Studi / Jurusan"
              value={form.major}
              onChangeText={set("major")}
              placeholder="Contoh: Teknik Informatika"
              focused={focused === "major"}
              onFocus={() => setFocused("major")}
              onBlur={() => setFocused(null)}
            />

            {/* Password */}
            <View style={styles.fieldWrapper}>
            <Text style={styles.label}>KATA SANDI</Text>
              <View style={[styles.underline, focused === "pass" && styles.underlineFocused]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.password}
                  onChangeText={set("password")}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor="#94a1a8"
                  secureTextEntry={!showPass}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPass ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={ON_SURFACE_VARIANT}
                  />
                </TouchableOpacity>
              </View>
              {/* Strength bar */}
              {strength && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBg}>
                    <View style={[
                      styles.strengthBarFill,
                      { width: strength.width as any, backgroundColor: strength.color }
                    ]} />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>KONFIRMASI KATA SANDI</Text>
              <View style={[styles.underline, focused === "confirm" && styles.underlineFocused]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={form.confirmPassword}
                  onChangeText={set("confirmPassword")}
                  placeholder="Ulangi kata sandi"
                  placeholderTextColor="#94a1a8"
                  secureTextEntry={!showConfirm}
                  onFocus={() => setFocused("confirm")}
                  onBlur={() => setFocused(null)}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={ON_SURFACE_VARIANT}
                  />
                </TouchableOpacity>
              </View>
              {/* Match indicator */}
              {form.confirmPassword.length > 0 && (
                <Text style={{
                  fontSize: 11, marginTop: 4,
                  color: form.password === form.confirmPassword ? "#16a34a" : "#ba1a1a"
                }}>
                  {form.password === form.confirmPassword ? "✓ Kata sandi cocok" : "✗ Kata sandi tidak cocok"}
                </Text>
              )}
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitText}>
                {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              </Text>
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.replace("/login" as any)}
            >
              <Text style={styles.loginLinkText}>
                Sudah punya akun?{" "}
                <Text style={{ color: PRIMARY, fontWeight: "700" }}>Masuk</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
  },
  backBtn: {},
  backText: { fontSize: 14, color: ON_SURFACE_VARIANT, fontWeight: "500" },

  scrollContent: {
    paddingHorizontal: 32, paddingTop: 32, paddingBottom: 48,
  },

  brand: { alignItems: "center", marginBottom: 40 },
  logoBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: PRIMARY, justifyContent: "center",
    alignItems: "center", marginBottom: 16,
  },
  logoText: { color: "#fff", fontSize: 18, fontWeight: "700", letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: "700", color: PRIMARY, marginBottom: 6 },
  subtitle: { fontSize: 13, color: ON_SURFACE_VARIANT },

  form: { gap: 24 },
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
  input: { fontSize: 14, color: "#181c1e", paddingVertical: 4 },
  eyeBtn: { paddingLeft: 8 },

  strengthContainer: {
    flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6,
  },
  strengthBarBg: {
    flex: 1, height: 3, backgroundColor: "#e2e8f0",
    borderRadius: 999, overflow: "hidden",
  },
  strengthBarFill: { height: "100%", borderRadius: 999 },
  strengthLabel: { fontSize: 11, fontWeight: "600", minWidth: 70 },

  submitBtn: {
    marginTop: 8, backgroundColor: PRIMARY,
    borderRadius: 999, paddingVertical: 14, alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  loginLink: { alignItems: "center", paddingVertical: 4 },
  loginLinkText: { fontSize: 13, color: ON_SURFACE_VARIANT },
});
