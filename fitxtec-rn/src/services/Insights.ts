// src/services/insights.ts
import {
  collection, addDoc, setDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { UserStats, MGKey } from "./stats";

/* Rutas */
function insightsItemsCol(uid: string) {
  return collection(db, "aiInsights", uid, "items");
}
function latestInsightDoc(uid: string) {
  return doc(db, "aiInsights", uid, "latest", "data"); // colección 'latest' con doc 'data'
}

/* Heurística simple (sin Gemini) */
function heuristicAdvice(stats: UserStats): string[] {
  const adv: string[] = [];
  const up30 = stats.totals.volumeWeekPrev > 0 &&
               ((stats.totals.volumeWeekCurrent - stats.totals.volumeWeekPrev) /
                 stats.totals.volumeWeekPrev) > 0.3;
  if (up30) adv.push("El volumen total subió >30% vs semana previa: vigila recuperación y sueño para evitar sobrecarga.");
  for (const m of Object.keys(stats.muscles) as MGKey[]) {
    const s = stats.muscles[m];
    if (s.ropPct < -10) adv.push(`${m}: el volumen cayó >10% vs semana previa. Considera añadir 1–2 series efectivas.`);
    if (s.ropPct > 20) adv.push(`${m}: subida fuerte; mantén técnica y controla el RIR/RPE.`);
  }
  if (!adv.length) adv.push("Volumen estable. Mantén constancia y progreso de cargas de forma gradual (2.5–5%).");
  return adv.slice(0, 5);
}

export async function createAndSaveInsights(uid: string, stats: UserStats) {
  const item = {
    userId: uid,
    createdAt: Date.now(),
    serverUpdatedAt: serverTimestamp(),
    advice: heuristicAdvice(stats),
  };
  const ref = await addDoc(insightsItemsCol(uid), item);
  await setDoc(latestInsightDoc(uid), { ...item, insightId: ref.id }, { merge: true });
  return { id: ref.id, ...item };
}

export async function getLatestInsight(uid: string) {
  const snap = await getDoc(latestInsightDoc(uid));
  return snap.exists() ? snap.data() : null;
}

export async function listInsightsHistory(uid: string) {
  const q = query(insightsItemsCol(uid), orderBy("createdAt", "desc"));
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}
