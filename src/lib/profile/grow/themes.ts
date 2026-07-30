import type { ProfileGrowTheme, ProfileGrowThemeId } from "@/types/profile-grow";

export const PROFILE_GROW_THEMES: ProfileGrowTheme[] = [
  {
    id: "favorite-music",
    label: "好きな音楽",
    opener: "最近、どんな音楽によく耳を傾けてる？",
    questions: [
      {
        message: "最近よく聴いているアーティストは？",
        inputMode: "select",
        picker: "artists",
        field: "favoriteArtists",
      },
      {
        message: "今コピーしたい曲は？",
        inputMode: "select",
        picker: "cover",
        field: "wantToCover",
      },
      {
        message: "その曲のどんなところに惹かれますか？",
        inputMode: "free",
        field: "bio",
      },
    ],
  },
  {
    id: "playing-style",
    label: "演奏スタイル",
    opener: "演奏してるなら、今のスタイルってどんな感じ？",
    questions: [
      {
        message: "今メインでやっているパートは？",
        inputMode: "select",
        picker: "parts",
        field: "wantToPlay",
      },
      {
        message: "今刺さっているジャンルは？",
        inputMode: "select",
        picker: "genres",
        field: "genres",
      },
      {
        message: "演奏で大切にしていることは？",
        inputMode: "free",
        field: "values",
      },
    ],
  },
  {
    id: "live",
    label: "ライブ",
    opener: "ライブ好き？最近のライブ事情も聞かせて。",
    questions: [
      {
        message: "よく行くライブハウスや推しの箱は？",
        inputMode: "select",
        picker: "liveHouses",
        field: "favoriteLiveHouses",
      },
      {
        message: "行きたいフェスやイベントは？",
        inputMode: "select",
        picker: "festivals",
        field: "favoriteFestivals",
      },
      {
        message: "最近観たライブで印象に残っていることは？",
        inputMode: "free",
        field: "liveHistory",
      },
    ],
  },
  {
    id: "gear",
    label: "機材",
    opener: "愛用の機材とか、最近触ってる機材ある？",
    questions: [
      {
        message: "今いちばん手放せない機材は？",
        inputMode: "select",
        picker: "gear",
        field: "gear",
      },
      {
        message: "次に欲しい機材や気になっているものは？",
        inputMode: "select",
        picker: "wantedGear",
        field: "gear",
      },
      {
        message: "機材選びでこだわっているポイントは？",
        inputMode: "free",
        field: "bio",
      },
    ],
  },
  {
    id: "band-activity",
    label: "バンド活動",
    opener: "バンド活動、今どんな感じ？",
    questions: [
      {
        message: "組みたいバンドのイメージやスタイルは？",
        inputMode: "select",
        picker: "style",
        field: "style",
      },
      {
        message: "募集しているパートやメンバーは？",
        inputMode: "select",
        picker: "members",
        field: "lookingFor",
      },
      {
        message: "バンドで大切にしたいことや活動の目標は？",
        inputMode: "free",
        field: "style",
      },
    ],
  },
  {
    id: "production",
    label: "作曲・DTM",
    opener: "作曲とかDTM、最近どんな感じでやってる？",
    questions: [
      {
        message: "最近作っている曲や作りたい曲は？",
        inputMode: "select",
        picker: "cover",
        field: "wantToCover",
      },
      {
        message: "制作で使っているDAWや機材は？",
        inputMode: "select",
        picker: "production",
        field: "gear",
      },
      {
        message: "参考にしているサウンドや作りたい雰囲気は？",
        inputMode: "free",
        field: "bio",
      },
    ],
  },
  {
    id: "live-houses",
    label: "好きなライブハウス",
    opener: "ライブハウス、お気に入りの場所ある？",
    questions: [
      {
        message: "よく行くライブハウスや推しの箱は？",
        inputMode: "select",
        picker: "liveHouses",
        field: "favoriteLiveHouses",
      },
      {
        message: "他にも行きたい会場は？",
        inputMode: "select",
        picker: "liveHouses",
        field: "favoriteLiveHouses",
      },
      {
        message: "その箱の良さや、ライブハウスで大切にしたいことは？",
        inputMode: "free",
        field: "values",
      },
    ],
  },
  {
    id: "studios",
    label: "好きなスタジオ",
    opener: "スタジオ、よく使う場所ある？",
    questions: [
      {
        message: "よく入っているスタジオは？",
        inputMode: "select",
        picker: "studios",
        field: "favoriteStudios",
      },
      {
        message: "他にも行きたいスタジオは？",
        inputMode: "select",
        picker: "studios",
        field: "favoriteStudios",
      },
      {
        message: "スタジオ選びでこだわっていることは？",
        inputMode: "free",
        field: "bio",
      },
    ],
  },
  {
    id: "festivals",
    label: "好きなフェス",
    opener: "フェス好き？行ったことあるフェスとか聞かせて。",
    questions: [
      {
        message: "印象に残っているフェスは？",
        inputMode: "select",
        picker: "festivals",
        field: "favoriteFestivals",
      },
      {
        message: "今年行きたいフェスやイベントは？",
        inputMode: "select",
        picker: "festivals",
        field: "favoriteFestivals",
      },
      {
        message: "フェスで観たいアーティストや、フェスに求めるものは？",
        inputMode: "free",
        field: "bio",
      },
    ],
  },
];

export function pickRandomProfileGrowTheme(
  excludeId?: ProfileGrowThemeId
): ProfileGrowTheme {
  const pool = excludeId
    ? PROFILE_GROW_THEMES.filter((theme) => theme.id !== excludeId)
    : PROFILE_GROW_THEMES;

  return pool[Math.floor(Math.random() * pool.length)] ?? PROFILE_GROW_THEMES[0];
}

export function getProfileGrowTheme(id: ProfileGrowThemeId): ProfileGrowTheme {
  return PROFILE_GROW_THEMES.find((theme) => theme.id === id) ?? PROFILE_GROW_THEMES[0];
}
