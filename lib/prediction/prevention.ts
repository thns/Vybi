// ============================================================================
// VYBI — preventive risk scoring
// Derives the 5 condition-risk scores + an overall protection score from the
// latest biome row, cycle regularity, and recent habits. Scores are 0–100
// (higher risk = worse), except overall_protection_score (higher = better).
// ============================================================================

export interface PreventionInput {
  biome?: {
    lCrispatusPct?: number | null;
    lInersPct?: number | null;
    gardnerellaPct?: number | null;
    phValue?: number | null;
    diversityIndex?: number | null;
    gutScore?: number | null;
    skinScore?: number | null;
  } | null;
  cycleVariance?: number; // stddev of cycle lengths (from Layer 1)
  cycleSamples?: number;
  hydrationLitres?: number | null;
}

export interface PreventionScores {
  bv_risk_score: number;
  uti_risk_score: number;
  gut_dysbiosis_score: number;
  skin_imbalance_score: number;
  pcos_indicator_score: number;
  overall_protection_score: number;
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

export function computePreventionScores(input: PreventionInput): PreventionScores {
  const b = input.biome ?? {};
  const ph = b.phValue ?? 4.2;
  const gard = b.gardnerellaPct ?? 0;
  const crispatus = b.lCrispatusPct ?? 70;
  const diversity = b.diversityIndex ?? 2.0;
  const hydration = input.hydrationLitres ?? 2.0;
  const variance = input.cycleVariance ?? 0;

  // Bacterial vaginosis — pH, Gardnerella, low Lactobacillus, high diversity.
  let bv = 10;
  if (ph > 4.5) bv += 30;
  else if (ph > 4.2) bv += 12;
  bv += Math.min(gard * 1.2, 30);
  if (crispatus < 55) bv += 20;
  if (diversity > 3.5) bv += 15;

  // UTI — protective Lactobacillus + hydration.
  let uti = 12;
  if (crispatus < 55) uti += 25;
  else if (crispatus < 70) uti += 10;
  if (hydration < 1.5) uti += 15;

  // Gut dysbiosis — driven by gut biome score + diversity.
  const gut = clamp(100 - (b.gutScore ?? 75) + (diversity < 1.5 ? 12 : 0));

  // Skin imbalance — driven by skin biome score.
  const skin = clamp(100 - (b.skinScore ?? 70));

  // PCOS indicators — cycle irregularity is the main signal here.
  let pcos = 8;
  pcos += variance * 5;
  if (input.cycleSamples != null && input.cycleSamples < 2) pcos += 6; // low confidence
  if (crispatus < 50) pcos += 8;

  const bvC = clamp(bv);
  const utiC = clamp(uti);
  const pcosC = clamp(pcos);

  const overall = clamp(100 - (bvC + utiC + gut + skin + pcosC) / 5);

  return {
    bv_risk_score: bvC,
    uti_risk_score: utiC,
    gut_dysbiosis_score: gut,
    skin_imbalance_score: skin,
    pcos_indicator_score: pcosC,
    overall_protection_score: overall,
  };
}
