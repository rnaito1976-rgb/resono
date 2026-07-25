export const MENU_ABOUT = {
  title: "共鳴する仲間と、バンドを始めよう。",
  body: "音楽も、ファッションも、価値観も。\n共鳴でつながる、新しいバンドメンバー募集サービス。",
  version: "Version 0.1",
  footer: "Resonoは、音楽を愛する人たちと一緒に育てるプロダクトです。",
} as const;

export const MENU_FEEDBACK = {
  categories: [
    { id: "idea", label: "改善アイデアを送る" },
    { id: "bug", label: "不具合を報告する" },
    { id: "feature", label: "欲しい機能をリクエストする" },
  ] as const,
  successTitle: "ご意見ありがとうございます。",
  successBody: "Resonoは皆さんのフィードバックをもとに成長しています。",
  placeholder: "内容を入力してください…",
  submit: "送信する",
} as const;

export const MENU_SUPPORT = {
  intro:
    "Resonoはユーザーのフィードバックと応援によって少しずつ育っています。",
  usageIntro: "いただいた応援は",
  usageItems: [
    { icon: "🤖", label: "AI利用料" },
    { icon: "☁️", label: "サーバー運営" },
    { icon: "🎸", label: "新機能開発" },
  ] as const,
  usageFooter: "に大切に使わせていただきます。",
  coffeeButton: "☕ コーヒー1杯分で応援する",
  coffeeToast: "応援ありがとうございます！決済機能は近日公開予定です。",
} as const;

export const MENU_PRIVACY = {
  title: "Privacy Policy",
  updated: "Last updated: March 2026",
  sections: [
    {
      heading: "Information we collect",
      body: "Resono collects account information you provide during registration, profile content you choose to share, and usage data needed to operate the service.",
    },
    {
      heading: "How we use information",
      body: "We use your information to match musicians, enable messaging, improve recommendations, and maintain the security of the platform.",
    },
    {
      heading: "Contact",
      body: "Questions about privacy can be sent through Feedback in the app menu.",
    },
  ],
} as const;

export const MENU_TERMS = {
  title: "Terms of Service",
  updated: "Last updated: March 2026",
  sections: [
    {
      heading: "Using Resono",
      body: "Resono helps musicians discover each other and form bands. You agree to use the service respectfully and provide accurate profile information.",
    },
    {
      heading: "Your content",
      body: "You retain ownership of content you post. You grant Resono a license to display it within the service as needed to operate features you use.",
    },
    {
      heading: "Changes",
      body: "We may update these terms as the product evolves. Continued use after updates constitutes acceptance of the revised terms.",
    },
  ],
} as const;
