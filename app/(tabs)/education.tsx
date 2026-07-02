import { Certificate, EducationItem, useProfile } from "@/context/ProfileContext";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useSwipeNavigate } from "@/hooks/useSwipeNavigate";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert, Image, Modal, ScrollView, StyleSheet, Switch,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";
const ON_SURFACE_VARIANT = "#43474e";
const SURFACE_LOW = "#f1f4f6";
const SECONDARY_CONTAINER = "#d5e0f7";

// ── Komponen field teks ────────────────────────────────────────────────────
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

// ── Komponen upload foto ───────────────────────────────────────────────────
const PhotoPicker = ({
  label, uri, onPick, onRemove,
}: {
  label: string; uri: string;
  onPick: () => void; onRemove: () => void;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
    <TouchableOpacity style={styles.photoBtn} onPress={onPick} activeOpacity={0.8}>
      {uri ? (
        <View style={styles.photoPreviewWrapper}>
          <Image source={{ uri }} style={styles.photoPreview} />
          <View style={styles.photoOverlay}>
            <Ionicons name="camera" size={18} color="#fff" />
            <Text style={styles.photoOverlayText}>Ganti Foto</Text>
          </View>
        </View>
      ) : (
        <View style={styles.photoEmpty}>
          <Ionicons name="image-outline" size={28} color="#94a1a8" />
          <Text style={styles.photoEmptyText}>Ketuk untuk pilih foto</Text>
          <Text style={styles.photoEmptyHint}>Kamera atau galeri</Text>
        </View>
      )}
    </TouchableOpacity>
    {uri ? (
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Text style={styles.removeBtnText}>Hapus foto</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

type EduForm = Omit<EducationItem, "id">;
type CertForm = Omit<Certificate, "id">;

const EMPTY_EDU: EduForm = {
  level: "", schoolName: "", major: "", city: "",
  startYear: "", endYear: "", isCurrent: false, photo: "",
};
const EMPTY_CERT: CertForm = { name: "", issuer: "", year: "", photo: "" };

// ── Kartu pendidikan ───────────────────────────────────────────────────────
const EduCard = ({ item, onEdit, onDelete }: {
  item: EducationItem; onEdit: () => void; onDelete: () => void;
}) => (
  <View style={styles.card}>
    {item.photo ? (
      <Image source={{ uri: item.photo }} style={styles.cardPhoto} />
    ) : null}
    <View style={styles.cardBody}>
      <View style={styles.cardRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.schoolName || "—"}</Text>
            {item.isCurrent && <View style={styles.activeDot} />}
          </View>
          <Text style={styles.cardSub}>{item.level}</Text>
          {item.major ? <Text style={styles.cardDetail}>{item.major}</Text> : null}
          {item.city ? <Text style={styles.cardDetail}>📍 {item.city}</Text> : null}
        </View>
        <Text style={styles.cardYear}>
          {item.startYear}
          {item.endYear || item.isCurrent
            ? ` — ${item.isCurrent ? "Sekarang" : item.endYear}`
            : ""}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.actionEdit}>Ubah</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.actionDelete}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ── Kartu sertifikat ───────────────────────────────────────────────────────
const CertCard = ({ item, onEdit, onDelete }: {
  item: Certificate; onEdit: () => void; onDelete: () => void;
}) => (
  <View style={styles.certCard}>
    {item.photo ? (
      <Image source={{ uri: item.photo }} style={styles.certPhoto} />
    ) : (
      <View style={styles.certPhotoPlaceholder}>
        <Ionicons name="ribbon-outline" size={24} color="#c4c6cf" />
      </View>
    )}
    <View style={{ flex: 1 }}>
      <Text style={styles.certName}>{item.name || "—"}</Text>
      <Text style={styles.certIssuer}>{item.issuer}</Text>
      <Text style={styles.certYear}>{item.year}</Text>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.actionEdit}>Ubah</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text style={styles.actionDelete}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// ── Main screen ────────────────────────────────────────────────────────────
export default function EducationScreen() {
  const {
    education, addEducation, updateEducation, deleteEducation,
    certificates, addCertificate, updateCertificate, deleteCertificate,
  } = useProfile();
  const { showPickerOptions } = useImagePicker();
  const swipeHandlers = useSwipeNavigate(1);

  const [eduModal, setEduModal]       = useState(false);
  const [eduForm, setEduForm]         = useState<EduForm>(EMPTY_EDU);
  const [editingEduId, setEditingEduId] = useState<string | null>(null);

  const [certModal, setCertModal]     = useState(false);
  const [certForm, setCertForm]       = useState<CertForm>(EMPTY_CERT);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);

  const setE = (k: keyof EduForm) => (v: string | boolean) =>
    setEduForm(prev => ({ ...prev, [k]: v }));
  const setC = (k: keyof CertForm) => (v: string) =>
    setCertForm(prev => ({ ...prev, [k]: v }));

  // Education
  const openAddEdu = () => { setEduForm(EMPTY_EDU); setEditingEduId(null); setEduModal(true); };
  const openEditEdu = (item: EducationItem) => { setEduForm({ ...item }); setEditingEduId(item.id); setEduModal(true); };
  const saveEdu = async () => {
    if (!eduForm.schoolName.trim()) { Alert.alert("", "Nama sekolah tidak boleh kosong."); return; }
    editingEduId
      ? await updateEducation({ ...eduForm, id: editingEduId })
      : await addEducation(eduForm);
    setEduModal(false);
  };
  const confirmDeleteEdu = (id: string) =>
    Alert.alert("Hapus", "Yakin hapus riwayat ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => deleteEducation(id) },
    ]);

  // Certificate
  const openAddCert = () => { setCertForm(EMPTY_CERT); setEditingCertId(null); setCertModal(true); };
  const openEditCert = (item: Certificate) => { setCertForm({ ...item }); setEditingCertId(item.id); setCertModal(true); };
  const saveCert = async () => {
    if (!certForm.name.trim()) { Alert.alert("", "Nama sertifikat tidak boleh kosong."); return; }
    editingCertId
      ? await updateCertificate({ ...certForm, id: editingCertId })
      : await addCertificate(certForm);
    setCertModal(false);
  };
  const confirmDeleteCert = (id: string) =>
    Alert.alert("Hapus", "Yakin hapus sertifikat ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => deleteCertificate(id) },
    ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE_LOW }} edges={["top"]}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Riwayat Pendidikan</Text>
      </View>

      <ScrollView {...swipeHandlers} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Ringkasan */}
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryTitle}>Perjalanan Akademik</Text>
            <Text style={styles.summarySubText}>
              {education.length > 0 ? `${education.length} institusi` : "Belum ada data"}
            </Text>
          </View>
          {education.some(e => e.isCurrent) && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Mahasiswa Aktif</Text>
            </View>
          )}
        </View>

        {/* Riwayat Sekolah */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Sekolah</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddEdu}>
              <Text style={styles.addBtnText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>
          {education.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada data. Tap "+ Tambah" untuk menambahkan.</Text>
          ) : (
            [...education]
              .sort((a, b) => Number(b.startYear) - Number(a.startYear))
              .map(item => (
                <EduCard key={item.id} item={item}
                  onEdit={() => openEditEdu(item)}
                  onDelete={() => confirmDeleteEdu(item.id)} />
              ))
          )}
        </View>

        {/* Sertifikat */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sertifikat & Penghargaan</Text>
            <TouchableOpacity style={styles.addBtn} onPress={openAddCert}>
              <Text style={styles.addBtnText}>+ Tambah</Text>
            </TouchableOpacity>
          </View>
          {certificates.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada sertifikat.</Text>
          ) : (
            certificates.map(item => (
              <CertCard key={item.id} item={item}
                onEdit={() => openEditCert(item)}
                onDelete={() => confirmDeleteCert(item.id)} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal Pendidikan */}
      <Modal visible={eduModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEduModal(false)}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingEduId ? "Ubah Pendidikan" : "Tambah Pendidikan"}</Text>
            <TouchableOpacity onPress={saveEdu}>
              <Text style={styles.modalSave}>Simpan</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <PhotoPicker
              label="Foto Tempat Pendidikan"
              uri={eduForm.photo}
              onPick={() => showPickerOptions(uri => setE("photo")(uri))}
              onRemove={() => setE("photo")("")}
            />
            <Field label="Jenjang (SD / SMP / SMA / S1)" value={eduForm.level} onChangeText={setE("level") as any} />
            <Field label="Nama Sekolah / Universitas" value={eduForm.schoolName} onChangeText={setE("schoolName") as any} />
            <Field label="Jurusan / Program Studi" value={eduForm.major} onChangeText={setE("major") as any} />
            <Field label="Kota" value={eduForm.city} onChangeText={setE("city") as any} />
            <Field label="Tahun Masuk" value={eduForm.startYear} onChangeText={setE("startYear") as any} keyboardType="number-pad" />
            <Field label="Tahun Lulus" value={eduForm.endYear} onChangeText={setE("endYear") as any} keyboardType="number-pad" />
            <View style={styles.switchRow}>
              <Text style={styles.fieldLabel}>MASIH AKTIF / SEKARANG</Text>
              <Switch
                value={eduForm.isCurrent}
                onValueChange={v => setE("isCurrent")(v as any)}
                trackColor={{ true: PRIMARY }}
                thumbColor="#fff"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal Sertifikat */}
      <Modal visible={certModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setCertModal(false)}>
              <Text style={styles.modalCancel}>Batal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingCertId ? "Ubah Sertifikat" : "Tambah Sertifikat"}</Text>
            <TouchableOpacity onPress={saveCert}>
              <Text style={styles.modalSave}>Simpan</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <PhotoPicker
              label="Foto Sertifikat"
              uri={certForm.photo}
              onPick={() => showPickerOptions(uri => setC("photo")(uri))}
              onRemove={() => setC("photo")("")}
            />
            <Field label="Nama Sertifikat" value={certForm.name} onChangeText={setC("name")} />
            <Field label="Penerbit" value={certForm.issuer} onChangeText={setC("issuer")} />
            <Field label="Tahun" value={certForm.year} onChangeText={setC("year")} keyboardType="number-pad" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
    backgroundColor: SURFACE_LOW,
  },
  topBarTitle: { fontSize: 20, fontWeight: "600", color: PRIMARY },
  summary: {
    flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
  },
  summaryTitle: { fontSize: 18, fontWeight: "600", color: PRIMARY, marginBottom: 4 },
  summarySubText: { fontSize: 13, color: ON_SURFACE_VARIANT },
  activeBadge: { backgroundColor: SECONDARY_CONTAINER, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  activeBadgeText: { fontSize: 10, fontWeight: "600", color: "#586377", textTransform: "uppercase" },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: PRIMARY },
  addBtn: { backgroundColor: PRIMARY, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999 },
  addBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyText: { fontSize: 13, color: "#94a1a8", fontStyle: "italic", paddingVertical: 12 },

  // Kartu pendidikan
  card: {
    backgroundColor: "#fff", borderRadius: 14,
    marginBottom: 12, overflow: "hidden",
    borderWidth: 0.5, borderColor: OUTLINE_VARIANT, elevation: 1,
  },
  cardPhoto: { width: "100%", height: 130 },
  cardBody: { padding: 14 },
  cardRow: { flexDirection: "row", gap: 12 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: PRIMARY, flex: 1 },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: PRIMARY },
  cardSub: { fontSize: 11, color: ON_SURFACE_VARIANT, marginBottom: 2 },
  cardDetail: { fontSize: 12, color: ON_SURFACE_VARIANT },
  cardYear: { fontSize: 11, fontWeight: "600", color: ON_SURFACE_VARIANT },
  cardActions: {
    flexDirection: "row", gap: 16, marginTop: 10,
    paddingTop: 10, borderTopWidth: 0.5, borderTopColor: "#f1f4f6",
  },
  actionEdit: { fontSize: 13, fontWeight: "600", color: PRIMARY },
  actionDelete: { fontSize: 13, fontWeight: "600", color: "#ba1a1a" },

  // Kartu sertifikat
  certCard: {
    backgroundColor: "#fff", borderRadius: 14,
    padding: 14, marginBottom: 12,
    flexDirection: "row", gap: 12, alignItems: "flex-start",
    borderWidth: 0.5, borderColor: OUTLINE_VARIANT, elevation: 1,
  },
  certPhoto: { width: 70, height: 70, borderRadius: 8 },
  certPhotoPlaceholder: {
    width: 70, height: 70, borderRadius: 8,
    backgroundColor: SURFACE_LOW,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: OUTLINE_VARIANT,
  },
  certName: { fontSize: 14, fontWeight: "700", color: PRIMARY, marginBottom: 2 },
  certIssuer: { fontSize: 12, color: ON_SURFACE_VARIANT },
  certYear: { fontSize: 11, color: ON_SURFACE_VARIANT, marginTop: 2 },

  // Modal
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
  fieldLabel: { fontSize: 10, fontWeight: "600", color: ON_SURFACE_VARIANT, letterSpacing: 1.2, textTransform: "uppercase" },
  fieldInput: { borderBottomWidth: 1, borderBottomColor: OUTLINE_VARIANT, paddingVertical: 8, fontSize: 15, color: "#181c1e" },
  switchRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: OUTLINE_VARIANT,
  },

  // Photo picker
  photoBtn: { borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: OUTLINE_VARIANT, borderStyle: "dashed", marginTop: 6 },
  photoEmpty: { height: 110, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: SURFACE_LOW },
  photoEmptyText: { fontSize: 13, fontWeight: "600", color: "#94a1a8" },
  photoEmptyHint: { fontSize: 11, color: "#c4c6cf" },
  photoPreviewWrapper: { position: "relative" },
  photoPreview: { width: "100%", height: 160 },
  photoOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 8, gap: 6,
  },
  photoOverlayText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  removeBtn: { alignSelf: "flex-end", marginTop: 4 },
  removeBtnText: { fontSize: 12, color: "#ba1a1a", fontWeight: "600" },
});
