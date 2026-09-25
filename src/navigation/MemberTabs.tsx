import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/theme/ThemeContext";
import { baseTabOptions, tabIcon } from "@/navigation/tabOptions";
import type { MemberTabParamList } from "@/navigation/types";
import HomeScreen from "@/screens/member/HomeScreen";
import ScheduleScreen from "@/screens/member/ScheduleScreen";
import MembershipScreen from "@/screens/member/MembershipScreen";
import ProfileScreen from "@/screens/shared/ProfileScreen";

const Tab = createBottomTabNavigator<MemberTabParamList>();

export default function MemberTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={baseTabOptions(colors)}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Accueil", tabBarIcon: tabIcon("home", "home-outline") }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ title: "Planning", tabBarIcon: tabIcon("calendar", "calendar-outline") }}
      />
      <Tab.Screen
        name="Membership"
        component={MembershipScreen}
        options={{ title: "Abonnement", tabBarIcon: tabIcon("card", "card-outline") }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profil", tabBarIcon: tabIcon("person", "person-outline") }}
      />
    </Tab.Navigator>
  );
}
