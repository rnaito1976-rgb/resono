import type { ProfileGrowFieldKey, ProfileGrowSection } from "@/types/profile-grow";

export const PROFILE_GROW_FIELD_LABELS: Record<ProfileGrowFieldKey, string> = {
  aboutMe: "About Me",
  bio: "Bio",
  values: "Values",
  favoriteArtists: "Favorite Artists",
  favoriteSongs: "Favorite Songs",
  favoriteBands: "Favorite Bands",
  genres: "Genres",
  wantToCover: "Want to Cover",
  wantToPlay: "Want to Play",
  favoriteLiveHouses: "Favorite Live Houses",
  favoriteStudios: "Favorite Studios",
  favoriteFestivals: "Favorite Festivals",
  gear: "Gear",
  videos: "Videos",
  lookingFor: "Looking For",
  style: "Style",
  schedule: "Schedule",
  setList: "Set List",
  liveHistory: "Live History",
};

export const PROFILE_GROW_SECTION_LABELS: Record<ProfileGrowSection, string> = {
  about: "About",
  music: "Music",
  band: "Band",
};

export function getProfileGrowFieldSection(field: ProfileGrowFieldKey): ProfileGrowSection {
  if (field === "aboutMe" || field === "bio" || field === "values") {
    return "about";
  }

  if (
    field === "lookingFor" ||
    field === "style" ||
    field === "schedule" ||
    field === "setList" ||
    field === "liveHistory"
  ) {
    return "band";
  }

  return "music";
}
