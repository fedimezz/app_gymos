import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/auth/AuthContext";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";
import ThemeSync from "@/theme/ThemeSync";
import RootNavigator from "@/navigation/RootNavigator";

// Reads the resolved theme AFTER ThemeProvider mounts (a component can't
// read the context it's wrapped by), just to set the status bar + root
// background to match — everything else reads useTheme() directly.
//
// Deliberately NOT a SafeAreaView: the navigators own the safe-area insets
// (header on top, tab bar on the bottom). Wrapping them here as well would
// pad the top and bottom twice.
function Shell() {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemeSync />
      <RootNavigator />
      <StatusBar style={isDark ? "light" : "dark"} />
    </View>
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
