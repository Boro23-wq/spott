import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1F1F1F",
          borderTopColor: "#2A2A2A",
        },
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#6B6B6B",
        headerStyle: { backgroundColor: "#141414" },
        headerTintColor: "#FFFFFF",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="workout" options={{ title: "Workout" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
