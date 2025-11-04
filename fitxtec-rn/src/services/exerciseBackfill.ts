import { db } from "../services/firebase";
import { collection, query, where, getDocs, writeBatch, doc } from "firebase/firestore";
import { canonicalName, muscleGroupFor } from "./exerciseMap";

export async function backfillExerciseCanonAndMG(uid: string) {
  const q = query(collection(db, "workoutSessions"), where("usuarioId", "==", uid));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  snap.forEach(d => {
    const s = d.data() as any;
    if (!Array.isArray(s.ejercicios)) return;
    const fixed = s.ejercicios.map((e: any) => ({
      ...e,
      canonicalName: e.canonicalName ?? canonicalName(e.nombre ?? ""),
      muscleGroup: e.muscleGroup ?? muscleGroupFor(e.nombre ?? "") ?? null,
    }));
    batch.update(doc(db, "workoutSessions", d.id), { ejercicios: fixed });
  });
  await batch.commit();
}
