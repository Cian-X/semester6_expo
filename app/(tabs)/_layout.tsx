import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const PRIMARY = "#002045";
const INACTIVE = "#43474e";
const BORDER = "#c4c6cf";

export default function TabLayouts() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: BORDER,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
        // Aktifkan swipe gesture antar tab
        lazy: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Biodata",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="education"
        options={{
          title: "Pendidikan",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "school" : "school-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Aktivitas",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipe"
        options={{
          title: "Resep",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
