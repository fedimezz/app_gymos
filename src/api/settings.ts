import { apiGet } from "@/api/client";

export interface PublicSettings {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
  hasTenant: boolean;
}

export const fetchPublicSettings = () => apiGet<PublicSettings>("/api/settings/public");
