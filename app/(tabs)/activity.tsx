import { ActivityItem, useProfile } from "@/context/ProfileContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useSwipeNavigate } from "@/hooks/useSwipeNavigate";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert, FlatList, Image, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";
const ON_SURFACE_VARIANT = "#43474e";
const SURFACE_LOW = "#f1f4f6";
const SECONDARY_CONTAINER = "#d5e0f7";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const DAY_SHORT: Record<string, string> = {
  Senin: "Sen", Selasa: "Sel", Rabu: "Rab",
  Kamis: "Kam", Jumat: "Jum", Sabtu: "Sab", Minggu: "Min",
};

const getTodayName = (): string => {
  const map = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return map[new Date().getDay()];
};

const Field = ({ label, value, onChangeText, placeholder, keyboardType }: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
    <TextInput
      style={styles.fieldInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder ?? label}
      placeholderTextColor="#94a1a8"
      keyboardType={keyboardType ?? "default"}
    />
  </View>
);

type ActForm = Omit<ActivityItem, "id">;
const EMPTY_FORM: ActForm = {
  day: "Senin", time: "", title: "", description: "", location: "", photo: "",
};

export default function ActivityScreen() {
  const { activities, addActivity, updateActivity, deleteActivity } = useProfile();
  const { showPickerOptions } = useImagePicker();
  const swipeHandlers = useSwipeNavigate(2); // tab index 2

  const [selectedDay, setSelectedDay] = useState<string>(getTodayName());
  const [modal, setModal]             = useState(false);
  const [form, setForm]               = useState<ActForm>(EMPTY_FORM);
  const [editingId, setEditingId]     = useState<string | null>(null);

  const set = (k: keyof ActForm) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const dayActivities = [...activities]
    .filter(a => a.day === selectedDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, day: selectedDay });
    setEditingId(null);
    setModal(true);
  };

  const openEdit = (item: ActivityItem) => {
    setForm({ ...item });
    setEditingId(item.id);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert("", "Judul aktivitas tidak boleh kosong."); return;
    }
    if (!form.time.trim()) {
      Alert.alert("", "Waktu tidak boleh kosong."); return;
    }
    if (editingId) {
      await updateActivity({ ...form, id: editingId });
    } else {
      await addActivity(form);
    }
    setModal(false);
  };

  const confirmDelete = (id: string) =>
    Alert.alert("Hapus", "Yakin hapus aktivitas ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => deleteActivity(id) },
    ]);

  const handlePickPhoto = () => {
    showPickerOptions((uri) => set("photo")(uri));
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]} {...swipeHandlers}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Hari Ini</Text>
          <Text style={styles.topBarDate}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.addFab} onPress={openAdd}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addFabText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}>
          {DAYS.map(day => {
            const isActive = day === selectedDay;
            const count = activities.filter(a => a.day === day).length;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayItem, isActive && styles.dayItemActive]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayShort, isActive && styles.dayShortActive]}>
                  {DAY_SHORT[day]}
                </Text>
                {count > 0 && (
                  <Text style={[styles.dayCount, isActive && styles.dayCountActive]}>
                    {count}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Activity List */}
      {dayActivities.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#c4c6cf" />
          <Text style={styles.emptyTitle}>Tidak ada aktivitas</Text>
          <Text style={styles.emptySubTitle}>
            Tap "+ Tambah" untuk menambahkan aktivitas hari {selectedDay}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={dayActivities}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.activityRow}>
              {/* Kolom waktu */}
              <View style={styles.timeCol}>
                <Text style={[styles.timeText, item.day === getTodayName() && styles.timeTextActive]}>
                  {item.time}
                </Text>
                <View style={styles.timeLine} />
              </View>

              {/* Konten */}
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                {item.description ? <Text style={styles.activityDesc}>{item.description}</Text> : null}
                {item.location ? <Text style={styles.activityLoc}>📍 {item.location}</Text> : null}

                {/* Foto dokumentasi */}
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={styles.activityPhoto} />
                ) : null}

                <View style={styles.activityActions}>
                  <TouchableOpacity onPress={() => openEdit(item)}>
                    <Text style={styles.actionUbah}>Ubah</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                    <Text style={styles.actionHapus}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Notif ringkasan */}
      {activities.length > 0 && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            🔔 Total {activities.length} aktivitas dijadwalkan minggu ini.
          </Text>
        </View>
      )}

      {/* Modal Tambah/Ubah */}
      <Modal visible={modal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingId ? "Ubah Aktivitas" : "Tambah Aktivitas"}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.modalSave}>Simpan</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Pilih Hari */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>HARI</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingTop: 8 }}>
                {DAYS.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, form.day === day && styles.dayChipActive]}
                    onPress={() => set("day")(day)}
                  >
                    <Text style={[styles.dayChipText, form.day === day && styles.dayChipTextActive]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Field label="Waktu (HH:MM)" value={form.time} onChangeText={set("time")}
              placeholder="08:00" keyboardType="numbers-and-punctuation" />
            <Field label="Judul Aktivitas" value={form.title} onChangeText={set("title")} />
            <Field label="Deskripsi" value={form.description} onChangeText={set("description")}
              placeholder="Opsional" />
            <Field label="Lokasi" value={form.location} onChangeText={set("location")}
              placeholder="Opsional" />

            {/* Upload Foto */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>FOTO DOKUMENTASI</Text>
              <TouchableOpacity style={styles.photoPickerBtn} onPress={handlePickPhoto} activeOpacity={0.7}>
                {form.photo ? (
                  <View style={styles.photoPreviewWrapper}>
                    <Image source={{ uri: form.photo }} style={styles.photoPreview} />
                    <View style={styles.photoChangeOverlay}>
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={styles.photoChangeText}>Ganti Foto</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.photoEmpty}>
                    <Ionicons name="image-outline" size={32} color="#94a1a8" />
                    <Text style={styles.photoEmptyText}>Ketuk untuk pilih foto</Text>
                    <Text style={styles.photoEmptyHint}>Dari kamera atau galeri</Text>
                  </View>
                )}
              </TouchableOpacity>
              {form.photo ? (
                <TouchableOpacity onPress={() => set("photo")("")} style={styles.removePhotoBtn}>
                  <Text style={styles.removePhotoText}>Hapus foto</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
  },
  topBarTitle: { fontSize: 24, fontWeight: "700", color: PRIMARY },
  topBarDate: { fontSize: 13, color: ON_SURFACE_VARIANT, marginTop: 2 },
  addFab: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: PRIMARY, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 999,
  },
  addFabText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  daySelectorWrapper: {
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
    backgroundColor: SURFACE_LOW,
  },
  daySelector: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  dayItem: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, alignItems: "center", minWidth: 52, backgroundColor: "#fff",
  },
  dayItemActive: { backgroundColor: PRIMARY },
  dayShort: { fontSize: 12, fontWeight: "700", color: ON_SURFACE_VARIANT, textTransform: "uppercase" },
  dayShortActive: { color: "#fff" },
  dayCount: { fontSize: 11, color: ON_SURFACE_VARIANT, marginTop: 2 },
  dayCountActive: { color: "rgba(255,255,255,0.8)" },

  emptyState: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 32, gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: ON_SURFACE_VARIANT },
  emptySubTitle: { fontSize: 13, color: "#94a1a8", textAlign: "center", lineHeight: 20 },

  listContent: { padding: 16, paddingBottom: 80 },
  activityRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  timeCol: { width: 50, alignItems: "center", paddingTop: 4 },
  timeText: { fontSize: 11, fontWeight: "700", color: ON_SURFACE_VARIANT, marginBottom: 4 },
  timeTextActive: { color: PRIMARY },
  timeLine: { flex: 1, width: 1, backgroundColor: OUTLINE_VARIANT, opacity: 0.3 },
  activityContent: {
    flex: 1, paddingBottom: 20,
    borderBottomWidth: 0.5, borderBottomColor: "#f1f4f6",
  },
  activityTitle: { fontSize: 16, fontWeight: "600", color: PRIMARY, marginBottom: 2 },
  activityDesc: { fontSize: 13, color: ON_SURFACE_VARIANT, marginBottom: 2 },
  activityLoc: { fontSize: 12, color: "#94a1a8", marginBottom: 6 },
  activityPhoto: {
    width: "100%", height: 140, borderRadius: 10,
    marginTop: 8, marginBottom: 8,
  },
  activityActions: { flexDirection: "row", gap: 14, marginTop: 4 },
  actionUbah: { fontSize: 12, fontWeight: "600", color: PRIMARY },
  actionHapus: { fontSize: 12, fontWeight: "600", color: "#ba1a1a" },

  notice: {
    margin: 16, padding: 14,
    backgroundColor: SECONDARY_CONTAINER, borderRadius: 12,
  },
  noticeText: { fontSize: 13, color: "#586377" },

  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
  },
  modalCancel: { fontSize: 15, color: ON_SURFACE_VARIANT },
  modalTitle: { fontSize: 16, fontWeight: "600", color: PRIMARY },
  modalSave: { fontSize: 15, fontWeight: "700", color: PRIMARY },
  modalBody: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 20 },

  fieldWrapper: { gap: 6 },
  fieldLabel: {
    fontSize: 10, fontWeight: "600", color: ON_SURFACE_VARIANT,
    letterSpacing: 1.2, textTransform: "uppercase",
  },
  fieldInput: {
    borderBottomWidth: 1, borderBottomColor: OUTLINE_VARIANT,
    paddingVertical: 8, fontSize: 15, color: "#181c1e",
  },

  dayChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1, borderColor: OUTLINE_VARIANT,
    backgroundColor: "#fff",
  },
  dayChipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  dayChipText: { fontSize: 13, fontWeight: "600", color: ON_SURFACE_VARIANT },
  dayChipTextActive: { color: "#fff" },

  // Foto picker
  photoPickerBtn: {
    borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: OUTLINE_VARIANT, borderStyle: "dashed",
    marginTop: 8,
  },
  photoEmpty: {
    height: 120, alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: SURFACE_LOW,
  },
  photoEmptyText: { fontSize: 13, fontWeight: "600", color: "#94a1a8" },
  photoEmptyHint: { fontSize: 11, color: "#c4c6cf" },
  photoPreviewWrapper: { position: "relative" },
  photoPreview: { width: "100%", height: 160 },
  photoChangeOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 8, gap: 6,
  },
  photoChangeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  removePhotoBtn: { alignSelf: "flex-end", marginTop: 6 },
  removePhotoText: { fontSize: 12, color: "#ba1a1a", fontWeight: "600" },
});
