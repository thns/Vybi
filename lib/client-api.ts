// Client-side fetch helpers for the Vybi API. All return parsed JSON; on a 401
// (guest/anonymous) or network error they resolve to null so screens can fall
// back to their default presentation instead of throwing.

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function post<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface PredictionRow {
  predictedPeriodStart: string | null;
  predictedOvulation: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  confidencePct: number | null;
  accuracyPct: number | null;
  layersUsed: string[];
  createdAt: string;
}

async function del<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface PregnancyStatus {
  week: number;
  dayOfWeek: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  dueDate: string;
  progressPct: number;
  babySize: string;
  babyLengthCm: number | null;
  weeklyNote: string;
  overdue: boolean;
}

export interface BirthControlConfig {
  method: string;
  startDate: string | null;
  pillTime: string | null;
  notes: string | null;
}

export interface BirthControlLog {
  date: string;
  taken: boolean;
}

export interface CycleRow {
  id: string;
  periodStartDate: string;
  periodEndDate: string | null;
  cycleLength: number | null;
  loggedAt: string;
}

export interface BiomeRow {
  vaginalScore: number | null;
  gutScore: number | null;
  skinScore: number | null;
  oralScore: number | null;
  lCrispatusPct: number | null;
  lInersPct: number | null;
  gardnerellaPct: number | null;
  phValue: number | null;
  diversityIndex: number | null;
  cstType: string | null;
  testDate: string | null;
}

export interface PreventionScores {
  bv_risk_score: number;
  uti_risk_score: number;
  gut_dysbiosis_score: number;
  skin_imbalance_score: number;
  pcos_indicator_score: number;
  overall_protection_score: number;
}

export const api = {
  latestPrediction: () =>
    get<{ prediction: PredictionRow | null }>("/api/predictions/latest"),
  calculatePrediction: () => post<unknown>("/api/predictions/calculate", {}),
  latestBiome: () => get<{ biome: BiomeRow | null }>("/api/biome/latest"),
  preventionScores: () => get<PreventionScores>("/api/prevention/scores"),
  cycles: () => get<{ cycles: CycleRow[] }>("/api/cycles/log"),
  logCycle: (b: { period_start_date: string; period_end_date?: string; cycle_length?: number }) =>
    post<{ log: CycleRow; prediction: unknown }>("/api/cycles/log", b),
  onboard: (b: { last_period_date?: string; cycle_length?: number }) =>
    post<{ ok: boolean }>("/api/onboarding", b),
  pregnancy: () =>
    get<{ pregnancy: unknown; status: PregnancyStatus | null }>("/api/pregnancy"),
  startPregnancy: (b: { due_date?: string; last_period_date?: string }) =>
    post<{ status: PregnancyStatus }>("/api/pregnancy", b),
  endPregnancy: () => del<{ ok: boolean }>("/api/pregnancy"),
  birthControl: () =>
    get<{ config: BirthControlConfig | null; logs: BirthControlLog[] }>("/api/birth-control"),
  setBirthControl: (b: { method: string; start_date?: string; pill_time?: string; notes?: string }) =>
    post<{ config: BirthControlConfig }>("/api/birth-control", b),
  logPill: (b: { date?: string; taken?: boolean }) =>
    post<{ log: BirthControlLog }>("/api/birth-control/log", b),
  logSymptom: (b: { cycle_day?: number; symptoms: string[]; severity?: Record<string, number> }) =>
    post<{ prediction: unknown }>("/api/symptoms/log", b),
  healthSummary: () => get<{ summary: unknown[] }>("/api/health/summary"),
  subscriptionStatus: () =>
    get<{ tier: string; status: string | null; cancel_at_period_end: boolean }>(
      "/api/stripe/subscription-status",
    ),
  checkout: (tier: "core" | "premium") =>
    post<{ url?: string; error?: string }>("/api/stripe/create-checkout-session", { tier }),
};

// Chat needs the error body (e.g. 503 "key pending"), so it doesn't use the
// null-on-error helper.
export async function sendChat(
  messages: { role: string; text: string }[],
): Promise<{ reply?: string; error?: string }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error ?? "Chat is unavailable right now." };
    return { reply: data.reply };
  } catch {
    return { error: "Network error — please try again." };
  }
}

// ─── date helpers for the UI ─────────────────────────────────────────────────
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00.000Z`).getTime();
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((target - todayUtc) / 86_400_000);
}

// Current cycle day from the most recent period start (day 1 = start day).
export function cycleDayFrom(startISO: string | null): number | null {
  if (!startISO) return null;
  const d = daysUntil(startISO);
  if (d == null) return null;
  return 1 - d; // start in the past → positive day number
}

// Map a cycle day to a phase key (matches the screens' phase palette).
export function phaseForDay(day: number | null, cycleLength = 28): string {
  if (day == null || day < 1) return "follicular";
  const ovulation = cycleLength - 14;
  if (day <= 5) return "menstrual";
  if (day < ovulation) return "follicular";
  if (day <= ovulation + 2) return "ovulation";
  return "luteal";
}

export function formatShort(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00.000Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}
