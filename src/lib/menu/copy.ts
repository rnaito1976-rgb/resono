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
  title: "Terms of Use",
  subtitle: "Resonoを気持ちよく利用していただくためのルールです。",
  version: "Version 0.1",
  lastUpdated: "Last Updated: March 2026",
  sections: [
    {
      id: "about",
      heading: "Resonoについて",
      paragraphs: [
        "Resonoは、共鳴する仲間と出会い、バンドを始めるためのコミュニティです。",
        "すべてのユーザーが安心して利用できる環境を目指しています。",
      ],
    },
    {
      id: "guidelines",
      heading: "お願いしたいこと",
      paragraphs: [
        "Resonoでは、お互いを尊重したコミュニケーションをお願いします。",
        "以下のような行為は禁止しています。",
      ],
      bullets: [
        "誹謗中傷や嫌がらせ",
        "差別的な発言や投稿",
        "スパムや迷惑行為",
        "虚偽のプロフィール登録",
        "他人になりすます行為",
        "法令や公序良俗に反する行為",
        "サービスの運営を妨げる行為",
      ],
    },
    {
      id: "posts",
      heading: "投稿について",
      paragraphs: [
        "プロフィール、写真、動画リンク、投稿などの内容は、投稿した本人が責任を持って管理してください。",
        "投稿内容の権利はユーザー本人に帰属します。",
        "ただし、サービス紹介や運営上必要な範囲で利用する場合があります。",
      ],
    },
    {
      id: "account",
      heading: "アカウントについて",
      paragraphs: [
        "アカウント情報はご自身で管理してください。",
        "利用規約に違反する行為が確認された場合、運営者はアカウントの利用停止や削除を行うことがあります。",
      ],
    },
    {
      id: "service",
      heading: "サービスについて",
      paragraphs: [
        "Resonoは継続的に改善を行っています。",
        "新機能の追加や仕様変更、メンテナンスなどにより、サービス内容が変更される場合があります。",
      ],
    },
    {
      id: "disclaimer",
      heading: "免責事項",
      paragraphs: [
        "Resonoはユーザー同士の出会いをサポートするサービスです。",
        "ユーザー間で発生したトラブルについて、運営者は故意または重大な過失がある場合を除き責任を負いません。",
      ],
    },
    {
      id: "vision",
      heading: "私たちの想い",
      paragraphs: [
        "Resonoは、音楽も、ファッションも、価値観も。",
        "共鳴する仲間と出会い、長く音楽を楽しめる場所を目指しています。",
        "利用者のみなさんと一緒に、安心できるコミュニティを育てていけたら嬉しいです。",
      ],
    },
  ],
} as const;
