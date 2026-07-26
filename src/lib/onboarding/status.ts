export const DEFAULT_PHOTO_URL =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80";

export const NO_PHOTO_URL = "";

export function isDefaultPlaceholderPhoto(photo: string): boolean {
  return photo.includes("photo-1534528741775");
}

export function hasProfilePhoto(photo: string | undefined | null): boolean {
  return Boolean(photo?.trim() && !isDefaultPlaceholderPhoto(photo));
}

export function hasCustomPhotoUrl(photo: string): boolean {
  return hasProfilePhoto(photo);
}

export function isDialogueOnboardingComplete(member: {
  portrait: { dialogueCompleted?: boolean };
}): boolean {
  return member.portrait.dialogueCompleted === true;
}

export function isOnboardingComplete(member: {
  portrait: { dialogueCompleted?: boolean };
  frequencyColor?: string;
}): boolean {
  return (
    isDialogueOnboardingComplete(member) && Boolean(member.frequencyColor)
  );
}

export function needsFrequencyColorSelection(member: {
  portrait: { dialogueCompleted?: boolean };
  frequencyColor?: string;
}): boolean {
  return isDialogueOnboardingComplete(member) && !member.frequencyColor;
}
