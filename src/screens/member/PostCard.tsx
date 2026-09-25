import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, spacing, radius, typography } from "@/theme/ThemeContext";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import { timeAgo } from "@/lib/dates";
import type { Post } from "@/api/types";

/** One actualité. Tap to expand/collapse the text. Read-only: likes and comments are shown as counts. */
export default function PostCard({ post, now }: { post: Post; now: Date }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable onPress={() => setExpanded((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded }}>
      <Card style={{ gap: spacing.sm }}>
        {post.mediaType === "image" && post.mediaUrl ? (
          <Image
            source={{ uri: post.mediaUrl }}
            accessibilityLabel={post.title ?? "Image de l'actualité"}
            style={{ width: "100%", height: 160, borderRadius: radius.md, backgroundColor: colors.border }}
            resizeMode="cover"
          />
        ) : post.mediaType ? (
          <Badge label={post.mediaType === "video" ? "Vidéo" : "Audio"} tone="neutral" />
        ) : null}

        {post.title ? <Text style={[typography.h2, { color: colors.text }]}>{post.title}</Text> : null}
        <Text style={[typography.body, { color: colors.text }]} numberOfLines={expanded ? undefined : 3}>
          {post.content}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <Text style={[typography.small, { color: colors.textMuted, flex: 1 }]} numberOfLines={1}>
            {post.author.name} · {timeAgo(new Date(post.createdAt), now)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
            <Text style={[typography.small, { color: colors.textMuted }]}>{post.likes.length}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="chatbubble-outline" size={14} color={colors.textMuted} />
            <Text style={[typography.small, { color: colors.textMuted }]}>{post.comments.length}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
