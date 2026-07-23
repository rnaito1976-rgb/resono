export const DEFAULT_PHOTO_URL =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80";

export function hasCustomPhotoUrl(photo: string): boolean {
  return Boolean(photo && !photo.includes("photo-1534528741775"));
}

export function isOnboardingComplete(member: {
  portrait: { dialogueCompleted?: boolean; bio?: string };
  tags: string[];
}): boolean {
  if (member.portrait.dialogueCompleted === true) {
    return true;
  }

  // AI対話導入前に作成されたプロフィールも完了扱いにする
  return Boolean(member.portrait.bio?.trim()) && member.tags.length > 0;
}
