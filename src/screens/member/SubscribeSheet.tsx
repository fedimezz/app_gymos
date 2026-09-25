import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, spacing, radius, typography } from "@/theme/ThemeContext";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import { formatPrice } from "@/lib/format";
import type { MembershipPlan } from "@/api/types";

export type PaymentMethod = "ONLINE" | "ONSITE";

const METHODS: { value: PaymentMethod; title: string; hint: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "ONLINE", title: "Payer en ligne", hint: "Paiement sécurisé, activation dès validation.", icon: "card-outline" },
  { value: "ONSITE", title: "Payer à l'accueil", hint: "Réglez à la salle : l'abonnement est activé après confirmation.", icon: "storefront-outline" },
];

interface Props {
  visible: boolean;
  plan: MembershipPlan | null;
  promoCode: string;
  method: PaymentMethod;
  pending: boolean;
  error: string | null;
  onMethodChange: (method: PaymentMethod) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SubscribeSheet({ visible, plan, promoCode, method, pending, error, onMethodChange, onClose, onConfirm }: Props) {
  const { colors } = useTheme();
  if (!plan) return null;

  return (
    <BottomSheet visible={visible} onClose={pending ? () => {} : onClose}>
      <View style={{ gap: spacing.md }}>
        <View>
          <Text style={[typography.h1, { color: colors.text }]}>{plan.name}</Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            {formatPrice(plan.price)} · {plan.durationDays} jours
          </Text>
          {promoCode.trim() ? (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
              Code promo {promoCode.trim().toUpperCase()} — vérifié à la confirmation.
            </Text>
          ) : null}
        </View>

        <View style={{ gap: spacing.sm }}>
          {METHODS.map((m) => {
            const selected = m.value === method;
            return (
              <Pressable
                key={m.value}
                onPress={() => onMethodChange(m.value)}
                disabled={pending}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                }}
              >
                <Ionicons name={m.icon} size={22} color={selected ? colors.primary : colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h2, { color: colors.text }]}>{m.title}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{m.hint}</Text>
                </View>
                <Ionicons name={selected ? "radio-button-on" : "radio-button-off"} size={20} color={selected ? colors.primary : colors.textMuted} />
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <Text accessibilityLiveRegion="polite" style={[typography.body, { color: colors.danger, fontWeight: "600" }]}>
            {error}
          </Text>
        ) : null}

        <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
          <Button label="Confirmer" loading={pending} onPress={onConfirm} fullWidth />
          <Button label="Fermer" variant="secondary" disabled={pending} onPress={onClose} fullWidth />
        </View>
      </View>
    </BottomSheet>
  );
}
