import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { router } from "expo-router";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";

interface RecipeItemProps {
  item: {
    id: number;
    name: string;
    image: string;
    cookTimeMinutes: number;
  };
}

const RecipeItem = ({ item }: RecipeItemProps) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/recipe/${item.id}` as any)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.cookTimeText}>⏱ {item.cookTimeMinutes} menit</Text>
        <View style={styles.linkRow}>
          <Text style={styles.detailText}>Lihat Detail →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    width: "100%",
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: OUTLINE_VARIANT,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 120,
  },
  cardInfo: {
    padding: 12,
    gap: 4,
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY,
    lineHeight: 18,
    minHeight: 36,
  },
  cookTimeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#d97706",
  },
  linkRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#f1f4f6",
  },
  detailText: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
    textAlign: "right",
  },
});

export default RecipeItem;
