// ============================================================================
// VYBI — 5-layer cycle prediction engine
//
// Pure, dependency-free logic so it can be unit-tested in isolation and called
// from any API route. Each layer mirrors the product spec exactly.
//
//   Layer 1  Kalman Filter            — recency-weighted cycle length + variance
//   Layer 2  Symptom Pattern Engine   — symptom clusters → phase signatures (+6%)
//   Layer 3  Biome-Hormonal Inference — vaginal biome → hormonal phase    (+10%)
//   Layer 4  Wearable Fusion          — BBT / HR / HRV                    (+9%)
//   Layer 5  Population adjustment     — placeholder for future ML model
// ============================================================================

export type Phase =
  | "menstrual"
  | "follicular"
  | "ovulation"
  | "luteal"
  | "late_luteal"
  | "unknown";

export interface CycleLogInput {
  periodStartDate: string; // ISO date "YYYY-MM-DD"
  periodEndDate?: string | null;
  cycleLength?: number | null;
}

export interface SymptomLogInput {
  cycleDay?: number | null;
  symptoms: string[];
}

export interface BiomeScoreInput {
  testDate?: string | null;
  lCrispatusPct?: number | null;
  lInersPct?: number | null;
  gardnerellaPct?: number | null;
  phValue?: number | null;
  diversityIndex?: number | null;
  cstType?: string | null;
}

export interface WearableInput {
  bbt?: number[]; // basal body temperature, chronological °C
  restingHr?: number[]; // resting heart rate, chronological bpm
  hrv?: number[]; // heart rate variability, chronological ms
}

export interface PredictionInput {
  cycleLogs: CycleLogInput[];
  symptomLogs?: SymptomLogInput[];
  biomeScores?: BiomeScoreInput[];
  wearable?: WearableInput | null;
}

export interface Layer1Result {
  predictedLength: number;
  variance: number;
  confidencePct: number;
  predictedPeriodStart: string | null;
  samples: number;
}
export interface Layer2Result {
  phaseConfirmation: Phase;
  matches: { symptom: string; phase: Phase; confidence: number }[];
  confidenceBoost: number;
}
export interface Layer3Result {
  phaseInference: Phase;
  hormoneState: string;
  note: string | null;
  confidenceBoost: number;
}
export interface Layer4Result {
  ovulationConfirmed: boolean;
  signals: string[];
  confidenceBoost: number;
}
export interface Layer5Result {
  populationConfidenceAdjustment: number;
  note: string;
}

export interface PredictionResult {
  predicted_period_start: string | null;
  predicted_ovulation: string | null;
  fertile_window_start: string | null;
  fertile_window_end: string | null;
  confidence_pct: number;
  accuracy_pct: number;
  layers_active: string[];
  layers: {
    kalman: Layer1Result;
    symptom: Layer2Result;
    biome: Layer3Result;
    wearable: Layer4Result | null;
    population: Layer5Result;
  };
}

// ─── date helpers ────────────────────────────────────────────────────────────
function parseDate(iso: string): Date {
  // Anchor to UTC midnight to avoid TZ drift in date-only math.
  return new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);
}
function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setUTCDate(d.getUTCDate() + Math.round(days));
  return toISO(d);
}
function daysBetween(aISO: string, bISO: string): number {
  return Math.round(
    (parseDate(bISO).getTime() - parseDate(aISO).getTime()) / 86_400_000,
  );
}
function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ─── Layer 1 — Kalman Filter ─────────────────────────────────────────────────
// predicted_length = Σ(length · recencyWeight) / Σ(recencyWeight)
// variance         = population standard deviation of cycle lengths
// confidence       = 100 − (variance · 8)
export function layer1Kalman(cycleLogs: CycleLogInput[]): Layer1Result {
  const sorted = [...cycleLogs]
    .filter((c) => c.periodStartDate)
    .sort((a, b) => a.periodStartDate.localeCompare(b.periodStartDate));

  // Derive cycle lengths: prefer explicit value, else gap between starts.
  const lengths: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const explicit = sorted[i].cycleLength;
    if (typeof explicit === "number" && explicit > 0) {
      lengths.push(explicit);
    } else if (i > 0) {
      const gap = daysBetween(sorted[i - 1].periodStartDate, sorted[i].periodStartDate);
      if (gap > 0) lengths.push(gap);
    }
  }

  const lastStart = sorted.length ? sorted[sorted.length - 1].periodStartDate : null;

  if (lengths.length === 0) {
    // No history → fall back to the textbook 28-day cycle, low confidence.
    return {
      predictedLength: 28,
      variance: 0,
      confidencePct: 40,
      predictedPeriodStart: lastStart ? addDays(lastStart, 28) : null,
      samples: 0,
    };
  }

  // Recency-weighted mean (oldest weight 1 … newest weight n).
  let weightedSum = 0;
  let weightTotal = 0;
  lengths.forEach((len, i) => {
    const w = i + 1;
    weightedSum += len * w;
    weightTotal += w;
  });
  const predictedLength = weightedSum / weightTotal;

  // Population standard deviation.
  const mean = lengths.reduce((s, l) => s + l, 0) / lengths.length;
  const variance = Math.sqrt(
    lengths.reduce((s, l) => s + (l - mean) ** 2, 0) / lengths.length,
  );

  const confidencePct = clamp(Math.round(100 - variance * 8), 40, 99);

  return {
    predictedLength,
    variance: Number(variance.toFixed(2)),
    confidencePct,
    predictedPeriodStart: lastStart ? addDays(lastStart, predictedLength) : null,
    samples: lengths.length,
  };
}

// ─── Layer 2 — Symptom Pattern Engine ────────────────────────────────────────
// Validated symptom→phase signatures within day windows. +6% when any confirm.
const SYMPTOM_RULES: {
  symptom: string;
  dayMin: number;
  dayMax: number;
  phase: Phase;
  confidence: number;
}[] = [
  { symptom: "cramps", dayMin: 1, dayMax: 3, phase: "menstrual", confidence: 94 },
  { symptom: "bloating", dayMin: 19, dayMax: 23, phase: "luteal", confidence: 87 },
  { symptom: "acne", dayMin: 18, dayMax: 24, phase: "luteal", confidence: 82 },
  { symptom: "discharge", dayMin: 12, dayMax: 15, phase: "ovulation", confidence: 78 },
];

export function layer2Symptoms(symptomLogs: SymptomLogInput[] = []): Layer2Result {
  const matches: Layer2Result["matches"] = [];
  for (const log of symptomLogs) {
    if (log.cycleDay == null) continue;
    for (const sym of log.symptoms || []) {
      const s = sym.toLowerCase();
      for (const rule of SYMPTOM_RULES) {
        if (s.includes(rule.symptom) && log.cycleDay >= rule.dayMin && log.cycleDay <= rule.dayMax) {
          matches.push({ symptom: rule.symptom, phase: rule.phase, confidence: rule.confidence });
        }
      }
    }
  }
  // Highest-confidence match wins the phase confirmation.
  const best = matches.sort((a, b) => b.confidence - a.confidence)[0];
  return {
    phaseConfirmation: best ? best.phase : "unknown",
    matches,
    confidenceBoost: matches.length > 0 ? 6 : 0,
  };
}

// ─── Layer 3 — Biome-Hormonal Inference ──────────────────────────────────────
// Latest biome row (+ trend vs previous). +10% when a biome row exists.
export function layer3Biome(biomeScores: BiomeScoreInput[] = []): Layer3Result {
  const sorted = [...biomeScores].sort((a, b) =>
    (a.testDate ?? "").localeCompare(b.testDate ?? ""),
  );
  const latest = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];

  if (!latest) {
    return {
      phaseInference: "unknown",
      hormoneState: "unknown",
      note: null,
      confidenceBoost: 0,
    };
  }

  const lCris = latest.lCrispatusPct ?? null;
  const lIners = latest.lInersPct ?? null;
  const gard = latest.gardnerellaPct ?? null;
  const ph = latest.phValue ?? null;
  const diversity = latest.diversityIndex ?? null;

  const lInersRising = prev?.lInersPct != null && lIners != null && lIners > prev.lInersPct;
  const lCrisFalling = prev?.lCrispatusPct != null && lCris != null && lCris < prev.lCrispatusPct;

  let phaseInference: Phase = "unknown";
  let hormoneState = "indeterminate";
  let note: string | null = null;

  if (lCris != null && lCris > 70) {
    phaseInference = "follicular";
    hormoneState = "oestrogen-dominant";
  } else if (lInersRising && diversity != null && diversity > 3.5) {
    phaseInference = "late_luteal";
    hormoneState = "progesterone-declining";
    note = "Period likely within 3–5 days";
  } else if (ph != null && ph > 4.5 && gard != null && gard > 15) {
    phaseInference = "menstrual";
    hormoneState = "low-oestrogen / dysbiotic";
  } else if (lCris != null && lCris < 55 && lCrisFalling) {
    phaseInference = "luteal";
    hormoneState = "progesterone-rising";
  }

  return { phaseInference, hormoneState, note, confidenceBoost: 10 };
}

// ─── Layer 4 — Wearable Fusion ───────────────────────────────────────────────
// BBT sustained rise >0.3°C over 3 days → post-ovulation. +9% when connected.
export function layer4Wearable(wearable?: WearableInput | null): Layer4Result | null {
  if (!wearable) return null;

  const signals: string[] = [];
  let ovulationConfirmed = false;

  const bbt = wearable.bbt ?? [];
  if (bbt.length >= 4) {
    // baseline = mean of all but the last 3 readings.
    const baselineWindow = bbt.slice(0, bbt.length - 3);
    const baseline = baselineWindow.reduce((s, t) => s + t, 0) / baselineWindow.length;
    const last3 = bbt.slice(-3);
    if (last3.every((t) => t - baseline > 0.3)) {
      ovulationConfirmed = true;
      signals.push("BBT rise >0.3°C sustained 3 days → post-ovulation confirmed");
    }
  }

  const hr = wearable.restingHr ?? [];
  if (hr.length >= 5) {
    const overall = hr.reduce((s, v) => s + v, 0) / hr.length;
    const firstFive = hr.slice(0, 5).reduce((s, v) => s + v, 0) / 5;
    if (firstFive > overall) signals.push("Resting HR elevated Days 1–5 → menstrual");
  }

  const hrv = wearable.hrv ?? [];
  if (hrv.length >= 4) {
    const minIdx = hrv.indexOf(Math.min(...hrv));
    if (minIdx >= Math.floor(hrv.length / 2)) {
      signals.push("HRV lowest in second half → luteal phase");
    }
  }

  return { ovulationConfirmed, signals, confidenceBoost: 9 };
}

// ─── Layer 5 — Population adjustment (placeholder) ────────────────────────────
export function layer5Population(input: PredictionInput, l1: Layer1Result): Layer5Result {
  // Placeholder for the future federated/ML model. For now a tiny, transparent
  // nudge: a known CST type + regular cycles (low variance) earns a small lift.
  const cst = input.biomeScores?.[input.biomeScores.length - 1]?.cstType ?? null;
  let adj = 0;
  const notes: string[] = [];
  if (cst) {
    adj += 1;
    notes.push(`CST cohort: ${cst}`);
  }
  if (l1.samples >= 3 && l1.variance < 2) {
    adj += 1;
    notes.push("Regular-cycle cohort");
  }
  return {
    populationConfidenceAdjustment: adj,
    note: notes.length ? notes.join("; ") : "Insufficient cohort data (placeholder)",
  };
}

// ─── Orchestration ───────────────────────────────────────────────────────────
export function runPrediction(input: PredictionInput): PredictionResult {
  const kalman = layer1Kalman(input.cycleLogs);
  const symptom = layer2Symptoms(input.symptomLogs);
  const biome = layer3Biome(input.biomeScores);
  const wearable = layer4Wearable(input.wearable);
  const population = layer5Population(input, kalman);

  const layersActive: string[] = ["Kalman Filter"];
  if (symptom.confidenceBoost > 0) layersActive.push("Symptom Pattern Engine");
  if (biome.confidenceBoost > 0) layersActive.push("Biome-Hormonal Inference");
  if (wearable) layersActive.push("Wearable Fusion");
  layersActive.push("Population Learning");

  // confidence_pct = Layer-1 statistical confidence.
  const confidencePct = kalman.confidencePct;

  // accuracy_pct = blended model accuracy after all layer boosts.
  const accuracyPct = clamp(
    Math.round(
      kalman.confidencePct +
        symptom.confidenceBoost +
        biome.confidenceBoost +
        (wearable?.confidenceBoost ?? 0) +
        population.populationConfidenceAdjustment,
    ),
    40,
    99,
  );

  // Dates: ovulation ≈ 14 days before next period; fertile window −5…+1.
  const periodStart = kalman.predictedPeriodStart;
  const ovulation = periodStart ? addDays(periodStart, -14) : null;
  const fertileStart = ovulation ? addDays(ovulation, -5) : null;
  const fertileEnd = ovulation ? addDays(ovulation, 1) : null;

  return {
    predicted_period_start: periodStart,
    predicted_ovulation: ovulation,
    fertile_window_start: fertileStart,
    fertile_window_end: fertileEnd,
    confidence_pct: confidencePct,
    accuracy_pct: accuracyPct,
    layers_active: layersActive,
    layers: { kalman, symptom, biome, wearable, population },
  };
}
