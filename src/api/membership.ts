import { apiGet, apiPost } from "@/api/client";
import type { MembershipResponse } from "@/api/types";

export function fetchMembership(): Promise<MembershipResponse> {
  return apiGet<MembershipResponse>("/api/dashboard/membership");
}

interface SubscribeResponse {
  message: string;
  subscription: { id: string; status: string };
  payUrl?: string; // present for ONLINE payments — open in an in-app browser
}

export function subscribeToPlan(
  planId: string,
  paymentMethod: "ONLINE" | "ONSITE",
  promoCode?: string
): Promise<SubscribeResponse> {
  return apiPost<SubscribeResponse>("/api/dashboard/membership/subscribe", { planId, paymentMethod, promoCode });
}
