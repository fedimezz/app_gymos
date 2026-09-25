import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme, type Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeContext";
import { ErrorState } from "@/components/StateViews";
import type { RootStackParamList } from "@/navigation/types";
import MemberTabs from "@/navigation/MemberTabs";
import CoachTabs from "@/navigation/CoachTabs";
import ClubSearchScreen from "@/screens/ClubSearchScreen";
import LoginScreen from "@/screens/LoginScreen";
import UnsupportedRoleScreen from "@/screens/shared/UnsupportedRoleScreen";
import NotificationsScreen from "@/screens/shared/NotificationsScreen";
import CoachRosterScreen from "@/screens/coach/CoachRosterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

// Screens pushed on top of the tabs get a real header with a back button
// (the stack itself is headerless: the auth screens and tabs draw their own).
const pushedScreenOptions = { headerShown: true, headerBackButtonDisplayMode: "minimal" as const };

// Auth flow per the React Navigation docs: which screens exist depends on
// auth state, so signing in/out swaps the whole tree (and its navigation
// state) instead of imperatively navigating. Screens that will sit ON TOP of
// the tabs later (coach roster, notifications) get added to this stack.
export default function RootNavigator() {
  const { user, club, restoreFailed, retryRestore } = useAuth();
  const { colors, isDark } = useTheme();

  // Header, tab bar and screen backgrounds all read from this theme, so they
  // follow the club's brand color and light/dark mode with no per-screen work.
  const navTheme: Theme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);

  if (user === undefined) {
    // Still restoring the session from SecureStore on launch.
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        {restoreFailed ? (
          <ErrorState
            title="Connexion impossible"
            message="Impossible de joindre le serveur. Vérifiez votre connexion."
            actionLabel="Réessayer"
            onAction={retryRestore}
          />
        ) : (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          club ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="ClubSearch" component={ClubSearchScreen} />
          )
        ) : user.role === "MEMBER" ? (
          <>
            <Stack.Screen name="MemberTabs" component={MemberTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ ...pushedScreenOptions, title: "Notifications" }} />
          </>
        ) : user.role === "COACH" ? (
          <>
            <Stack.Screen name="CoachTabs" component={CoachTabs} />
            <Stack.Screen name="CoachRoster" component={CoachRosterScreen} options={{ ...pushedScreenOptions, title: "Présences" }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ ...pushedScreenOptions, title: "Notifications" }} />
          </>
        ) : (
          <Stack.Screen name="UnsupportedRole" component={UnsupportedRoleScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
