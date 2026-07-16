// Curated worship/instrument photography (Unsplash, verified stable IDs).
// These are placeholders for real Ghanaian church photography in production —
// swap the IDs here and nothing else changes.
const U = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=75&auto=format&fit=crop`;

const SKILL_PHOTO: Record<string, string> = {
  drummer: "1516280440614-37939bbacd81",
  keyboardist: "1552056776-9b5657118ca4",
  bassist: "1461784121038-f088ca1e7714",
  "lead-guitarist": "1510915361894-db8b60106cb1",
  vocalist: "1493225457124-a3eb161ffa5f",
  "sound-engineer": "1519508234439-4f23643125c1",
  "livestream-operator": "1523961131990-5ea7c61b2107",
  "camera-operator": "1524230572899-a752b3835840",
  "media-designer": "1626785774573-4b799315345d",
};

const FALLBACK = "1511671782779-c97d3d27a1d4"; // live band

export function skillPhoto(slug: string | undefined, w = 800): string {
  return U((slug && SKILL_PHOTO[slug]) || FALLBACK, w);
}

export const heroPhoto = U("1511671782779-c97d3d27a1d4", 1600);
export const worshipPhoto = U("1438232992991-995b7058bbb3", 1200);
export const congregationPhoto = U("1600880292203-757bb62b4baf", 1200);

// Deterministic warm avatar tint from a name — stable per person, no network.
const AVATAR_TINTS = [
  { bg: "#E8C9B8", fg: "#7A3F27" },
  { bg: "#CFE0CB", fg: "#2F5B3F" },
  { bg: "#D8CDE8", fg: "#4A3A6B" },
  { bg: "#F0D9A8", fg: "#7A5A1E" },
  { bg: "#C9DCE8", fg: "#2E5670" },
  { bg: "#F0C9C4", fg: "#8A3A32" },
];

export function avatarTint(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}
