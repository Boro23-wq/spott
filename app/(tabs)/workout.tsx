import { View, Text, StyleSheet } from "react-native";

export default function WorkoutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Workout</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "#FFFFFF", fontSize: 24 },
});
