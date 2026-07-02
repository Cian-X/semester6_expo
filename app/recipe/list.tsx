import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator, FlatList, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeItem from "../../components/RecipeItem";
import TagItem from "../../components/TagItem";

const PRIMARY = "#002045";
const OUTLINE_VARIANT = "#c4c6cf";
const SURFACE_LOW = "#f1f4f6";
const ON_SURFACE_VARIANT = "#43474e";

const RecipeListScreen = () => {
  const [recipes, setRecipes]     = useState<any[]>([]);
  const [tags, setTags]           = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get("https://dummyjson.com/recipes?limit=50&select=id,name,image,cookTimeMinutes,tags"),
      axios.get("https://dummyjson.com/recipes/tags"),
    ])
      .then(([r1, r2]) => {
        setRecipes(r1.data.recipes);
        setTags(["Semua", ...r2.data]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = !activeTag || activeTag === "Semua"
    ? recipes
    : recipes.filter(r =>
        r.tags?.some((t: string) => t.toLowerCase() === activeTag.toLowerCase())
      );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: SURFACE_LOW }} edges={["top"]}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={PRIMARY} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.topBarTitle}>Semua Resep</Text>
          <Text style={styles.topBarSub}>
            {loading ? "Memuat..." : `${filtered.length} resep ditemukan`}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Memuat resep...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <FlatList
              data={tags}
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
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada resep untuk kategori ini.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.recipeColumn}>
              <RecipeItem item={item} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: OUTLINE_VARIANT,
    backgroundColor: SURFACE_LOW,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderWidth: 0.5, borderColor: OUTLINE_VARIANT,
  },
  topBarTitle: { fontSize: 18, fontWeight: "700", color: PRIMARY },
  topBarSub: { fontSize: 12, color: ON_SURFACE_VARIANT, marginTop: 1 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, color: ON_SURFACE_VARIANT },

  tagsList: { paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  listContent: { paddingHorizontal: 14, paddingBottom: 32, gap: 14 },
  columnWrapper: { gap: 12 },
  recipeColumn: { flex: 1, maxWidth: "50%" },
  emptyContainer: { flex: 1, alignItems: "center", paddingTop: 40 },
  emptyText: { fontSize: 14, color: "#94a1a8", fontStyle: "italic" },
});

export default RecipeListScreen;
