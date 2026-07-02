import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserAccount {
  username: string;   // NIM
  password: string;   // hashed sederhana (base64)
  fullName: string;
  major: string;
  createdAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  currentUser: UserAccount | null;
  authLoading: boolean;

  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  major: string;
}

// ── Storage keys ───────────────────────────────────────────────────────────

const KEY_ACCOUNTS    = "@auth:accounts";
const KEY_LOGGED_IN   = "@auth:loggedIn";
const KEY_CURRENT_USER = "@auth:currentUser";

// ── Simple encode (bukan enkripsi nyata, cukup untuk lokal) ────────────────
const encode = (str: string) => btoa(unescape(encodeURIComponent(str)));
const decode = (str: string) => decodeURIComponent(escape(atob(str)));

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [currentUser, setCurrentUser]   = useState<UserAccount | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const [loggedIn, userJson] = await Promise.all([
          AsyncStorage.getItem(KEY_LOGGED_IN),
          AsyncStorage.getItem(KEY_CURRENT_USER),
        ]);
        if (loggedIn === "true" && userJson) {
          setIsLoggedIn(true);
          setCurrentUser(JSON.parse(userJson));
        }
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  // ── Register ──────────────────────────────────────────────────────────────
  const register = async (data: RegisterData): Promise<{ success: boolean; message: string }> => {
    const { username, password, confirmPassword, fullName, major } = data;

    // Validasi
    if (!username.trim())      return { success: false, message: "NIM tidak boleh kosong." };
    if (!fullName.trim())      return { success: false, message: "Nama lengkap tidak boleh kosong." };
    if (password.length < 6)   return { success: false, message: "Kata sandi minimal 6 karakter." };
    if (password !== confirmPassword)
      return { success: false, message: "Konfirmasi kata sandi tidak cocok." };

    // Load existing accounts
    const raw = await AsyncStorage.getItem(KEY_ACCOUNTS);
    const accounts: UserAccount[] = raw ? JSON.parse(raw) : [];

    // Cek duplikat
    const exists = accounts.find(a => a.username === username.trim());
    if (exists) return { success: false, message: "NIM sudah terdaftar." };

    // Simpan akun baru
    const newAccount: UserAccount = {
      username: username.trim(),
      password: encode(password),
      fullName: fullName.trim(),
      major: major.trim(),
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    await AsyncStorage.setItem(KEY_ACCOUNTS, JSON.stringify(accounts));

    return { success: true, message: "Akun berhasil dibuat!" };
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    if (!username.trim() || !password.trim())
      return { success: false, message: "NIM dan kata sandi tidak boleh kosong." };
    const raw = await AsyncStorage.getItem(KEY_ACCOUNTS);
    const accounts: UserAccount[] = raw ? JSON.parse(raw) : [];
    const account = accounts.find(a => a.username === username.trim());
    if (!account)
      return { success: false, message: "Akun tidak ditemukan." };
    if (decode(account.password) !== password)
      return { success: false, message: "Kata sandi salah." };

    // Set session
    await Promise.all([
      AsyncStorage.setItem(KEY_LOGGED_IN, "true"),
      AsyncStorage.setItem(KEY_CURRENT_USER, JSON.stringify(account)),
    ]);
    setIsLoggedIn(true);
    setCurrentUser(account);

    return { success: true, message: "Login berhasil." };
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEY_LOGGED_IN),
      AsyncStorage.removeItem(KEY_CURRENT_USER),
    ]);
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
