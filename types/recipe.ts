export interface Recipe {
  id: number;
  name: string;
  image: string;
  cookTimeMinutes: number;
  tags: string[];
}

export interface RecipeDetailData {
  id: number;
  name: string;
  image: string;
  cookTimeMinutes: number;
  ingredients: string[];  
  instructions: string[]; 
}