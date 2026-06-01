# TDEE & Macro Calculator

> A fully client-side TDEE and macro calculator with adaptive weight projection, diet presets, weight logging, and AI-ready data export.
>
> **Author:** [BlockbusterAndy](https://github.com/BlockbusterAndy) · **Stack:** Vite · React 18 · Tailwind CSS v3 · Recharts · Lucide React

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quick Start](#2-quick-start)
3. [The Science — Formulas Explained](#3-the-science--formulas-explained)
   - [BMR Formulas](#31-bmr-formulas)
   - [Activity Multipliers → TDEE](#32-activity-multipliers--tdee)
   - [Goal Offsets → Target Calories](#33-goal-offsets--target-calories)
   - [Safety Floor](#34-safety-floor)
   - [Macro Calculation](#35-macro-calculation)
   - [Weekly Weight Change](#36-weekly-weight-change)
   - [BMI](#37-bmi)
4. [UI Sections](#4-ui-sections)
   - [Input Panel](#41-input-panel)
   - [Daily Targets](#42-daily-targets)
   - [Macro Breakdown](#43-macro-breakdown)
   - [Meal Split](#44-meal-split)
   - [Key Stats](#45-key-stats)
   - [Weight Log](#46-weight-log)
   - [Adaptive Weight Projection](#47-adaptive-weight-projection)
5. [Macro Split Presets](#5-macro-split-presets)
6. [BMR Formula Selector](#6-bmr-formula-selector)
7. [Data Persistence](#7-data-persistence)
8. [Share & Export](#8-share--export)
   - [Share Link](#81-share-link)
   - [Copy Results as Text](#82-copy-results-as-text)
   - [JSON Export / Import](#83-json-export--import)
   - [AI Context Field](#84-ai-context-field)
9. [Codebase Architecture](#9-codebase-architecture)
10. [Running Locally](#10-running-locally)
11. [Recalibration Guide](#11-recalibration-guide)
12. [Disclaimers](#12-disclaimers)

---

## 1. Overview

This is a **fully client-side** TDEE (Total Daily Energy Expenditure) and macro calculator. It takes your biometric data and lifestyle inputs, then produces:

- Your **Basal Metabolic Rate (BMR)** — calories burned completely at rest
- Your **TDEE** — total maintenance calories accounting for activity
- Your **Target Calories** — adjusted for your chosen goal (cut / maintain / bulk)
- A complete **macro breakdown** (protein, carbs, fat in grams and kcal)
- An **adaptive projection table** that re-calculates targets at every 5 kg milestone as your BMR shifts
- A **weight log** to track real progress over time

All data stays on your device. Nothing is sent to a server.

---

## 2. Quick Start

1. Enter your **age, biological sex, weight, height**
2. Pick your **activity level**
3. Pick your **goal** (e.g. Moderate Cut)
4. Optionally set a **target weight** to unlock the projection table and ETA
5. Results appear instantly in the right column

> **Tip:** Set a target weight — it unlocks the full Adaptive Projection table with calendar dates and the "Days to Goal" stat card.

---

## 3. The Science — Formulas Explained

### 3.1 BMR Formulas

Three formulas are available under **Advanced Settings → BMR Formula**.

#### Mifflin-St Jeor *(default, recommended)*
The most validated formula for the general population (±10% accuracy).

| Sex | Formula |
|-----|---------|
| Male | `BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5` |
| Female | `BMR = 10×weight(kg) + 6.25×height(cm) − 5×age − 161` |

#### Harris-Benedict *(classic)*
The original 1919 formula, revised in 1984. Slightly overestimates for most people.

| Sex | Formula |
|-----|---------|
| Male | `BMR = 88.362 + 13.397×weight + 4.799×height − 5.677×age` |
| Female | `BMR = 447.593 + 9.247×weight + 3.098×height − 4.330×age` |

#### Katch-McArdle *(lean mass based)*
Most accurate **when body fat % is known**. Ignores sex — works on lean mass only.

```
Lean Mass (kg) = weight × (1 − body_fat% / 100)
BMR = 370 + 21.6 × Lean Mass
```

> **Important:** Select Katch-McArdle only if you know your body fat % from a DEXA scan, hydrostatic weighing, or BIA device. An inaccurate BF% will produce a less accurate BMR than Mifflin-St Jeor.

---

### 3.2 Activity Multipliers → TDEE

```
TDEE = BMR × Activity Multiplier
```

| Level | Description | Multiplier |
|-------|-------------|------------|
| Sedentary | Little or no exercise | ×1.2 |
| Lightly Active | 1–3 days/week | ×1.375 |
| Moderately Active | 3–5 days/week | ×1.55 |
| Very Active | 6–7 days/week | ×1.725 |
| Extremely Active | Physical job or 2× training | ×1.9 |

Each activity button shows the **extra calories burned** on top of BMR (`TDEE − BMR`), calculated live from your inputs.

---

### 3.3 Goal Offsets → Target Calories

```
Target Calories = TDEE + Goal Offset
```

| Goal | Offset | Expected Weekly Change |
|------|--------|----------------------|
| Aggressive Cut | −1,000 kcal | ~−0.91 kg/week |
| Moderate Cut | −500 kcal | ~−0.46 kg/week |
| Slow Cut | −250 kcal | ~−0.23 kg/week |
| Maintain | 0 kcal | ~0 kg/week |
| Lean Bulk | +250 kcal | ~+0.23 kg/week |
| Bulk | +500 kcal | ~+0.46 kg/week |
| Aggressive Bulk | +750 kcal | ~+0.68 kg/week |

---

### 3.4 Safety Floor

Target calories are **clamped** to prevent dangerously low intakes:

| Sex | Minimum |
|-----|---------|
| Male | 1,200 kcal/day |
| Female | 1,000 kcal/day |

A warning banner appears when clamping occurs.

---

### 3.5 Macro Calculation

**Standard mode** (protein multiplier controls protein):
```
Protein (g)  = Body Weight (kg) × Protein Multiplier
Protein kcal = Protein (g) × 4
Remaining    = Target Calories − Protein kcal
Carbs (g)    = Remaining × carbsPct / 4
Fat (g)      = Remaining × fatsPct / 9
```

**Diet preset mode** (Low Carb / Keto / High Carb):
```
Protein kcal = Target Calories × preset.proteinPct
Protein (g)  = Protein kcal / 4
Carbs (g)    = Target Calories × preset.carbsPct / 4
Fat (g)      = Target Calories × preset.fatPct / 9
```

Caloric densities: Protein = 4 kcal/g · Carbs = 4 kcal/g · Fat = 9 kcal/g

---

### 3.6 Weekly Weight Change

```
Deficit   = TDEE − Target Calories   (positive = cutting)
Weekly Δ  = −(Deficit × 7) / 7700   (kg/week)
```

`7700 kcal ≈ 1 kg of body fat.` A negative result means weight loss; positive means gain.

**Days to target:**
```
Days = |Target Weight − Current Weight| / |Weekly Change| × 7
```

---

### 3.7 BMI

```
BMI = weight (kg) / height (m)²
```

| Range | Category |
|-------|----------|
| < 18.5 | Underweight |
| 18.5–24.9 | Normal |
| 25–29.9 | Overweight |
| ≥ 30 | Obese |

> **Note:** BMI does not account for muscle mass. A highly muscular person will read "Overweight" at a healthy body composition.

---

## 4. UI Sections

### 4.1 Input Panel

The left-hand column (sticky on desktop). All inputs update results instantly.

| Field | Notes |
|-------|-------|
| **Unit System** | Metric (kg/cm) or Imperial (lbs/ft·in). Persisted across sessions. |
| **Biological Sex** | Affects BMR formula constants and the safety floor. |
| **Age** | Used directly in all three BMR formulas. |
| **Weight** | Current body weight in selected unit. |
| **Height** | Metric: single cm field. Imperial: ft + in fields. |
| **Activity Level** | Shows exact extra kcal/day burned at each level, live. |
| **Goal** | Sets the calorie offset. Displayed with the exact kcal delta and your calorie target. |
| **Target Weight** | Optional. Enables projection table, ETA, and Days to Goal stat. |
| **Protein Multiplier** | g of protein per kg of bodyweight. Disabled when a diet preset is active. |
| **Advanced → BMR Formula** | Mifflin / Harris-Benedict / Katch-McArdle. Body fat % field appears for KMA. |
| **Data Backup & Restore** | Export/Import JSON — at the bottom of the panel. |

---

### 4.2 Daily Targets

Three large stat cards:

| Card | Value |
|------|-------|
| **BMR** | Calories at complete rest |
| **TDEE** | Maintenance calories (BMR × activity) |
| **Target** | Your daily calorie goal (TDEE ± goal offset) with deficit/surplus label |

A warning box appears if clamping occurred or if protein exceeds the calorie target.

---

### 4.3 Macro Breakdown

- **Donut chart** — shows the three macros proportionally. Total kcal displayed in the center ring.
- **Macro preset selector** — toggles between Standard / Low Carb / Keto / High Carb (see [Section 5](#5-macro-split-presets)).
- **Progress bars** — animate when values change.
- Each row shows: grams · kcal · percentage of total.

---

### 4.4 Meal Split

Breaks your daily calories and macros across meals. Choose a timing preset:

| Preset | Meals | Split |
|--------|-------|-------|
| **3 Meals** | Breakfast · Lunch · Dinner | 30% · 35% · 35% |
| **4 Meals** | Breakfast · Lunch · Snack · Dinner | 25% · 30% · 15% · 30% |
| **5 Meals** | Breakfast · Snack · Lunch · Snack · Dinner | 20% · 10% · 30% · 10% · 30% |
| **IF 16:8** | Break Fast · Dinner | 40% · 60% |

Each meal card shows: suggested time · kcal · Protein / Carbs / Fat in grams.

> **Note:** These are suggested splits. Real meal timing doesn't need to be exact — total daily intake is what matters for body composition.

---

### 4.5 Key Stats

Four cards derived from your results:

| Card | Formula |
|------|---------|
| **BMI** | `weight / height²` with category badge |
| **Est. Weekly Change** | `−(deficit × 7) / 7700` in kg or lbs |
| **Protein per kg** | `protein_g / weight_kg` — effective g/kg ratio |
| **Days to Target** | Only shown when target weight is set |

---

### 4.6 Weight Log

A personal check-in tracker stored locally in your browser.

- **Add entry** — type your current weight and press Enter or "Log". One entry per day (today's overwrites any earlier same-day entry).
- **Sparkline chart** — appears after 2 entries. Shows an area chart of the last 8 weigh-ins.
- **Trend badge** — shows total change (e.g. `−2.4 kg over 6 entries`) in green for loss, red for gain.
- **Entry list** — scrollable, reverse-chronological, with delete per row.

> **Tip:** Weigh yourself at the same time each morning (after using the bathroom, before eating) for the most consistent readings.

---

### 4.7 Adaptive Weight Projection

This solves a key problem: **as you lose weight your BMR decreases**, so the same calorie target produces a smaller deficit over time.

**How it works:**
1. Starts at your current weight
2. Generates milestones every **5 kg** down to your target weight
3. At each milestone, **recalculates BMR, TDEE, and the calorie target** from scratch using the milestone weight
4. Computes cumulative weeks and projects a real **calendar date** (e.g. "Aug 14")
5. Shows a **⚠ Recalculate** badge every ~4 weeks to remind you to update your inputs

**Table columns:**

| Column | Meaning |
|--------|---------|
| Weight | Milestone weight (kg or lbs) |
| BMR | Resting calories at that weight |
| Maintenance | TDEE at that weight |
| Target Cal | Your goal calories at that weight |
| Δ From Start | How much lower vs. your starting target |
| Weekly Δ | Expected weekly change at that milestone |
| Est. Date | Projected calendar date to reach that milestone |
| Protein (g) | Recommended protein at that weight |

**Calorie Roadmap chart** — a line chart showing how Target Calories and BMR both decrease as weight drops, with a BMR floor reference line.

---

## 5. Macro Split Presets

| Preset | Protein | Carbs | Fat | Best for |
|--------|---------|-------|-----|----------|
| **Standard** | From multiplier | 55% of remaining | 45% of remaining | General population, gym-goers |
| **Low Carb** | 30% of kcal | 20% of kcal | 50% of kcal | Reducing insulin, appetite control |
| **Keto** | 25% of kcal | 5% of kcal | 70% of kcal | Ketosis, metabolic therapy |
| **High Carb** | 25% of kcal | 60% of kcal | 15% of kcal | Endurance athletes, runners |

> **Warning:** In Standard mode, protein is controlled by the **Protein Multiplier** and does NOT change with the preset. In all other presets, protein is derived from the percentage — the multiplier is locked and a 🔒 notice is shown in the input panel.

---

## 6. BMR Formula Selector

Found under **Advanced Settings** (collapsible) in the input panel.

| Formula | When to use |
|---------|-------------|
| **Mifflin-St Jeor** | Default. Best for most people without body composition data. |
| **Harris-Benedict** | Alternative if you want to compare. Tends to overestimate by ~5%. |
| **Katch-McArdle** | Use when you have a reliable body fat % measurement. Requires body fat % input. |

Switching formulas recalculates everything instantly. The chosen formula is included in the JSON export and share URL.

---

## 7. Data Persistence

All data is stored exclusively in the browser's `localStorage`. Nothing leaves your device.

| Key | Contents |
|-----|----------|
| `tdee_form_state` | All form inputs: weight, height, age, goal, activity, unit, BMR formula, macro preset, meal preset, etc. |
| `tdee_weight_log` | Array of `{ date: "YYYY-MM-DD", weight: kg }` objects |

**When data is loaded (priority order):**
1. URL query parameters (share link) — highest priority
2. `localStorage` (previous session)
3. Hard-coded defaults

A green **"✓ Saved locally"** pill appears briefly in the header whenever any value changes.

> **Caution:** Clearing browser data / site data will erase all saved inputs and weight log entries. Use **Export JSON** regularly as a backup.

---

## 8. Share & Export

### 8.1 Share Link

Click **Share → Copy share link** in the header.

All inputs are URL-encoded as query parameters:

```
?unit=metric&sex=male&age=28&w=80&hcm=175&act=moderately&goal=moderate_cut&pm=1.6&formula=mifflin&mp=standard&meal=3
```

Anyone opening this link will have their form pre-filled with your exact settings.

---

### 8.2 Copy Results as Text

Click **Share → Copy results as text**. Produces a plain-text summary ready to paste into notes or a message:

```
── TDEE & Macro Results ──
BMR:        1,814 kcal
TDEE:       2,812 kcal
Target:     2,312 kcal  (−500 kcal deficit)

Protein:    128.0g  (512 kcal)
Carbs:      248.7g  (994 kcal)
Fat:         89.6g  (806 kcal)

BMI:        26.1 — Overweight
Weekly Δ:   -0.46 kg/week
Goal ETA:   154 days (~22 weeks)
```

---

### 8.3 JSON Export / Import

Found at the **bottom of the input panel** under "Data Backup & Restore".

**Export JSON** downloads `tdee-backup-YYYY-MM-DD.json` containing:

```json
{
  "version": 1,
  "app": "TDEE & Macro Calculator",
  "exportedAt": "2026-06-01T07:53:00.000Z",
  "aiContext": "Ready-to-paste paragraph for any AI chatbot...",
  "calculated": {
    "energyBalance": {
      "BMR_kcal": 1814,
      "TDEE_kcal": 2812,
      "targetCalories_kcal": 2312,
      "deficit_kcal": 500,
      "weeklyWeightChange": "-0.46 kg/week",
      "estimatedDaysToGoal": 154,
      "estimatedWeeksToGoal": 22
    },
    "macros": {
      "protein":  { "grams": 128.0, "kcal": 512, "percentage": "22%" },
      "carbs":    { "grams": 248.7, "kcal": 994, "percentage": "43%" },
      "fat":      { "grams": 89.6,  "kcal": 806, "percentage": "35%" },
      "splitPreset": "Standard"
    },
    "bodyMetrics": { "BMI": 26.1, "BMICategory": "Overweight", "proteinPerKg_g": 1.6 },
    "settings": {
      "goal": "Moderate Cut",
      "activityLevel": "Moderately Active",
      "bmrFormula": "Mifflin-St Jeor",
      "dietType": "Standard",
      "unit": "metric"
    }
  },
  "formState": { "...all raw inputs..." },
  "weightLog": [{ "date": "2026-06-01", "weight": 80.0 }]
}
```

**Import JSON** opens a file picker. The file is validated before anything is written. On success, localStorage is restored and the page reloads.

---

### 8.4 AI Context Field

The `aiContext` field in the JSON is a pre-written natural language summary:

```
I am a 28-year-old male weighing 80 kg, height 175 cm.
My BMR (Mifflin-St Jeor) is 1814 kcal/day and my TDEE (Moderately Active) is 2812 kcal/day.
My goal is Moderate Cut. I am eating 2312 kcal/day,
which is a 500 kcal deficit — expected weight change: -0.46 kg/week.
My target weight is 70 kg. At this rate I should reach my goal in ~154 days (~22 weeks).

Daily macros (Standard split):
  • Protein: 128.0 g  (512 kcal, 22%)
  • Carbs:   248.7 g  (994 kcal, 43%)
  • Fat:      89.6 g  (806 kcal, 35%)

BMI: 26.1 (Overweight). Protein per kg bodyweight: 1.6 g/kg.

Please use this data to provide personalised nutrition and fitness guidance.
```

**How to use it:**
1. Export JSON
2. Open the file in any text editor
3. Copy the `aiContext` value
4. Paste into **ChatGPT**, **Claude**, **Gemini**, or any AI of your choice
5. Ask follow-up questions: meal ideas, exercise plans, plateau strategies, etc.

---

## 9. Codebase Architecture

```
src/
├── utils/
│   └── calculations.js         # All pure math — no React, no side effects
│
├── hooks/
│   └── useCalculator.js        # All state + derived values + localStorage + share URL
│
├── components/
│   ├── InputPanel.jsx           # Left column: all user inputs
│   ├── BMRFormulaToggle.jsx     # Formula selector (inside Advanced Settings)
│   ├── GoalSelector.jsx         # Goal buttons with offset labels
│   ├── UnitToggle.jsx           # Metric / Imperial toggle
│   ├── ProteinMultiplier.jsx    # Protein g/kg selector
│   │
│   ├── ResultsSummary.jsx       # BMR / TDEE / Target cards
│   ├── MacroChart.jsx           # Donut chart + macro rows
│   ├── MacroPresetSelector.jsx  # Standard / Low Carb / Keto / High Carb tabs
│   ├── MealSplit.jsx            # Per-meal calorie/macro breakdown
│   ├── StatCards.jsx            # BMI / Weekly Δ / Protein/kg / Days
│   ├── WeightLog.jsx            # Check-in log + sparkline
│   ├── ProjectionTable.jsx      # Milestone table + calorie roadmap chart
│   │
│   ├── ShareButton.jsx          # Share link + copy-as-text dropdown
│   └── DataPortability.jsx      # Export / Import JSON
│
└── App.jsx                      # Layout orchestration only
```

**Key design decisions:**

- `calculations.js` is **100% pure functions** — testable in isolation with no imports.
- `useCalculator.js` is the **single source of truth**. It owns all state, derives all results with `useMemo`, and persists everything. No component owns app-level state.
- `useRef` (not `useMemo`) is used for the init load to guarantee **exactly one read** from `localStorage` on mount, avoiding React 18 StrictMode double-invoke bugs.
- All charts use **Recharts** — `PieChart` for macros, `LineChart` for projection, `AreaChart` for weight log sparkline.

---

## 10. Running Locally

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Production build
npm run build
```

Dev server runs at `http://localhost:5173` by default.

---

## 11. Recalibration Guide

> **Important:** Your BMR changes as your weight changes. Recalibrate every **4–6 weeks** or whenever the projection table shows a ⚠ Recalculate badge.

**Steps:**
1. Weigh yourself in the morning (consistent conditions)
2. Update the **Weight** field in the input panel
3. Review your new Target Calories — it will be slightly lower (for a cut)
4. Update your meal plan / food tracking app to match the new target
5. Log your weight in the **Weight Log** section to track the trend

**Signs you need to recalibrate sooner:**
- You've lost/gained more than 3–4 kg since last update
- Your weekly weight change is significantly different from the prediction
- You've changed training frequency or job activity level

---

## 12. Disclaimers

- All calculations are **estimates**. Individual metabolism varies by ±15–20%.
- The safety floor (1,000–1,200 kcal) is a bare minimum. Consult a **registered dietitian** before sustaining intake below 1,500 kcal/day.
- BMI has **known limitations** for athletes, elderly individuals, and populations outside the original study groups.
- The Katch-McArdle formula requires an accurate body fat measurement. Consumer-grade BIA scales can be off by 5–8%.
- This app is not a medical device and does not provide medical advice.

---

© 2026 [BlockbusterAndy](https://github.com/BlockbusterAndy). All rights reserved.
