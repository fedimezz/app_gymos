import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "@/auth/AuthContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";
import ThemeSync from "@/theme/ThemeSync";
import RootNavigator from "@/navigation/RootNavigator";

// Reads the resolved theme AFTER ThemeProvider mounts (a component can't
// read the context it's wrapped by), just to set the status bar + safe-area
// background to match — everything else reads useTheme() directly.
function Shell() {
  const { colors, isDark } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeSync />
      <RootNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <Shell />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
