import type { ProfilePhotoModule } from "@/lib/profile-photo/types";

/**
 * Registry for future profile media modules.
 * photo: current upload + optimization flow
 * video: 30-second profile video (planned)
 * ai-analysis: AI quality analysis (planned)
 * ai-picker: AI recommended photo selection (planned)
 * gallery: multiple photo management (planned)
 */
export const PROFILE_PHOTO_MODULES: ProfilePhotoModule[] = ["photo"];

export function isProfilePhotoModuleEnabled(module: ProfilePhotoModule): boolean {
  return module === "photo";
}
