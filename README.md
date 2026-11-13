# FitMind AI — Personalized AI Fitness, Body Composition & Nutrition Platform

FitMind AI is a full-stack, clinical-grade fitness and nutrition platform built to empower individuals to achieve body recomposition, muscular hypertrophy, and optimal metabolic health through deterministic calculations paired with generative AI reasoning.

---

## 🌟 Key Capabilities

1. **Deterministic Body Composition Engine**:
   - **US Navy Circumference Regression**: Precision body fat estimation for men and women without guessing.
   - **Mifflin-St Jeor Equation**: Clinically validated Basal Metabolic Rate (BMR) tracking.
   - **Total Daily Energy Expenditure (TDEE)**: Physical activity multipliers for accurate caloric expenditure.
   - **World Health Organization (WHO) BMI**: Screening index with healthy target ranges.
   - **Lean Body Mass vs. Fat Mass Partitioning**: Dedicated visual comparison of contractile tissue versus storage adipose.

2. **Personalized 7-Day Sports Nutrition Planner**:
   - Generates structured meals (Breakfast, Morning Snack, Lunch, Evening Snack, Dinner, Post-Workout).
   - Strict adherence to food allergies, food intolerances, and disliked ingredients.
   - Deep support for Indian foods (Moong Dal Chilla, Paneer, Soy chunks, Rajma, Curd, Rice, Roti) and global cuisines.
   - Per-meal macro breakdown (Calories, Protein, Carbs, Fat) ensuring exact mathematical consistency with daily caloric targets.
   - **Single-Meal Replacements**: AI-driven regeneration of individual meals without re-generating the entire week.
   - **Automated Grocery List**: Consolidated ingredients categorised with estimated weekly budget.

3. **Intelligent Workout Planner & Periodization**:
   - Split routines: Push/Pull/Legs (PPL), Upper/Lower, Full-Body, Home Bodyweight.
   - Exercise details: Target muscle groups, Sets, Reps, Rest intervals, and Equipment needed.
   - Form cues and execution blueprints.
   - **Contradiction Safeguards**: Automatically screens and excludes movements that aggravate reported injuries.
   - **Single-Exercise Swap**: Instant alternative recommendations.
   - Progressive overload protocols and CNS recovery guidance.

4. **Context-Aware AI Fitness Assistant**:
   - Powered by Gemini 3.8 Flash (`@google/genai`).
   - Grounded in the user's active biometric data (Weight, Body Fat %, Caloric Deficit/Surplus, Macros).
   - Never hallucinates medical diagnoses; explains scientific physiology clearly.

5. **Progress & Longitudinal Tracker**:
   - Interactive SVG charts for weight trajectory and body fat percentage across 7d, 30d, 3m, 6m, and 1y.
   - Check-in logger with automated US Navy body fat calculation upon entering waist and neck measurements.
   - Net delta comparisons and consistency scores.

6. **Desktop Application Packaging**:
   - Clean decoupled architecture with local database persistence (`data/fitmind_db.json`), ready for Windows desktop packaging via Electron or Tauri.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js & Express REST API with Vite middleware integration.
- **Database**: Local persistent JSON database with atomic writes (`server/db.ts`).
- **AI Integration**: Google GenAI SDK (`@google/genai`) using model `gemini-3.8-flash`.
- **Testing**: Deterministic mathematical unit test suite (`test/calculations.test.ts`).

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- Node.js 20+ installed.
- npm or pnpm.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
*(If no API key is set, FitMind AI automatically operates in high-quality deterministic mode with zero downtime or broken states).*

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 5. Run Calculation Engine Test Suite
```bash
npm run test
```

### 6. Production Build
```bash
npm run build
npm start
```

---

## 💻 Packaging for Windows Desktop (Electron / Tauri)

To package FitMind AI into an offline-ready Windows `.exe` desktop application:

### Option A: Tauri (Lightweight, Recommended)
```bash
# Initialize Tauri
npx @tauri-apps/cli init

# Build Windows installer (.msi / .exe)
npx tauri build
```

### Option B: Electron
```bash
npm i -D electron electron-builder
npx electron-builder --win
```

---

## ⚕️ Health & Safety Safeguards

FitMind AI is an educational fitness and nutritional planning platform, not a medical diagnostic device. It enforces conservative caloric deficits (15–20%), prohibits extreme restriction, and requires users with injuries or medical history to seek professional clinical advice.
