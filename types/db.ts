import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  cycleLogs,
  symptomLogs,
  biomeScores,
  predictions,
  preventionScores,
  healthMetrics,
  pregnancies,
  birthControl,
  birthControlLogs,
} from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type CycleLog = InferSelectModel<typeof cycleLogs>;
export type NewCycleLog = InferInsertModel<typeof cycleLogs>;

export type SymptomLog = InferSelectModel<typeof symptomLogs>;
export type NewSymptomLog = InferInsertModel<typeof symptomLogs>;

export type BiomeScore = InferSelectModel<typeof biomeScores>;
export type NewBiomeScore = InferInsertModel<typeof biomeScores>;

export type Prediction = InferSelectModel<typeof predictions>;
export type NewPrediction = InferInsertModel<typeof predictions>;

export type PreventionScore = InferSelectModel<typeof preventionScores>;
export type NewPreventionScore = InferInsertModel<typeof preventionScores>;

export type HealthMetric = InferSelectModel<typeof healthMetrics>;
export type NewHealthMetric = InferInsertModel<typeof healthMetrics>;

export type Pregnancy = InferSelectModel<typeof pregnancies>;
export type NewPregnancy = InferInsertModel<typeof pregnancies>;

export type BirthControl = InferSelectModel<typeof birthControl>;
export type NewBirthControl = InferInsertModel<typeof birthControl>;

export type BirthControlLog = InferSelectModel<typeof birthControlLogs>;
export type NewBirthControlLog = InferInsertModel<typeof birthControlLogs>;

export type SubscriptionTier = "free" | "core" | "premium";
