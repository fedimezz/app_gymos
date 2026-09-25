import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/theme/ThemeContext";
import { baseTabOptions, tabIcon } from "@/navigation/tabOptions";
import type { CoachTabParamList } from "@/navigation/types";
import CoachProfileScreen from "@/screens/coach/CoachProfileScreen";
import CoachTodayScreen from "@/screens/coach/CoachTodayScreen";
import CoachScheduleScreen from "@/screens/coach/CoachScheduleScreen";

const Tab = createBottomTabNavigator<CoachTabParamList>();

export default function CoachTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator screenOptions={baseTabOptions(colors)}>
      <Tab.Screen
        name="Today"
        component={CoachTodayScreen}
        options={{ title: "Aujourd'hui", tabBarIcon: tabIcon("today", "today-outline") }}
      />
      <Tab.Screen
        name="CoachSchedule"
        component={CoachScheduleScreen}
        options={{ title: "Planning", tabBarIcon: tabIcon("calendar", "calendar-outline") }}
      />
      <Tab.Screen
        name="CoachProfile"
        component={CoachProfileScreen}
        options={{ title: "Profil", tabBarIcon: tabIcon("person", "person-outline") }}
      />
    </Tab.Navigator>
  );
}
