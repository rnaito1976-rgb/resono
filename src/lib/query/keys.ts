export const queryKeys = {
  members: {
    feed: (viewerId?: string) => ["members", "feed", viewerId ?? "anonymous"] as const,
  },
  resonance: {
    status: (memberId: string) => ["resonance", "status", memberId] as const,
    unreadCount: () => ["resonance", "unread-count"] as const,
  },
  bands: {
    unreadCount: () => ["bands", "unread-count"] as const,
  },
} as const;
