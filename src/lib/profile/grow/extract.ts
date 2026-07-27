import type { ProfileGrowCandidate } from "@/types/profile-grow";
import type { Member } from "@/types/member";

function normalizeToken(value: string): string {
  return value.trim().toLowerCase();
}

export function dedupeProfileGrowCandidates(
  candidates: ProfileGrowCandidate[],
  member: Member
): ProfileGrowCandidate[] {
  const seen = new Set<string>();
  const result: ProfileGrowCandidate[] = [];

  for (const candidate of candidates) {
    if (isDuplicateCandidate(candidate, member)) {
      continue;
    }

    const key = `${candidate.field}:${normalizeToken(candidate.value)}:${normalizeToken(candidate.detail ?? "")}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(candidate);
  }

  return result;
}

function isDuplicateCandidate(candidate: ProfileGrowCandidate, member: Member): boolean {
  const valueKey = normalizeToken(candidate.value);
  const detailKey = normalizeToken(candidate.detail ?? "");

  switch (candidate.field) {
    case "aboutMe":
    case "bio":
      return normalizeToken(member.portrait.bio).includes(valueKey);
    case "values":
      return member.portrait.influences.some((item) => normalizeToken(item).includes(valueKey));
    case "favoriteArtists":
      return member.music.favoriteArtists.some((item) => normalizeToken(item) === valueKey);
    case "favoriteSongs":
      return (member.music.favoriteSongs ?? []).some((item) => normalizeToken(item) === valueKey);
    case "favoriteBands":
      return (member.music.dreamBands ?? []).some((item) => normalizeToken(item) === valueKey);
    case "genres":
      return member.music.genres.some((item) => normalizeToken(item) === valueKey);
    case "wantToCover":
      return (member.music.coverSongs ?? []).some(
        (song) =>
          normalizeToken(song.title) === valueKey ||
          normalizeToken(`${song.artist} ${song.title}`) === `${detailKey} ${valueKey}`.trim()
      );
    case "wantToPlay":
      return member.music.instruments.some((item) => normalizeToken(item) === valueKey);
    case "favoriteLiveHouses":
      return (member.music.favoriteLiveHouses ?? []).some((item) => normalizeToken(item) === valueKey);
    case "favoriteStudios":
      return (member.music.favoriteStudios ?? []).some((item) => normalizeToken(item) === valueKey);
    case "favoriteFestivals":
      return (member.music.favoriteFestivals ?? []).some((item) => normalizeToken(item) === valueKey);
    case "gear":
      return (member.music.gear ?? []).some((item) => normalizeToken(item) === valueKey);
    case "videos":
      return (member.music.videos ?? []).some((item) => normalizeToken(item) === valueKey);
    case "lookingFor":
      return member.lookingFor.parts.some((item) => normalizeToken(item) === valueKey);
    case "style":
      return normalizeToken(member.lookingFor.bandVision).includes(valueKey);
    case "schedule":
      return normalizeToken(member.lookingFor.commitment).includes(valueKey);
    case "setList":
      return (member.lookingFor.setList ?? []).some((item) => normalizeToken(item) === valueKey);
    case "liveHistory":
      return (member.lookingFor.liveHistory ?? []).some((item) => normalizeToken(item) === valueKey);
  }
}

export function groupCandidatesBySection(candidates: ProfileGrowCandidate[]) {
  return candidates.reduce<Record<"about" | "music" | "band", ProfileGrowCandidate[]>>(
    (groups, candidate) => {
      groups[candidate.section].push(candidate);
      return groups;
    },
    { about: [], music: [], band: [] }
  );
}
