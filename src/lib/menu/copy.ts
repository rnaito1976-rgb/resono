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
  subtitle:
    "安心してResonoを使っていただくために、\n私たちが大切にしていることです。",
  version: "Version 0.1",
  lastUpdated: "Last Updated: March 2026",
  sections: [
    {
      id: "info",
      heading: "あなたの情報について",
      paragraphs: [
        "Resonoでは、アカウントやプロフィールの作成、バンドメンバー募集やマッチングなど、サービスを提供するために必要な情報をお預かりします。",
        "取得した情報は、サービスの提供・改善・安全な運営のために利用します。",
      ],
    },
    {
      id: "privacy",
      heading: "あなたのプライバシーについて",
      paragraphs: [
        "安心して音楽仲間と出会える場所であるために、Resonoはユーザーのプライバシーを大切にしています。",
        "プロフィールやメッセージなどの情報は、サービス提供に必要な範囲でのみ利用します。",
        "運営者がこれらの情報を確認するのは、以下のような必要な場合に限ります。",
      ],
      bullets: [
        "ユーザーからサポートや調査の依頼があった場合",
        "スパムや迷惑行為などの調査が必要な場合",
        "システム障害や不具合の調査が必要な場合",
        "法令に基づく対応が必要な場合",
      ],
      footer:
        "それ以外の目的で内容を確認したり、第三者へ提供・販売することはありません。",
    },
    {
      id: "ai",
      heading: "AI機能について",
      paragraphs: [
        "Resonoでは、プロフィール作成やマッチング体験をより良くするためにAIを利用しています。",
        "AIへの入力内容は、サービス提供や品質向上のために利用される場合があります。",
      ],
    },
    {
      id: "services",
      heading: "利用しているサービス",
      paragraphs: [
        "Resonoではサービス運営のために以下のサービスを利用しています。",
      ],
      bullets: ["Supabase", "Vercel", "OpenAI"],
      footer:
        "今後サービスの成長に合わせて追加・変更される場合があります。",
    },
    {
      id: "promise",
      heading: "私たちの約束",
      bullets: [
        "必要以上の個人情報は取得しません。",
        "個人情報を第三者へ販売することはありません。",
        "安心して音楽仲間と出会える場所を目指します。",
        "ユーザーの声を大切にしながらサービスを改善し続けます。",
      ],
    },
    {
      id: "contact",
      heading: "お問い合わせ",
      feedbackLink: true,
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
