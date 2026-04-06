import { View, Text, StatusBar } from "react-native";

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#141414",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle="light-content" />
      <Text
        style={{
          color: "#FF6B6B",
          fontSize: 40,
          fontWeight: "bold",
          letterSpacing: 2,
        }}
      >
        Spott
      </Text>
      <Text
        style={{ color: "#FFFFFF", fontSize: 14, marginTop: 8, opacity: 0.7 }}
      >
        Progress you can finally see.
      </Text>
    </View>
  );
}
