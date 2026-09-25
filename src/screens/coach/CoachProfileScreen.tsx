import { useAsync } from "@/hooks/useAsync";
import { fetchCoachStats } from "@/api/coach";
import ProfileScreen from "@/screens/shared/ProfileScreen";
import CoachStatsCard from "@/screens/coach/CoachStatsCard";

export default function CoachProfileScreen() {
  const stats = useAsync(fetchCoachStats, []);
  return <ProfileScreen header={<CoachStatsCard stats={stats} />} onRefreshExtra={stats.reload} extraRefreshing={stats.refreshing} />;
}
