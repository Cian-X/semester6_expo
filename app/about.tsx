import { COLOR } from "@/constants/color";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function AboutScreen() {
  return (
    <LinearGradient
      colors={[COLOR.secondary, COLOR.primary]}
      style={styles.container}
    >
      <Text style={styles.text}>Tentang Aplikasi</Text>
      <Text style={styles.subText}>My Portfolio App v1.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  subText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
  },
});
