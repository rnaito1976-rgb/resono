export const queryKeys = {
  members: {
    feed: (viewerId?: string) => ["members", "feed", viewerId ?? "anonymous"] as const,
    profile: (memberId: string) => ["members", "profile", memberId, "v2"] as const,
  },
  resonance: {
    status: (memberId: string) => ["resonance", "status", memberId] as const,
    unreadCount: () => ["resonance", "unread-count"] as const,
  },
  bands: {
    unreadCount: () => ["bands", "unread-count"] as const,
  },
  recruitment: {
    applied: (targetMemberId: string) =>
      ["recruitment", "applied", targetMemberId] as const,
    applicants: (targetMemberId: string) =>
      ["recruitment", "applicants", targetMemberId] as const,
  },
  communityCatalog: {
    items: (catalogKey: string) => ["community-catalog", catalogKey] as const,
  },
} as const;
