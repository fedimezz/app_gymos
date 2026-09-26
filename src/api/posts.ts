import { apiGet } from "@/api/client";
import type { Post } from "@/api/types";

// GET /api/posts returns a bare array, not { posts: [...] } — matches the
// backend route exactly (see app/api/posts/route.ts in the web repo).
export function fetchPosts(): Promise<Post[]> {
  return apiGet<Post[]>("/api/posts");
}
