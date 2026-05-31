// Curated content library — articles + daily insights. Static, editorial.
import { C } from "./vybi-data.js";

export const ARTICLES = [
  {
    id: "biome-hormones", category: "Biome", icon: "◈", color: C.vaginal, readMins: 4,
    title: "Your vaginal biome is a hormone diary",
    excerpt: "Lactobacillus species rise and fall with your oestrogen — which is why Vybi can read your cycle from your microbiome.",
    body: [
      "Your vaginal microbiome isn't static. The dominant bacteria — especially Lactobacillus crispatus — shift in step with your hormones across the cycle.",
      "When oestrogen rises in the follicular phase, it thickens the vaginal lining and loads it with glycogen. Lactobacillus feed on that glycogen, producing lactic acid that keeps pH low (protective, around 3.8–4.5).",
      "As progesterone takes over in the luteal phase, glycogen drops, Lactobacillus decline, and diversity creeps up. This is the biological signal Vybi's Layer 3 reads — often 3–5 days before symptoms appear.",
      "Practical takeaway: a sudden drop in L. crispatus or a pH above 4.5 is worth noting. It can precede BV and signals the late-luteal transition.",
    ],
  },
  {
    id: "follicular-energy", category: "Cycle", icon: "🌱", color: C.lavender, readMins: 3,
    title: "Why you feel unstoppable in your follicular phase",
    excerpt: "Rising oestrogen lifts mood, energy and focus. Here's how to ride the wave.",
    body: [
      "The follicular phase (roughly day 6 to ovulation) is when oestrogen climbs. Many people report sharper focus, higher energy, better sleep and a more social mood.",
      "It's a great window for challenging workouts, big projects and new starts — your body recovers faster and your pain tolerance is higher.",
      "Nutrition tip: support rising oestrogen with fibre and fermented foods, which also feed a healthy gut and vaginal biome.",
    ],
  },
  {
    id: "luteal-selfcare", category: "Cycle", icon: "🌙", color: C.amethyst, readMins: 3,
    title: "The luteal phase: lower the bar, kindly",
    excerpt: "Progesterone peaks then falls. Energy dips, cravings rise — and that's normal.",
    body: [
      "After ovulation, progesterone rises to prepare the uterus. It can bring warmth, calm, but also fatigue, bloating, and in the late luteal phase, PMS as both hormones drop.",
      "This is the time to protect sleep, eat steady meals to manage cravings, and choose gentler movement like walking or yoga.",
      "If low mood or anxiety is severe and cyclical, talk to a clinician about PMDD — it's real and treatable.",
    ],
  },
  {
    id: "fertile-window", category: "Fertility", icon: "✨", color: C.gold, readMins: 4,
    title: "Spotting your fertile window",
    excerpt: "Cervical mucus, BBT and biome signals together beat the calendar alone.",
    body: [
      "The fertile window is the ~6 days ending on ovulation. Sperm can survive up to 5 days, so the days before ovulation matter most for conception.",
      "Egg-white, stretchy cervical mucus is one of the best free signs that ovulation is near. Basal body temperature (BBT) rises ~0.3°C *after* ovulation — confirming it, not predicting it.",
      "Vybi combines these: cervical-mucus and symptom logs (Layer 2), biome shifts (Layer 3) and BBT (Layer 4) to narrow the window — especially useful for irregular cycles.",
    ],
  },
  {
    id: "bv-prevention", category: "Prevention", icon: "△", color: C.amber, readMins: 4,
    title: "Preventing bacterial vaginosis",
    excerpt: "Small habits keep Lactobacillus in charge and Gardnerella out.",
    body: [
      "BV happens when protective Lactobacillus decline and anaerobes like Gardnerella overgrow, raising pH and often causing a fishy odour or grey discharge.",
      "Protective habits: avoid douching and scented products, choose breathable cotton underwear, and consider an L. crispatus probiotic — especially post-period when pH naturally rises.",
      "Reduce added sugar (it can feed dysbiosis) and urinate after sex. If symptoms recur, see a clinician — recurrent BV sometimes needs targeted treatment.",
    ],
  },
  {
    id: "gut-vagina-axis", category: "Biome", icon: "◉", color: C.gut, readMins: 3,
    title: "The gut–vagina axis",
    excerpt: "A healthy gut helps a healthy vaginal biome — they're connected.",
    body: [
      "The gut is a reservoir for many of the bacteria that colonise the vagina. A diverse, fibre-fed gut microbiome supports a Lactobacillus-dominant vaginal one.",
      "Aim for 30 different plant foods a week, include fermented foods (yoghurt, kefir, kimchi), and keep fibre up to feed beneficial microbes.",
      "Antibiotics disrupt both — if you need them, supporting your microbiome afterwards with probiotics and fibre can help recovery.",
    ],
  },
  {
    id: "iron-period", category: "Nutrition", icon: "🍽", color: C.rose, readMins: 3,
    title: "Eating for your period",
    excerpt: "Menstruation depletes iron — replenish it smartly.",
    body: [
      "Each period sheds blood and iron. Heavy periods especially can lead to low iron and fatigue.",
      "Pair iron-rich foods (red meat, lentils, spinach, tofu) with vitamin C (citrus, peppers) to boost absorption. Magnesium-rich foods (dark chocolate, nuts) can ease cramps.",
      "If you're frequently exhausted, pale or breathless, ask your clinician to check ferritin — low iron is common and very treatable.",
    ],
  },
  {
    id: "stress-cycle", category: "Mental Health", icon: "🧠", color: C.aqua, readMins: 3,
    title: "How stress reshapes your cycle",
    excerpt: "Cortisol can delay ovulation and even skip periods.",
    body: [
      "Chronic stress raises cortisol, which can suppress the hormonal signals that trigger ovulation — delaying or skipping it, and lengthening your cycle.",
      "Stress also lowers protective Lactobacillus, nudging the vaginal biome toward imbalance.",
      "Evidence-based resets: regular sleep, breathwork, time outdoors, and movement. Even a few minutes of slow breathing measurably lowers cortisol.",
    ],
  },
  {
    id: "pcos-basics", category: "Prevention", icon: "◇", color: C.bubblegum, readMins: 4,
    title: "PCOS, in plain language",
    excerpt: "Irregular cycles, androgens and insulin — what to watch for.",
    body: [
      "Polycystic ovary syndrome is common and varied. Hallmarks include irregular or absent periods, signs of higher androgens (acne, excess hair), and often insulin resistance.",
      "Tracking cycle regularity over time (Vybi's variance metric) can surface patterns worth discussing with a clinician.",
      "Management often combines nutrition, movement, sleep and — where needed — medication. Early support improves long-term metabolic and fertility outcomes.",
    ],
  },
  {
    id: "anon-privacy", category: "Privacy", icon: "🔒", color: C.mint, readMins: 2,
    title: "Why anonymous mode matters",
    excerpt: "Your reproductive data is sensitive. Here's how Vybi protects it.",
    body: [
      "Cycle and biome data are among your most personal health information. Vybi's anonymous mode lets you use the app without linking an identity.",
      "Your data is yours: you can export everything as JSON and generate a doctor report any time from Settings.",
      "We design for data minimisation — store what's needed to help you, and make it portable and deletable.",
    ],
  },
];

// Short rotating insights for the Home screen.
export const DAILY_TIPS = [
  "L. crispatus rises with oestrogen — a falling level can flag the late-luteal shift before symptoms.",
  "Egg-white cervical mucus is one of the best free signs ovulation is near.",
  "Pair iron-rich foods with vitamin C to absorb more during your period.",
  "BBT rises ~0.3°C after ovulation — it confirms rather than predicts.",
  "Avoid douching: it strips protective Lactobacillus and raises BV risk.",
  "30 plant foods a week feeds a diverse gut — and a healthier vaginal biome.",
  "Slow breathing for 5 minutes measurably lowers cortisol, which protects ovulation.",
  "Post-period is when vaginal pH naturally rises — a good time for an L. crispatus probiotic.",
  "Cycle-length variability under ~2 days is considered very regular.",
  "Fermented foods support both gut and vaginal microbiomes.",
];

export function getDailyTip() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
  const dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}
