import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Biodata {
  fullName: string;
  nim: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  gender: string;
  major: string;
  university: string;
  gpa: string;
  photo: string;
}

export interface EducationItem {
  id: string;
  level: string;
  schoolName: string;
  major: string;
  city: string;
  startYear: string;
  endYear: string;
  isCurrent: boolean;
  photo: string;       // URI foto gedung/tempat pendidikan
}

export interface ActivityItem {
  id: string;
  day: string;
  date: string;        // tanggal manual: "DD/MM/YYYY"
  time: string;
  title: string;
  description: string;
  location: string;
  photo: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: string;
  photo: string;       // URI foto sertifikat
}

// ── Default empty state ────────────────────────────────────────────────────

const EMPTY_BIODATA: Biodata = {
  fullName: "", nim: "", email: "", phone: "",
  address: "", dob: "", gender: "", major: "",
  university: "", gpa: "", photo: "",
};

// ── Storage keys ───────────────────────────────────────────────────────────

const KEY_BIODATA     = "@profile:biodata";
const KEY_EDUCATION   = "@profile:education";
const KEY_ACTIVITIES  = "@profile:activities";
const KEY_CERTIFICATES = "@profile:certificates";

// ── Context ────────────────────────────────────────────────────────────────

interface ProfileContextType {
  biodata: Biodata;
  education: EducationItem[];
  activities: ActivityItem[];
  certificates: Certificate[];
  loading: boolean;

  // Biodata
  saveBiodata: (data: Biodata) => Promise<void>;

  // Education CRUD
  addEducation: (item: Omit<EducationItem, "id">) => Promise<void>;
  updateEducation: (item: EducationItem) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;

  // Activity CRUD
  addActivity: (item: Omit<ActivityItem, "id">) => Promise<void>;
  updateActivity: (item: ActivityItem) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  // Certificate CRUD
  addCertificate: (item: Omit<Certificate, "id">) => Promise<void>;
  updateCertificate: (item: Certificate) => Promise<void>;
  deleteCertificate: (id: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

// ── Provider ───────────────────────────────────────────────────────────────

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [biodata, setBiodata]           = useState<Biodata>(EMPTY_BIODATA);
  const [education, setEducation]       = useState<EducationItem[]>([]);
  const [activities, setActivities]     = useState<ActivityItem[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading]           = useState(true);

  // Load all data on mount
  useEffect(() => {
    (async () => {
      try {
        const [b, e, a, c] = await Promise.all([
          AsyncStorage.getItem(KEY_BIODATA),
          AsyncStorage.getItem(KEY_EDUCATION),
          AsyncStorage.getItem(KEY_ACTIVITIES),
          AsyncStorage.getItem(KEY_CERTIFICATES),
        ]);
        if (b) setBiodata(JSON.parse(b));
        if (e) setEducation(JSON.parse(e));
        if (a) setActivities(JSON.parse(a));
        if (c) setCertificates(JSON.parse(c));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Biodata ──
  const saveBiodata = async (data: Biodata) => {
    setBiodata(data);
    await AsyncStorage.setItem(KEY_BIODATA, JSON.stringify(data));
  };

  // ── Education ──
  const addEducation = async (item: Omit<EducationItem, "id">) => {
    const next = [...education, { ...item, id: Date.now().toString() }];
    setEducation(next);
    await AsyncStorage.setItem(KEY_EDUCATION, JSON.stringify(next));
  };
  const updateEducation = async (item: EducationItem) => {
    const next = education.map(e => e.id === item.id ? item : e);
    setEducation(next);
    await AsyncStorage.setItem(KEY_EDUCATION, JSON.stringify(next));
  };
  const deleteEducation = async (id: string) => {
    const next = education.filter(e => e.id !== id);
    setEducation(next);
    await AsyncStorage.setItem(KEY_EDUCATION, JSON.stringify(next));
  };

  // ── Activity ──
  const addActivity = async (item: Omit<ActivityItem, "id">) => {
    const next = [...activities, { ...item, id: Date.now().toString() }];
    setActivities(next);
    await AsyncStorage.setItem(KEY_ACTIVITIES, JSON.stringify(next));
  };
  const updateActivity = async (item: ActivityItem) => {
    const next = activities.map(a => a.id === item.id ? item : a);
    setActivities(next);
    await AsyncStorage.setItem(KEY_ACTIVITIES, JSON.stringify(next));
  };
  const deleteActivity = async (id: string) => {
    const next = activities.filter(a => a.id !== id);
    setActivities(next);
    await AsyncStorage.setItem(KEY_ACTIVITIES, JSON.stringify(next));
  };

  // ── Certificate ──
  const addCertificate = async (item: Omit<Certificate, "id">) => {
    const next = [...certificates, { ...item, id: Date.now().toString() }];
    setCertificates(next);
    await AsyncStorage.setItem(KEY_CERTIFICATES, JSON.stringify(next));
  };
  const updateCertificate = async (item: Certificate) => {
    const next = certificates.map(c => c.id === item.id ? item : c);
    setCertificates(next);
    await AsyncStorage.setItem(KEY_CERTIFICATES, JSON.stringify(next));
  };
  const deleteCertificate = async (id: string) => {
    const next = certificates.filter(c => c.id !== id);
    setCertificates(next);
    await AsyncStorage.setItem(KEY_CERTIFICATES, JSON.stringify(next));
  };

  return (
    <ProfileContext.Provider value={{
      biodata, education, activities, certificates, loading,
      saveBiodata,
      addEducation, updateEducation, deleteEducation,
      addActivity, updateActivity, deleteActivity,
      addCertificate, updateCertificate, deleteCertificate,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
