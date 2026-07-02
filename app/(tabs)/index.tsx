import { useAuth } from "@/context/AuthContext";
import { Biodata, useProfile } from "@/context/ProfileContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useSwipeNavigate } from "@/hooks/useSwipeNavigate";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Image, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#002045";
const SURFACE = "#f7fafc";
const OUTLINE_VARIANT = "#c4c6cf";
const ON_SURFACE_VARIANT = "#43474e";

// ── Info row ───────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, !value && styles.infoValueEmpty]} numberOfLines={2}>
      {value || "—"}
    </Text>
  </View>
);

// ── Form field ─────────────────────────────────────────────────────────────
const Field = ({
  label, value, onChangeText, placeholder, keyboardType, multiline,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; multiline?: boolean;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && { height: 72, textAlignVertical: "top" }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? label}
      placeholderTextColor="#94a1a8"
      keyboardType={keyboardType ?? "default"}
      multiline={multiline}
    />
  </View>
);

// ── Main screen ────────────────────────────────────────────────────────────
export default function BiodataScreen() {
  const { logout } = useAuth();
  const { biodata, saveBiodata, loading } = useProfile();
  const { showPickerOptions } = useImagePicker();
  const swipeHandlers = useSwipeNavigate(0); // tab index 0

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<Biodata>(biodata);

  const set = (key: keyof Biodata) => (val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const openEdit = () => {
    setForm(biodata);
    setModalVisible(true);
  };

  const handleSave = async () => {
    await saveBiodata(form);
    setModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert("Keluar", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar", style: "destructive",
        onPress: async () => { await logout(); router.replace("/"); },
      },
    ]);
  };

  // Upload foto langsung simpan ke biodata
  const handlePhotoUpload = () => {
    showPickerOptions(async (uri) => {
      const updated = { ...biodata, photo: uri };
      await saveBiodata(updated);
    });
  };

  // Upload foto di dalam modal form
  const handleFormPhotoUpload = () => {
    showPickerOptions((uri) => {
      setForm(prev => ({ ...prev, photo: uri }));
    });
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: "#fff" }} />;

  const isEmpty = !biodata.fullName;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Profil Akademik</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
          <Ionicons name="log-out-outline" size={22} color={ON_SURFACE_VARIANT} />
        </TouchableOpacity>
      </View>

      <ScrollView {...swipeHandlers} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Foto Profil */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarWrapper} onPress={handlePhotoUpload} activeOpacity={0.8}>
            {biodata.photo ? (
              <Image source={{ uri: biodata.photo }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {biodata.fullName ? biodata.fullName[0].toUpperCase() : "?"}
                </Text>
              </View>
            )}
            {/* Overlay kamera */}
            <View style={styles.cameraOverlay}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.profileName}>
            {biodata.fullName || "Nama Kamu"}
          </Text>
          {biodata.major ? (
            <View style={styles.majorBadge}>
              <Text style={styles.majorBadgeText}>{biodata.major}</Text>
            </View>
          ) : null}
          {biodata.gpa ? (
            <Text style={styles.gpaText}>IPK {biodata.gpa}</Text>
          ) : null}
        </View>

        {/* Empty state */}
        {isEmpty && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Profil masih kosong.</Text>
            <Text style={styles.emptySubText}>Tap Ubah Profil untuk mengisi data.</Text>
          </View>
        )}

        {/* Info List */}
        {!isEmpty && (
          <View style={styles.infoList}>
            <InfoRow label="Nama Lengkap"   value={biodata.fullName} />
            <InfoRow label="NIM"            value={biodata.nim} />
            <InfoRow label="Alamat Email"   value={biodata.email} />
            <InfoRow label="Nomor Telepon"  value={biodata.phone} />
            <InfoRow label="Alamat"         value={biodata.address} />
            <InfoRow label="Tanggal Lahir"  value={biodata.dob} />
            <InfoRow label="Jenis Kelamin"  value={biodata.gender} />
            <InfoRow label="Program Studi"  value={biodata.major} />
            <InfoRow label="Universitas"    value={biodata.university} />
            <InfoRow label="IPK"            value={biodata.gpa} />
          </View>
        )}

        {/* Tombol Edit */}
        <View style={styles.editBtnWrapper}>
          <TouchableOpacity style={styles.editBtn} onPress={openEdit} activeOpacity={0.85}>
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={styles.editBtnText}>Ubah Profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Edit */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ubah Profil</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Upload foto di dalam modal */}
            <View style={styles.modalPhotoSection}>
              <TouchableOpacity style={styles.modalAvatarWrapper} onPress={handleFormPhotoUpload} activeOpacity={0.8}>
                {form.photo ? (
                  <Image source={{ uri: form.photo }} style={styles.modalAvatarImage} />
                ) : (
                  <View style={styles.modalAvatarPlaceholder}>
                    <Ionicons name="person" size={36} color="#c4c6cf" />
                  </View>
                )}
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.modalPhotoHint}>Ketuk untuk ganti foto</Text>
            </View>

            <Field label="Nama Lengkap"   value={form.fullName}   onChangeText={set("fullName")} />
            <Field label="NIM"            value={form.nim}        onChangeText={set("nim")} keyboardType="number-pad" />
            <Field label="Email"          value={form.email}      onChangeText={set("email")} keyboardType="email-address" />
            <Field label="Telepon"        value={form.phone}      onChangeText={set("phone")} keyboardType="phone-pad" />
            <Field label="Alamat"         value={form.address}    onChangeText={set("address")} multiline />
            <Field label="Tanggal Lahir (cth. 14 Mei 2002)" value={form.dob} onChangeText={set("dob")} />
            <Field label="Jenis Kelamin"  value={form.gender}     onChangeText={set("gender")} />
            <Field label="Program Studi"  value={form.major}      onChangeText={set("major")} />
            <Field label="Universitas"    value={form.university} onChangeText={set("university")} />
            <Field label="IPK"            value={form.gpa}        onChangeText={set("gpa")} keyboardType="decimal-pad" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
    backgroundColor: "#fff",
  },
  topBarTitle: { fontSize: 20, fontWeight: "600", color: PRIMARY },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  // Avatar
  profileHeader: { alignItems: "center", paddingTop: 32, paddingBottom: 24 },
  avatarWrapper: { marginBottom: 16, position: "relative" },
  avatarImage: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: PRIMARY,
  },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: PRIMARY,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontSize: 38, fontWeight: "700", color: "#fff" },
  cameraOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  profileName: { fontSize: 26, fontWeight: "700", color: PRIMARY, marginBottom: 8 },
  majorBadge: {
    backgroundColor: PRIMARY + "12", paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 999, marginBottom: 6,
  },
  majorBadgeText: { fontSize: 13, fontWeight: "500", color: PRIMARY },
  gpaText: { fontSize: 13, color: ON_SURFACE_VARIANT },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 16, paddingHorizontal: 32 },
  emptyText: { fontSize: 15, fontWeight: "600", color: ON_SURFACE_VARIANT, marginBottom: 4 },
  emptySubText: { fontSize: 13, color: "#94a1a8", textAlign: "center" },

  // Info list
  infoList: { paddingHorizontal: 16 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: SURFACE,
    gap: 12,
  },
  infoLabel: {
    fontSize: 13, fontWeight: "500",
    color: ON_SURFACE_VARIANT,
    flex: 1,
  },
  infoValue: {
    fontSize: 13, fontWeight: "600",
    color: PRIMARY,
    flex: 1.4,
    textAlign: "right",
  },
  infoValueEmpty: { color: "#94a1a8" },

  // Edit button
  editBtnWrapper: { paddingHorizontal: 16, marginTop: 32 },
  editBtn: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingVertical: 14, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 8,
  },
  editBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  // Modal
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
  },
  modalCancel: { fontSize: 15, color: ON_SURFACE_VARIANT },
  modalTitle: { fontSize: 16, fontWeight: "600", color: PRIMARY },
  modalSave: { fontSize: 15, fontWeight: "700", color: PRIMARY },
  modalBody: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 20 },

  modalPhotoSection: { alignItems: "center", marginBottom: 8 },
  modalAvatarWrapper: { position: "relative", marginBottom: 8 },
  modalAvatarImage: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: PRIMARY,
  },
  modalAvatarPlaceholder: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#f1f4f6",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: OUTLINE_VARIANT,
  },
  modalPhotoHint: { fontSize: 12, color: "#94a1a8" },

  fieldWrapper: { gap: 6 },
  fieldLabel: {
    fontSize: 10, fontWeight: "600", color: ON_SURFACE_VARIANT,
    letterSpacing: 1.2, textTransform: "uppercase",
  },
  fieldInput: {
    borderBottomWidth: 1, borderBottomColor: OUTLINE_VARIANT,
    paddingVertical: 8, fontSize: 15, color: "#181c1e",
  },
});
