import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const PRIMARY = "#002045";

interface TagItemProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
}

const TagItem = ({ name, isActive, onPress }: TagItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
  },
  badgeInactive: {
    backgroundColor: "#fff",
    borderColor: "#c4c6cf",
  },
  badgeActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#43474e",
  },
  badgeTextActive: {
    color: "#ffffff",
  },
});

export default TagItem;
