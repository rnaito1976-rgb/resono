/** AI会話由来の共鳴シグナル。スコア計算には使うがプロフィール画面には出さない。 */
export type MemberResonanceSignals = {
  /** コピー / オリジナル志向 */
  musicFocus?: string[];
  /** 会話テンポなど */
  conversation?: string[];
  /** 理想のメンバー像 */
  idealMember?: string[];
  /** バンドで大切にしたいこと（対話由来） */
  bandValues?: string[];
  /** その他の対話由来メモ */
  notes?: string[];
};

export function mergeResonanceSignals(
  current: MemberResonanceSignals | undefined,
  next: MemberResonanceSignals
): MemberResonanceSignals {
  const mergeList = (left?: string[], right?: string[]) => {
    const values = [...(left ?? []), ...(right ?? [])]
      .map((item) => item.trim())
      .filter(Boolean);
    return values.length > 0 ? [...new Set(values)] : undefined;
  };

  return {
    musicFocus: mergeList(current?.musicFocus, next.musicFocus),
    conversation: mergeList(current?.conversation, next.conversation),
    idealMember: mergeList(current?.idealMember, next.idealMember),
    bandValues: mergeList(current?.bandValues, next.bandValues),
    notes: mergeList(current?.notes, next.notes),
  };
}
