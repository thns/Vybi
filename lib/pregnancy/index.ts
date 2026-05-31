// ============================================================================
// VYBI — pregnancy mode logic
// Standard obstetric dating: 40 weeks (280 days) from the last menstrual period
// (LMP). due date = LMP + 280d. Gestational age is measured from LMP.
// ============================================================================

export interface PregnancyStatus {
  week: number; // completed gestational weeks (0–40+)
  dayOfWeek: number; // 0–6 within the current week
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  dueDate: string;
  progressPct: number; // 0–100
  babySize: string;
  babyLengthCm: number | null;
  weeklyNote: string;
  overdue: boolean;
}

const DAY = 86_400_000;

function parse(iso: string): Date {
  return new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);
}
function todayUTC(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function dueDateFromLMP(lmpISO: string): string {
  const d = parse(lmpISO);
  d.setUTCDate(d.getUTCDate() + 280);
  return d.toISOString().slice(0, 10);
}

// week → { fruit/veg comparison, approx length cm, a short note }
const BABY: Record<number, { size: string; cm: number | null; note: string }> = {
  4: { size: "Poppy seed", cm: 0.1, note: "The neural tube — baby's brain and spine — is forming." },
  5: { size: "Sesame seed", cm: 0.3, note: "The heart begins to form and may start to beat." },
  6: { size: "Lentil", cm: 0.5, note: "Tiny buds that become arms and legs appear." },
  7: { size: "Blueberry", cm: 1, note: "The face is taking shape; brain cells multiply fast." },
  8: { size: "Raspberry", cm: 1.6, note: "Fingers and toes are forming; baby is now a fetus." },
  9: { size: "Cherry", cm: 2.3, note: "Essential organs are in place and growing." },
  10: { size: "Strawberry", cm: 3.1, note: "Vital organs are functioning; nails start to form." },
  11: { size: "Lime", cm: 4.1, note: "Baby can open and close fists; bones harden." },
  12: { size: "Plum", cm: 5.4, note: "Reflexes develop; end of the first trimester soon." },
  13: { size: "Lemon", cm: 7.4, note: "Vocal cords form; fingerprints are developing." },
  14: { size: "Peach", cm: 8.7, note: "Second trimester — baby can make facial expressions." },
  15: { size: "Apple", cm: 10, note: "Baby is forming taste buds and sensing light." },
  16: { size: "Avocado", cm: 11.6, note: "You may soon feel the first flutters of movement." },
  17: { size: "Pear", cm: 13, note: "The skeleton shifts from cartilage to bone." },
  18: { size: "Bell pepper", cm: 14.2, note: "Baby's ears are in position; hearing develops." },
  19: { size: "Mango", cm: 15.3, note: "A protective coating (vernix) covers the skin." },
  20: { size: "Banana", cm: 16.4, note: "Halfway there! Anatomy scan is usually around now." },
  21: { size: "Carrot", cm: 26.7, note: "Movements grow stronger and more coordinated." },
  22: { size: "Spaghetti squash", cm: 27.8, note: "Eyebrows and eyelids are fully formed." },
  23: { size: "Large mango", cm: 28.9, note: "Baby can hear your voice and may respond." },
  24: { size: "Corn cob", cm: 30, note: "Lungs develop branches; viability milestone." },
  25: { size: "Rutabaga", cm: 34.6, note: "Baby is gaining fat and looks more like a newborn." },
  26: { size: "Scallion", cm: 35.6, note: "Eyes begin to open; lungs keep maturing." },
  27: { size: "Cauliflower", cm: 36.6, note: "End of the second trimester — sleep cycles form." },
  28: { size: "Eggplant", cm: 37.6, note: "Third trimester begins; baby can blink." },
  29: { size: "Butternut squash", cm: 38.6, note: "Muscles and lungs continue maturing." },
  30: { size: "Cabbage", cm: 39.9, note: "Baby's brain grows rapidly; eyesight develops." },
  31: { size: "Coconut", cm: 41.1, note: "Baby can turn the head from side to side." },
  32: { size: "Squash", cm: 42.4, note: "Toenails and fingernails are present." },
  33: { size: "Pineapple", cm: 43.7, note: "Bones harden, though the skull stays soft." },
  34: { size: "Cantaloupe", cm: 45, note: "Lungs are nearly mature; practising breathing." },
  35: { size: "Honeydew melon", cm: 46.2, note: "Most growth now is weight gain." },
  36: { size: "Romaine lettuce", cm: 47.4, note: "Baby is likely settling head-down." },
  37: { size: "Swiss chard", cm: 48.6, note: "Considered early term; organs are ready." },
  38: { size: "Leek", cm: 49.8, note: "Baby has a firm grasp and is shedding vernix." },
  39: { size: "Watermelon", cm: 50.7, note: "Full term — baby is ready to meet you." },
  40: { size: "Small pumpkin", cm: 51.2, note: "Due date! Babies arrive on their own schedule." },
};

function babyFor(week: number) {
  if (week < 4) return { size: "Poppy seed", cm: null as number | null, note: "Very early — the embryo is implanting and growing." };
  const w = Math.min(Math.max(week, 4), 40);
  return BABY[w] ?? BABY[40];
}

export function pregnancyStatus(dueDateISO: string, now: Date = new Date()): PregnancyStatus {
  const due = parse(dueDateISO).getTime();
  const today = todayUTC(now);
  const daysRemaining = Math.round((due - today) / DAY);
  const daysElapsed = 280 - daysRemaining;
  const week = Math.max(0, Math.floor(daysElapsed / 7));
  const dayOfWeek = ((daysElapsed % 7) + 7) % 7;
  const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
  const progressPct = Math.max(0, Math.min(100, Math.round((daysElapsed / 280) * 100)));
  const baby = babyFor(week);

  return {
    week,
    dayOfWeek,
    trimester,
    daysRemaining,
    dueDate: dueDateISO.slice(0, 10),
    progressPct,
    babySize: baby.size,
    babyLengthCm: baby.cm,
    weeklyNote: baby.note,
    overdue: daysRemaining < 0,
  };
}
