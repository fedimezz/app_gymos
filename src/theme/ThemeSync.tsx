import { useEffect } from "react";
import { useAuth } from "@/auth/AuthContext";
import { useTheme } from "@/theme/ThemeContext";
import { fetchPublicSettings } from "@/api/settings";

// Deliberately a separate component rather than logic inside either
// provider: keeps AuthContext and ThemeContext from needing to know about
// each other. Renders nothing — just watches the selected club and applies
// its brand color once known. /api/settings/public is public and cached
// server-side, so this is cheap to call on every club change/app launch.
export default function ThemeSync() {
  const { club } = useAuth();
  const { setClubPrimaryColor } = useTheme();

  useEffect(() => {
    if (!club) {
      setClubPrimaryColor(null);
      return;
    }
    let cancelled = false;
    fetchPublicSettings()
      .then((settings) => {
        if (!cancelled) setClubPrimaryColor(settings.primaryColor);
      })
      .catch(() => {
        // Branding is cosmetic — silently keep the fallback palette rather
        // than blocking or showing an error over a failed color fetch.
      });
    return () => {
      cancelled = true;
    };
  }, [club?.apiBaseUrl]);

  return null;
}
