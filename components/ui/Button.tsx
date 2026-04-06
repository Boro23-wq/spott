import { TouchableOpacity, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
};

export default function Button({ title, onPress, variant = "primary" }: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant]]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, variant === "outline" && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#FF6B6B",
  },
  secondary: {
    backgroundColor: "#1F1F1F",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  outlineText: {
    color: "#FF6B6B",
  },
});
