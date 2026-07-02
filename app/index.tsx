import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isLoggedIn, authLoading } = useAuth();

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#002045" />
      </View>
    );
  }

  if (isLoggedIn) return <Redirect href="/(tabs)" />;
  return <Redirect href={"/login" as any} />;
}
