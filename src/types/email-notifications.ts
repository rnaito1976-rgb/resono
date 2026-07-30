export type EmailNotificationPreferences = {
  resonanceMembers: boolean;
  messages: boolean;
  bandRecruitment: boolean;
};

export type EmailNotificationPreferenceKey = keyof EmailNotificationPreferences;

export const DEFAULT_EMAIL_NOTIFICATION_PREFERENCES: EmailNotificationPreferences = {
  resonanceMembers: true,
  messages: true,
  bandRecruitment: true,
};

export const EMAIL_NOTIFICATION_ITEMS: {
  key: EmailNotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  {
    key: "resonanceMembers",
    title: "共鳴するメンバー",
    description: "あなたと相性の良いメンバーが参加・更新したとき",
  },
  {
    key: "messages",
    title: "メッセージ",
    description: "新しいメッセージを受信したとき",
  },
  {
    key: "bandRecruitment",
    title: "あなたに合うバンド募集",
    description: "担当パートや音楽性に合う募集が公開されたとき",
  },
];
