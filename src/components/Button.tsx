import { Pressable, Text, ActivityIndicator, StyleSheet, type PressableProps } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { radius, spacing } from "@/theme/ThemeContext";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({ label, variant = "primary", loading, fullWidth, disabled, ...props }: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const bg = { primary: colors.primary, secondary: colors.surface, danger: colors.danger }[variant];
  const border = variant === "secondary" ? colors.border : "transparent";
  const textColor = variant === "secondary" ? colors.text : colors.primaryText;

  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        fullWidth && { width: "100%" },
        { backgroundColor: bg, borderColor: border, borderWidth: variant === "secondary" ? 1 : 0, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 14, paddingHorizontal: spacing.xl, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  label: { fontWeight: "700", fontSize: 15 },
});
