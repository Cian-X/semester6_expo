import { useSwipeNavigate } from "@/hooks/useSwipeNavigate";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, Image,
  ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TagItem from "../../components/TagItem";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";
const SURFACE_LOW = "#f1f4f6";
const ON_SURFACE_VARIANT = "#43474e";

interface Recipe {
  id: number;
  name: string;
  image: string;
  cookTimeMinutes: number;
  tags: string[];
}

const RecipeHomeScreen = () => {
  const [recipes, setRecipes]     = useState<Recipe[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTag, setActiveTag] = useState("");
  const swipeHandlers = useSwipeNavigate(3);

  useEffect(() => {
    axios
      .get("https://dummyjson.com/recipes?limit=30&select=id,name,image,cookTimeMinutes,tags")
      .then(({ data }) => setRecipes(data.recipes))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = recipes[0];
  const dummyTags = ["Semua", "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks"];

  const others = recipes.slice(1).filter(r => {
    if (!activeTag || activeTag === "Semua") return true;
    return r.tags?.some(t => t.toLowerCase() === activeTag.toLowerCase());
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]} {...swipeHandlers}>
      {/* Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Resep Masakan</Text>
          <Text style={styles.topBarSub}>Temukan resep favoritmu</Text>
        </View>
        <TouchableOpacity
          style={styles.lihatSemuaBtn}
          onPress={() => router.push("/recipe/list" as any)}
        >
          <Text style={styles.lihatSemuaText}>Semua</Text>
          <Ionicons name="grid-outline" size={14} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Memuat resep...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Filter Tag */}
          <FlatList
            data={dummyTags}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={i => i}
            contentContainerStyle={styles.tagsList}
            renderItem={({ item }) => (
              <TagItem
                name={item}
                isActive={item === activeTag || (item === "Semua" && activeTag === "")}
                onPress={() => setActiveTag(item === "Semua" ? "" : item)}
              />
            )}
          />

          {/* Featured Recipe */}
          {featured && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resep Unggulan</Text>
              <TouchableOpacity
                style={styles.featuredCard}
                onPress={() => router.push(`/recipe/${featured.id}` as any)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: featured.image }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay}>
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>⭐ Unggulan</Text>
                  </View>
                  <Text style={styles.featuredName} numberOfLines={2}>
                    {featured.name}
                  </Text>
                  <View style={styles.featuredMeta}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.featuredMetaText}>
                      {featured.cookTimeMinutes} menit
                    </Text>
                    <View style={styles.featuredDetailBtn}>
                      <Text style={styles.featuredDetailText}>Lihat Resep</Text>
                      <Ionicons name="arrow-forward" size={13} color={PRIMARY} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Resep Lainnya - horizontal scroll */}
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Resep Lainnya</Text>
              <TouchableOpacity
                onPress={() => router.push("/recipe/list" as any)}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Ionicons name="chevron-forward" size={14} color={PRIMARY} />
              </TouchableOpacity>
            </View>

            {others.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada resep untuk kategori ini.</Text>
            ) : (
              <FlatList
                data={others}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.hCard}
                    onPress={() => router.push(`/recipe/${item.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <Image source={{ uri: item.image }} style={styles.hCardImage} />
                    <View style={styles.hCardInfo}>
                      <Text style={styles.hCardName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.hCardTime}>
                        <Ionicons name="time-outline" size={11} color="#d97706" /> {item.cookTimeMinutes} menit
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
  },
  topBarTitle: { fontSize: 20, fontWeight: "700", color: PRIMARY },
  topBarSub: { fontSize: 12, color: ON_SURFACE_VARIANT, marginTop: 2 },
  lihatSemuaBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderWidth: 1, borderColor: OUTLINE_VARIANT,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
  },
  lihatSemuaText: { fontSize: 12, fontWeight: "600", color: PRIMARY },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: ON_SURFACE_VARIANT },

  tagsList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },

  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: PRIMARY, marginBottom: 12 },
  seeAllBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAllText: { fontSize: 13, fontWeight: "600", color: PRIMARY },

  // Featured card
  featuredCard: {
    borderRadius: 18, overflow: "hidden",
    marginBottom: 8, elevation: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8,
  },
  featuredImage: { width: "100%", height: 220 },
  featuredOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 16,
    background: "transparent",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999, marginBottom: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.4)",
  },
  featuredBadgeText: { fontSize: 11, color: "#fff", fontWeight: "600" },
  featuredName: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 8, lineHeight: 26 },
  featuredMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  featuredMetaText: { fontSize: 13, color: "rgba(255,255,255,0.9)", flex: 1 },
  featuredDetailBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff", paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 999,
  },
  featuredDetailText: { fontSize: 12, fontWeight: "700", color: PRIMARY },

  // Horizontal cards
  horizontalList: { paddingBottom: 8, gap: 12 },
  hCard: {
    width: 150, backgroundColor: "#fff",
    borderRadius: 14, overflow: "hidden",
    borderWidth: 0.5, borderColor: OUTLINE_VARIANT,
    elevation: 2,
  },
  hCardImage: { width: "100%", height: 100 },
  hCardInfo: { padding: 10, gap: 4 },
  hCardName: { fontSize: 13, fontWeight: "700", color: PRIMARY, lineHeight: 17, minHeight: 34 },
  hCardTime: { fontSize: 11, color: "#d97706", fontWeight: "600" },

  emptyText: { fontSize: 13, color: "#94a1a8", fontStyle: "italic", paddingVertical: 8 },
});

export default RecipeHomeScreen;
