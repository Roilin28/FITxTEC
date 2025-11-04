// src/services/stats.ts
import {
  collection, query, where, getDocs, Timestamp, setDoc, doc,
} from "firebase/firestore";
import { db } from "./firebase";

/* -------------------- Tipos -------------------- */
export type MGKey =
  | "Chest" | "Back" | "Shoulders" | "Quads" | "Hamstrings"
  | "Biceps" | "Triceps" | "Calves";

export type MuscleStats = {
  volumeWeekCurrent: number;     // suma peso*reps semana actual
  volumeWeekPrev: number;        // semana previa
  volumeHistory: number[];       // 5 semanas [W-4..W0]
  ropPct: number;                // % cambio vs semana previa (rate of progress)
};

export type UserStats = {
  userId: string;
  computedAt: number;            // Date.now()
  totals: {
    volumeWeekCurrent: number;
    volumeWeekPrev: number;
    sessionsLast30d: number;
  };
  muscles: Record<MGKey, MuscleStats>;
  decreased: MGKey[];            // músculos con ropPct < -2%
};

/* -------------------- Utilidades -------------------- */
const MUSCLES: MGKey[] = [
  "Chest","Back","Shoulders","Quads","Hamstrings","Biceps","Triceps","Calves",
];

function emptyMuscle(): MuscleStats {
  return { volumeWeekCurrent: 0, volumeWeekPrev: 0, volumeHistory: [0,0,0,0,0], ropPct: 0 };
}

function startOfISOWeek(d: Date) {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay() || 7; // 1..7 (Mon..Sun)
  if (day !== 1) x.setUTCDate(x.getUTCDate() - (day - 1));
  x.setUTCHours(0,0,0,0);
  return x;
}

function weekIndexFrom(dateMs: number, baseW0: Date): number {
  if (!baseW0 || !(baseW0 instanceof Date) || isNaN(baseW0.getTime())) {
    return 0; // Retornar 0 si baseW0 no es válido
  }
  const ms = dateMs - baseW0.getTime();
  const w = Math.floor(ms / (7*24*3600*1000));
  return Math.max(-4, Math.min(0, w)); // sólo W-4..W0
}

/* --- Normalización simple de nombres y mapeo a grupos --- */
const CANONICAL: Record<string, MGKey> = {
  "bench press": "Chest",
  "incline dumbbell press": "Chest",
  "chest press": "Chest",
  "overhead press": "Shoulders",
  "shoulder press": "Shoulders",
  "lateral raise": "Shoulders",
  "row": "Back",
  "lat pulldown": "Back",
  "deadlift": "Back",
  "squat": "Quads",
  "leg press": "Quads",
  "romanian deadlift": "Hamstrings",
  "leg curl": "Hamstrings",
  "barbell curl": "Biceps",
  "curl": "Biceps",
  "tricep extension": "Triceps",
  "tricep pushdown": "Triceps",
  "calf raise": "Calves",
};

function strip(s: string) {
  return s.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

function guessGroup(raw: string): MGKey {
  const s = strip(raw);
  if (/(chest|pect|pecho)/.test(s)) return "Chest";
  if (/(row|lats?|espalda|pulldown)/.test(s)) return "Back";
  if (/(shoulder|deltoid|hombro|press)/.test(s)) return "Shoulders";
  if (/(quad|sentadilla|squat|prensa|cuadri)/.test(s)) return "Quads";
  if (/(femor|hamstring|curl( de)? pierna)/.test(s)) return "Hamstrings";
  if (/(bicep|curl)/.test(s)) return "Biceps";
  if (/(tricep|pushdown|extension)/.test(s)) return "Triceps";
  if (/(calf|gemelo|pantorrilla)/.test(s)) return "Calves";
  return "Chest";
}

function normalizeExercise(e: any): { canonicalName: string; muscleGroup: MGKey } {
  const base = strip(String(e?.canonicalName ?? e?.nombre ?? ""));
  if (!base) return { canonicalName: "unknown", muscleGroup: "Chest" };
  const key = Object.keys(CANONICAL).find(k => base.includes(k));
  const group = key ? CANONICAL[key] : guessGroup(base);
  return { canonicalName: base, muscleGroup: group };
}

function setVolume(set: any): number {
  const reps = Number(set?.reps ?? 0);
  const w = Number(set?.weight ?? 0);
  return (reps > 0 && w > 0) ? reps * w : 0; // aporta 0 si faltan datos
}

/* -------------------- Firestore helpers -------------------- */
export function userStatsDoc(uid: string) {
  return doc(db, "userStats", uid);
}

/* -------------------- Cálculo principal -------------------- */
export async function computeUserStats(uid: string): Promise<UserStats> {
  // 5 semanas: W-4..W0 (W0 = semana actual)
  const now = new Date();
  const W0 = startOfISOWeek(now);

  const sessionsQ = query(
    collection(db, "workoutSessions"),
    where("usuarioId", "==", uid)
  );
  const snap = await getDocs(sessionsQ);

  // estructuras base
  const perMuscle: Record<MGKey, MuscleStats> = Object.fromEntries(
    MUSCLES.map(m => [m, emptyMuscle()])
  ) as any;

  let sessionsLast30d = 0;
  const THIRTY_D = now.getTime() - 30*24*3600*1000;

  for (const d of snap.docs) {
    const data = d.data() as any;
    let t = 0;
    if (data?.fechaTimestamp instanceof Timestamp) {
      const date = data.fechaTimestamp.toDate();
      t = date ? date.getTime() : 0;
    } else {
      t = Number(data?.createdAt ?? Date.parse(data?.fecha ?? "")) || 0;
    }

    if (t >= THIRTY_D) sessionsLast30d++;

    const wIdx = weekIndexFrom(t, W0); // -4..0
    if (wIdx < -4 || wIdx > 0) continue;
    const histPos = 4 + wIdx; // 0..4

    const ejercicios: any[] = Array.isArray(data?.ejercicios) ? data.ejercicios : [];
    for (const ex of ejercicios) {
      const { muscleGroup } = normalizeExercise(ex);
      const sets: any[] = Array.isArray(ex?.series) ? ex.series : [];
      let vol = 0;
      for (const s of sets) vol += setVolume(s); // cuenta aunque done=false
      perMuscle[muscleGroup].volumeHistory[histPos] += vol;
    }
  }

  // Derivados: current/prev y ropPct
  let totalCur = 0, totalPrev = 0;
  for (const m of MUSCLES) {
    const cur = perMuscle[m].volumeHistory[4] || 0;
    const prev = perMuscle[m].volumeHistory[3] || 0;
    perMuscle[m].volumeWeekCurrent = cur;
    perMuscle[m].volumeWeekPrev = prev;
    perMuscle[m].ropPct = prev > 0 ? ((cur - prev)/prev) * 100 : (cur > 0 ? 100 : 0);
    totalCur += cur; totalPrev += prev;
  }

  const decreased: MGKey[] = MUSCLES.filter(m => perMuscle[m].ropPct < -2);

  return {
    userId: uid,
    computedAt: Date.now(),
    totals: {
      volumeWeekCurrent: totalCur,
      volumeWeekPrev: totalPrev,
      sessionsLast30d,
    },
    muscles: perMuscle,
    decreased,
  };
}

export async function saveUserStats(uid: string, stats: UserStats) {
  await setDoc(userStatsDoc(uid), stats, { merge: true });
}

/* Helper para leer el último (opcional en tu UI) */
export async function getLatestStats(uid: string): Promise<UserStats | null> {
  const ref = userStatsDoc(uid);
  const s = await (await import("firebase/firestore")).getDoc(ref);
  return s.exists() ? (s.data() as UserStats) : null;
}
