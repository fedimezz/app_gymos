import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import ClubSearchScreen from "@/screens/ClubSearchScreen";
import LoginScreen from "@/screens/LoginScreen";
import HomeScreen from "@/screens/HomeScreen";

// No @react-navigation stack yet — with only three linear steps there's
// nothing a real navigator adds over three `if`s. Swap this for
// NavigationContainer + createNativeStackNavigator once there's more than
// one screen per section (that's part of the flow/design conversation).
export default function RootNavigator() {
  const { user, club } = useAuth();

  if (user === undefined) {
    // Still restoring from SecureStore on launch.
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (user) return <HomeScreen />;
  if (club) return <LoginScreen />;
  return <ClubSearchScreen />;
}
