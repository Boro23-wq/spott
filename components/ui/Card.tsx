import { View, StyleSheet, ViewProps } from "react-native";

export default function Card({ children, style, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
