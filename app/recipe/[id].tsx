import Header from '../../components/Header';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import Axios from "axios";
import { RecipeDetailData } from "../../types/recipe";

const DetailRecipe = () => {
  const { id } = useLocalSearchParams();
  
  const [recipe, setRecipe] = useState<RecipeDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getRecipeDetail = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`https://dummyjson.com/recipes/${id}`);
      setRecipe(response.data);
    } catch (error) {
      console.error("Gagal memuat detail resep:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getRecipeDetail();
    }
  }, [id]);

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <View style={styles.headerWrapper}>
        <Header btnBack={true} title={recipe?.name ?? "Detail Resep"} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2980b9" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Image source={{ uri: recipe?.image }} style={styles.recipeImage} />


          <View style={styles.contentContainer}>
            <Text style={styles.recipeName}>{recipe?.name}</Text>
            <Text style={styles.cookTime}>⏱️ Waktu Masak: {recipe?.cookTimeMinutes} Menit</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Bahan-Bahan:</Text>
            {recipe?.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.itemText}>
                • {ingredient}
              </Text>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Instruksi Memasak:</Text>
            {recipe?.instructions.map((instruction, index) => (
              <Text key={index} style={styles.itemText}>
                {index + 1}. {instruction}
              </Text>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: "#002045",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recipeImage: {
    width: "100%",
    height: 230,
  },
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    backgroundColor: "#ffffff",
  },
  recipeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  cookTime: {
    fontSize: 14,
    color: "#e67e22",
    fontWeight: "600",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f2f6",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    color: "#57606f",
    lineHeight: 22,
    marginBottom: 6,
  },
});

export default DetailRecipe;
