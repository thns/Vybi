import {
  pgTable,
  text,
  uuid,
  boolean,
  integer,
  doublePrecision,
  date,
  timestamp,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Auth.js core tables ─────────────────────────────────────────────────────
// `users` doubles as the app's profile table (subscription_tier, onboarded, …).
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  subscriptionTier: text("subscription_tier").notNull().default("free"), // free | core | premium
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  anonymousMode: boolean("anonymous_mode").notNull().default(false),
  onboarded: boolean("onboarded").notNull().default(false),
  goal: text("goal"), // track | conceive | avoid
  birthYear: integer("birth_year"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// ─── App tables ──────────────────────────────────────────────────────────────
export const cycleLogs = pgTable("cycle_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  periodStartDate: date("period_start_date").notNull(),
  periodEndDate: date("period_end_date"),
  cycleLength: integer("cycle_length"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

export const symptomLogs = pgTable("symptom_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cycleDay: integer("cycle_day"),
  symptoms: jsonb("symptoms").$type<string[]>().notNull().default([]),
  severity: jsonb("severity").$type<Record<string, number>>().notNull().default({}),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

export const biomeScores = pgTable("biome_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  testKitId: text("test_kit_id"),
  testDate: date("test_date"),
  vaginalScore: integer("vaginal_score"),
  gutScore: integer("gut_score"),
  skinScore: integer("skin_score"),
  oralScore: integer("oral_score"),
  lCrispatusPct: doublePrecision("l_crispatus_pct"),
  lInersPct: doublePrecision("l_iners_pct"),
  gardnerellaPct: doublePrecision("gardnerella_pct"),
  phValue: doublePrecision("ph_value"),
  diversityIndex: doublePrecision("diversity_index"),
  cstType: text("cst_type"),
  rawResults: jsonb("raw_results"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  predictedPeriodStart: date("predicted_period_start"),
  predictedOvulation: date("predicted_ovulation"),
  fertileWindowStart: date("fertile_window_start"),
  fertileWindowEnd: date("fertile_window_end"),
  confidencePct: integer("confidence_pct"),
  accuracyPct: integer("accuracy_pct"),
  layersUsed: text("layers_used").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const preventionScores = pgTable("prevention_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bvRiskScore: integer("bv_risk_score"),
  utiRiskScore: integer("uti_risk_score"),
  gutDysbiosisScore: integer("gut_dysbiosis_score"),
  skinImbalanceScore: integer("skin_imbalance_score"),
  pcosIndicatorScore: integer("pcos_indicator_score"),
  overallProtectionScore: integer("overall_protection_score"),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Wearable readings (BBT / resting HR / HRV) — feeds Layer 4 ───────────────
export const wearableReadings = pgTable("wearable_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  bbt: doublePrecision("bbt"), // basal body temperature °C
  restingHr: integer("resting_hr"), // bpm
  hrv: doublePrecision("hrv"), // ms
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Web push subscriptions ──────────────────────────────────────────────────
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Pregnancy mode ──────────────────────────────────────────────────────────
export const pregnancies = pgTable("pregnancies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  dueDate: date("due_date").notNull(),
  lastPeriodDate: date("last_period_date"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});

// ─── Birth control ───────────────────────────────────────────────────────────
export const birthControl = pgTable("birth_control", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // pill | patch | ring | iud_hormonal | iud_copper | implant | injection | condom | none
  method: text("method").notNull(),
  startDate: date("start_date"),
  pillTime: text("pill_time"), // "HH:MM" local reminder time
  active: boolean("active").notNull().default(true),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const birthControlLogs = pgTable("birth_control_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  taken: boolean("taken").notNull().default(true),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});

export const healthMetrics = pgTable("health_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  sleepHours: doublePrecision("sleep_hours"),
  stressLevel: text("stress_level"),
  hydrationLitres: doublePrecision("hydration_litres"),
  exerciseSessions: integer("exercise_sessions"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).notNull().defaultNow(),
});
