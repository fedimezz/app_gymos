import { Text, TextInput, View, type TextInputProps } from "react-native";
import { useTheme, spacing, radius, typography } from "@/theme/ThemeContext";

interface Props extends TextInputProps {
  label?: string;
  error?: string | null;
}

/** Themed text input with an optional label and inline error. */
export default function TextField({ label, error, style, ...props }: Props) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={props.accessibilityLabel ?? label}
        placeholderTextColor={colors.textMuted}
        {...props}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            color: colors.text,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            fontSize: 15,
          },
          style,
        ]}
      />
      {error ? <Text style={[typography.caption, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}
