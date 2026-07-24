/** ⑫ 一覧・フィード向け: 巨大な JSON 列（portrait / fashion / mood）を除外して転送量を削減 */
export const MEMBER_LIST_COLUMNS =
  "id,user_id,name,resonance_rate,tags,ai_comment,photo,music,looking_for" as const;

/** ⑫ 詳細画面向け: 編集に必要な列のみ */
export const MEMBER_DETAIL_COLUMNS =
  "id,user_id,name,resonance_rate,tags,ai_comment,photo,portrait,music,fashion,looking_for" as const;

/** ⑫ メッセージ一覧: 本文プレビューに必要な列のみ */
export const MESSAGE_LIST_COLUMNS =
  "id,conversation_id,sender_member_id,body,created_at" as const;

/** ⑫ チャットルーム初回表示: 直近分のみ取得 */
export const MESSAGE_ROOM_COLUMNS =
  "id,conversation_id,sender_member_id,body,created_at" as const;

export const MESSAGE_ROOM_INITIAL_LIMIT = 50;
