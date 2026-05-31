import { createHash } from "crypto";

export const ROOMS = [
  { id: "cycle", label: "Cycle talk", icon: "🌙" },
  { id: "ttc", label: "Trying to conceive", icon: "🤍" },
  { id: "biome", label: "Biome & BV", icon: "◈" },
  { id: "pcos", label: "PCOS", icon: "◇" },
  { id: "mental", label: "Mood & mind", icon: "🧠" },
  { id: "pregnancy", label: "Pregnancy", icon: "🤰" },
];

export const ROOM_IDS = ROOMS.map((r) => r.id);

const ADJ = ["Lavender", "Velvet", "Golden", "Crimson", "Jade", "Coral", "Amber", "Indigo", "Rosy", "Silver", "Misty", "Lunar", "Hazel", "Ivory", "Scarlet", "Teal"];
const NOUN = ["Fox", "Wren", "Lily", "Heron", "Otter", "Sage", "Finch", "Willow", "Lynx", "Robin", "Fern", "Dove", "Moth", "Iris", "Hare", "Swan"];

// Deterministic, stable, anonymous handle per user (no real identity exposed).
export function anonName(userId: string): string {
  const h = createHash("sha256").update(userId).digest();
  return `${ADJ[h[0] % ADJ.length]} ${NOUN[h[1] % NOUN.length]}`;
}

const BLOCK = ["fuck", "shit", "bitch", "cunt", "slut", "whore", "retard", "nigger", "faggot"];

// Light profanity mask + length clamp. Real moderation is a follow-up.
export function cleanBody(input: string): string {
  let s = (input || "").trim().slice(0, 2000);
  for (const w of BLOCK) {
    s = s.replace(new RegExp(`\\b${w}\\w*\\b`, "gi"), (m) => m[0] + "•".repeat(Math.max(1, m.length - 1)));
  }
  return s;
}

export const HIDE_THRESHOLD = 3; // auto-hide after N reports
