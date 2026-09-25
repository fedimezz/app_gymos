import { Ionicons } from "@expo/vector-icons";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import type { Palette } from "@/theme/palette";

type IconName = keyof typeof Ionicons.glyphMap;

/** Filled icon when the tab is focused, outline otherwise. */
export const tabIcon =
  (focused: IconName, unfocused: IconName): NonNullable<BottomTabNavigationOptions["tabBarIcon"]> =>
  ({ focused: isFocused, color, size }) =>
    <Ionicons name={isFocused ? focused : unfocused} size={size} color={color} />;

/**
 * Options shared by the member and coach tab bars. Header/tab-bar background,
 * text and border colors come from the NavigationContainer theme built in
 * RootNavigator (which is itself derived from useTheme().colors), so only the
 * tints are set here.
 */
export function baseTabOptions(colors: Palette): BottomTabNavigationOptions {
  return {
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
    headerTitleStyle: { fontWeight: "700" },
    sceneStyle: { backgroundColor: colors.background },
  };
}
