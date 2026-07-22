import { Member } from "@/types/member";

export const members: Member[] = [
  {
    id: "1",
    name: "Yui",
    resonanceRate: 94,
    tags: ["シティポップ", "夜更け", "アナログ", "詩的"],
    aiComment: "静かな夜の街と、少しだけ切ないメロディが似合う人。",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    portrait: {
      bio: "歌詞を書きながら、都市の温度を音に変える。日常の断片を、誰かの記憶に触れる言葉へ。",
      age: 24,
      location: "東京",
      influences: ["竹内まりや", "宇多田ヒカル", "Cornelius"],
    },
    music: {
      genres: ["City Pop", "Alternative R&B", "Neo-Soul"],
      favoriteArtists: ["宇多田ヒカル", "FKJ", "Nujabes"],
      instruments: ["ボーカル", "キーボード"],
      listeningMood: "深夜1時、窓を開けて聴く音楽",
    },
    fashion: {
      style: "ミニマル × レトロ",
      colors: ["ブラック", "クリーム", "ダークグリーン"],
      brands: ["AURALEE", "Studio Nicholson"],
      description: "余白のあるシルエット。素材の質感を大切にした、静かな存在感。",
    },
    mood: {
      keywords: ["内省的", "都市的", "ノスタルジック"],
      atmosphere: "雨上がりの交差点、ネオンが水面に映る",
      creativeTime: "23:00 — 02:00",
      description: "感情を整える時間帯に、言葉と音が自然と重なる。",
    },
    lookingFor: {
      parts: ["ギター", "ベース", "ドラム"],
      bandVision: "都市の孤独を、温かいグルーヴに変えるバンド",
      commitment: "月2回のスタジオ、月1回のライブ",
    },
  },
  {
    id: "2",
    name: "Ren",
    resonanceRate: 88,
    tags: ["Post-Punk", "モノクロ", "反骨", "ライブ"],
    aiComment: "ステージの熱と、研ぎ澄まされた美学が共鳴するタイプ。",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    portrait: {
      bio: "ギターの歪みで世界を切り裂く。音より先に、態度がある。",
      age: 27,
      location: "大阪",
      influences: ["The Strokes", "Television", "NUMBER GIRL"],
    },
    music: {
      genres: ["Post-Punk", "Indie Rock", "Garage"],
      favoriteArtists: ["IDLES", "Fontaines D.C.", "くるり"],
      instruments: ["ギター", "ボーカル"],
      listeningMood: "リハ前のウォームアップ",
    },
    fashion: {
      style: "モノトーン × ワーク",
      colors: ["ブラック", "ホワイト", "グレー"],
      brands: ["Dr. Martens", "Carhartt WIP"],
      description: "機能性と反骨心。シンプルだが、妥協のない佇まい。",
    },
    mood: {
      keywords: ["攻撃的", "直感的", "エネルギッシュ"],
      atmosphere: "スモークとスポットライト、汗と叫び",
      creativeTime: "19:00 — 23:00",
      description: "身体が動き出すとき、アイデアも一緒に走り出す。",
    },
    lookingFor: {
      parts: ["ベース", "ドラム", "シンセ"],
      bandVision: "小箱でも会場を揺らす、生のロックバンド",
      commitment: "週1リハ、月2ライブ以上",
    },
  },
  {
    id: "3",
    name: "Mio",
    resonanceRate: 91,
    tags: ["Lo-fi", "昼下がり", "フィルム", "優しい"],
    aiComment: "柔らかな光と、少しだけ霞んだ記憶を大切にする人。",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80",
    portrait: {
      bio: "カセットテープのノイズの中に、消えかけた夏を閉じ込める。",
      age: 22,
      location: "横浜",
      influences: ["Clairo", "Mitski", "羊文学"],
    },
    music: {
      genres: ["Lo-fi", "Bedroom Pop", "Indie Folk"],
      favoriteArtists: ["beabadoobee", "Phoebe Bridgers", "あいみょん"],
      instruments: ["ボーカル", "アコギ"],
      listeningMood: "午後の日差しが差し込む部屋",
    },
    fashion: {
      style: "ヴィンテージ × ナチュラル",
      colors: ["ベージュ", "セージグリーン", "オフホワイト"],
      brands: ["古着", "UNIQLO U"],
      description: "着古した生地の温度。無理のない、自分らしいレイヤー。",
    },
    mood: {
      keywords: ["穏やか", "郷愁", "繊細"],
      atmosphere: "カーテン越しの光、古いアルバムの表紙",
      creativeTime: "14:00 — 18:00",
      description: "静かな時間に、小さな感情が音になる。",
    },
    lookingFor: {
      parts: ["キーボード", "ベース"],
      bandVision: "日常をそのまま、美しい音にするデュオ〜バンド",
      commitment: "隔週リハ、SNS発信も一緒に",
    },
  },
  {
    id: "4",
    name: "Kaito",
    resonanceRate: 86,
    tags: ["Techno", "深夜", "ミニマル", "集中"],
    aiComment: "規則正しいビートの中に、独自の世界観を築くタイプ。",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80",
    portrait: {
      bio: "DAWの中で都市を設計する。4つ打ちは、心臓の代わり。",
      age: 29,
      location: "名古屋",
      influences: ["Burial", "Four Tet", "Shinichi Atobe"],
    },
    music: {
      genres: ["Techno", "Ambient", "Electronica"],
      favoriteArtists: ["Bonobo", "Floating Points", "Ryuichi Sakamoto"],
      instruments: ["シンセ", "DAW", "ドラムマシン"],
      listeningMood: "ヘッドホンで没入する深夜",
    },
    fashion: {
      style: "テック × ミニマル",
      colors: ["ブラック", "チャコール", "ネイビー"],
      brands: ["Arc'teryx", "Nike ACG"],
      description: "動きやすさと機能美。装飾より、シルエットで語る。",
    },
    mood: {
      keywords: ["集中", "分析的", "クール"],
      atmosphere: "モニターの青い光、静かなスタジオ",
      creativeTime: "00:00 — 05:00",
      description: "世界が眠る時間に、最もクリアなアイデアが生まれる。",
    },
    lookingFor: {
      parts: ["VJ", "ライブPA", "ボーカル"],
      bandVision: "音と映像で空間を作る、ライブエレクトロニカ",
      commitment: "月1制作会、四半期に1ライブ",
    },
  },
  {
    id: "5",
    name: "Sora",
    resonanceRate: 92,
    tags: ["Jazz", "自由", "即興", "夜"],
    aiComment: "即興の中に、言葉にできない感情を託す人。",
    photo:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    portrait: {
      bio: "スケールの向こう側へ。譜面より、呼吸で合わせる。",
      age: 26,
      location: "京都",
      influences: ["Miles Davis", "Hiromi", "青葉市子"],
    },
    music: {
      genres: ["Jazz", "Neo-Soul", "Experimental"],
      favoriteArtists: ["Esperanza Spalding", "Kamasi Washington", "e.s.t"],
      instruments: ["ピアノ", "ボーカル"],
      listeningMood: "ジャズバーの最後のセット",
    },
    fashion: {
      style: "アヴァンギャルド × クラシック",
      colors: ["ディープレッド", "ブラック", "ゴールド"],
      brands: ["COMME des GARÇONS", "Yohji Yamamoto"],
      description: "時間を超えた佇まい。舞台衣装のような、物語を纏う服。",
    },
    mood: {
      keywords: ["自由", "情熱的", "詩的"],
      atmosphere: "スモーキーなバー、即興の余韻",
      creativeTime: "21:00 — 01:00",
      description: "予定調和を壊す瞬間に、本当の音楽が始まる。",
    },
    lookingFor: {
      parts: ["サックス", "コントラバス", "ドラム"],
      bandVision: "即興と構成が共存する、新しいジャズの形",
      commitment: "週1セッション、ジャズフェス出演目標",
    },
  },
];

export function getMemberById(id: string): Member | undefined {
  return members.find((member) => member.id === id);
}
