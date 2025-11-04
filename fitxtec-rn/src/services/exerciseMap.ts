export type MGKey =
  | "Chest" | "Back" | "Shoulders" | "Quads" | "Hamstrings" | "Biceps" | "Triceps"
  | "Calves";

export function norm(s: string) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIAS_TO_CANON: Record<string, string> = {
  // Chest
  "bench press": "bench press",
  "press banca": "bench press",
  "press de banca": "bench press",
  "press plano": "bench press",
  "press con barra": "bench press",
  "incline bench press": "incline bench press",
  "press inclinado": "incline bench press",
  "push up": "push up",
  "lagartijas": "push up",
  "flexiones": "push up",
  // Back
  "barbell row": "barbell row",
  "remo con barra": "barbell row",
  "remo barra": "barbell row",
  "lat pulldown": "lat pulldown",
  "jalon al pecho": "lat pulldown",
  "jalon polea": "lat pulldown",
  // Shoulders
  "overhead press": "overhead press",
  "press militar": "overhead press",
  "shoulder press": "overhead press",
  "lateral raise": "lateral raise",
  "elevaciones laterales": "lateral raise",
  // Quads
  "squat": "squat",
  "sentadilla": "squat",
  "sentadillas": "squat",
  "front squat": "front squat",
  "sentadilla frontal": "front squat",
  "leg press": "leg press",
  "prensa": "leg press",
  // Hamstrings
  "romanian deadlift": "romanian deadlift",
  "peso muerto rumano": "romanian deadlift",
  "pm rumano": "romanian deadlift",
  "leg curl": "leg curl",
  "curl femoral": "leg curl",
  // Biceps
  "barbell curl": "barbell curl",
  "curl con barra": "barbell curl",
  "dumbbell curl": "dumbbell curl",
  "curl con mancuernas": "dumbbell curl",
  // Triceps
  "skull crushers": "skull crushers",
  "press frances": "skull crushers",
  "triceps extension": "triceps extension",
  "extension de triceps": "triceps extension",
  "extension por encima de la cabeza": "triceps extension",
  // Calves
  "calf raise": "calf raise",
  "elevaciones de talon": "calf raise",
  "elevaciones de gemelos": "calf raise",
  "elevacion de pantorrillas": "calf raise",
};

const CANON_TO_MG: Record<string, MGKey> = {
  "bench press": "Chest",
  "incline bench press": "Chest",
  "push up": "Chest",
  "barbell row": "Back",
  "lat pulldown": "Back",
  "overhead press": "Shoulders",
  "lateral raise": "Shoulders",
  "squat": "Quads",
  "front squat": "Quads",
  "leg press": "Quads",
  "romanian deadlift": "Hamstrings",
  "leg curl": "Hamstrings",
  "barbell curl": "Biceps",
  "dumbbell curl": "Biceps",
  "skull crushers": "Triceps",
  "triceps extension": "Triceps",
  "calf raise": "Calves",
};

export function canonicalName(raw: string) {
  const key = norm(raw);
  return ALIAS_TO_CANON[key] ?? key;
}
export function muscleGroupFor(raw: string): MGKey | undefined {
  const canon = canonicalName(raw);
  return CANON_TO_MG[canon];
}
