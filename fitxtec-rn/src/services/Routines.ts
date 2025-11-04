import {
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "./firebase";


/* ================== Interfaces ================== */

export interface EjercicioDia {
  id?: string;
  nombre: string;
  series: number;
}

export interface DiaRutina {
  id?: string;
  nombre: string;
  ejercicios?: EjercicioDia[];
}

export interface Rutina {
  nombre: string;
  cantidadDias: number;
  tiempoAproximado: string;
  nivelDificultad: "Beginner" | "Intermediate" | "Advanced";
  descripcion: string;
  notas?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface RutinaCompleta extends Rutina {
  dias: DiaRutina[];
}

/* ================== Helpers ================== */
const savedRoutinesCol = () => collection(db, "savedRoutines");
const savedDiasCol = (routineId: string) => collection(db, `savedRoutines/${routineId}/dias`);
const savedEjerciciosCol = (routineId: string, diaId: string) =>
  collection(db, `savedRoutines/${routineId}/dias/${diaId}/ejercicios`);

const rutinasCol = () => collection(db, "rutinas");
const diasCol = (rutinaId: string) => collection(db, `rutinas/${rutinaId}/dias`);
const ejerciciosCol = (rutinaId: string, diaId: string) =>
  collection(db, `rutinas/${rutinaId}/dias/${diaId}/ejercicios`);

const now = () => Date.now();

/* ================== CRUD Rutina ================== */

export async function createRutina(data: Rutina) {
  const ref = await addDoc(rutinasCol(), {
    ...data,
    createdAt: now(),
    updatedAt: now(),
    serverUpdatedAt: serverTimestamp(),
  });
  return ref.id; // devuelve ID generado
}

export async function updateRutina(
  rutinaId: string,
  data: Partial<Rutina>
) {
  const ref = doc(rutinasCol(), rutinaId);
  await updateDoc(ref, {
    ...data,
    updatedAt: now(),
    serverUpdatedAt: serverTimestamp(),
  });
}


export async function deleteRutina(rutinaId: string) {
  // 1) borrar ejercicios de cada día (en batches)
  const diasSnap = await getDocs(diasCol(rutinaId));

  // Borramos en lotes para no pasar el límite de 500 operaciones por batch
  const commitBatches = async (ops: Array<() => void>) => {
    // Ejecuta en chunks de 450 (margen)
    const CHUNK = 450;
    for (let i = 0; i < ops.length; i += CHUNK) {
      const batch = writeBatch(db);
      ops.slice(i, i + CHUNK).forEach((fn) => fn.call({ batch }));
      // @ts-ignore - accedemos batch vía closure
      await batch.commit();
    }
  };

  const ops: Array<() => void> = [];

  for (const diaDoc of diasSnap.docs) {
    const diaId = diaDoc.id;
    const ejSnap = await getDocs(ejerciciosCol(rutinaId, diaId));

    // borrar ejercicios
    ejSnap.docs.forEach((e) => {
      const delRef = doc(db, `rutinas/${rutinaId}/dias/${diaId}/ejercicios/${e.id}`);
      ops.push(function () {
        // @ts-ignore
        this.batch.delete(delRef);
      });
    });

    // borrar el día
    const delDiaRef = doc(db, `rutinas/${rutinaId}/dias/${diaId}`);
    ops.push(function () {
      // @ts-ignore
      this.batch.delete(delDiaRef);
    });
  }

  // ejecutar borrado de subcolecciones y días
  await commitBatches(ops);

  // 2) borrar el documento de rutina
  await deleteDoc(doc(rutinasCol(), rutinaId));
}

///* ================== CRUD DE LAS RUTINAS ================== */

export async function createOrUpdateRutina(
  rutinaId: string,
  data: Rutina
) {
  const ref = doc(rutinasCol(), rutinaId);
  await setDoc(
    ref,
    {
      ...data,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function setDia(
  rutinaId: string,
  diaId: string, // "1" | "2" ...
  data: DiaRutina
) {
  const ref = doc(diasCol(rutinaId), diaId);
  await setDoc(ref, data, { merge: true });
}

export async function setEjercicio(
  rutinaId: string,
  diaId: string,
  ejercicioId: string,
  data: EjercicioDia
) {
  const ref = doc(ejerciciosCol(rutinaId, diaId), ejercicioId);
  await setDoc(ref, data, { merge: true });
}

/* ================== GETS DE RUTINA  ================== */

/** Lee una rutina (solo doc principal) */
export async function getRutina(rutinaId: string) {
  const snap = await getDoc(doc(rutinasCol(), rutinaId));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Rutina) }) : null;
}

/** Lista de rutinas (datos generales) */
export async function listRutinas() {
  const snap = await getDocs(rutinasCol());
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Rutina) }));
}

/** Obtener una rutina, pero trae los datos generales + ejerccicios  */
export async function getRutinaDeep(rutinaId: string) {
  const r = await getRutina(rutinaId);
  if (!r) return null;

  const diasSnap = await getDocs(diasCol(rutinaId));
  const diasOrdered = diasSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as DiaRutina) }))
    // si tus días son "1","2",... los ordenamos numéricamente
    .sort((a, b) => Number(a.id) - Number(b.id));

  const dias = await Promise.all(
    diasOrdered.map(async (dia) => {
      const ejSnap = await getDocs(ejerciciosCol(rutinaId, dia.id));
      const ejercicios = ejSnap.docs.map((e) => ({
        id: e.id,
        ...(e.data() as EjercicioDia),
      }));
      return { ...dia, ejercicios };
    })
  );

  return { ...r, dias };
}


///* ================== PARTE DE IA ================== */

// ===== IA types (lo que esperamos del modelo) =====
export type AiRoutineJSON = {
  rutina: {
    nombre: string;
    cantidadDias: number;
    tiempoAproximado: string;
    nivelDificultad: "Beginner" | "Intermediate" | "Advanced";
    descripcion: string;
    notas?: string | null;
  };
  dias: Array<{
    id: number;                 // 1, 2, ...
    nombre: string;
    ejercicios: Array<{ id: string; nombre: string; series: number }>;
  }>;
};

// Validación mínima sin librerías
function isValidAiRoutine(x: any): x is AiRoutineJSON {
  try {
    if (!x?.rutina || !Array.isArray(x?.dias)) return false;
    const r = x.rutina;
    if (
      typeof r.nombre !== "string" ||
      typeof r.cantidadDias !== "number" ||
      typeof r.tiempoAproximado !== "string" ||
      !["Beginner", "Intermediate", "Advanced"].includes(r.nivelDificultad) ||
      typeof r.descripcion !== "string"
    ) return false;
    for (const d of x.dias) {
      if (typeof d.id !== "number" || typeof d.nombre !== "string" || !Array.isArray(d.ejercicios)) return false;
      for (const e of d.ejercicios) {
        if (typeof e.id !== "string" || typeof e.nombre !== "string" || typeof e.series !== "number") return false;
      }
    }
    return true;
  } catch { return false; }
}

export { isValidAiRoutine };




// export async function saveRoutineFromAI(ai: AiRoutineJSON, userId?: string): Promise<string> {
//   if (!isValidAiRoutine(ai)) throw new Error("AI JSON inválido");

//   const uid = auth.currentUser?.uid ?? "anon"; 

//   const ref = await addDoc(rutinasCol(), {
//     ...ai.rutina,
//     ...(uid ? { userId: uid } : {}),
//     createdAt: now(),
//     updatedAt: now(),
//     serverUpdatedAt: serverTimestamp(),
//   });

//   const batch = writeBatch(db);
//   for (const d of ai.dias) {
//     const diaRef = doc(db, `savedRoutines/${ref.id}/dias/${String(d.id)}`);
//     batch.set(diaRef, { nombre: d.nombre });

//     for (const e of d.ejercicios) {
//       const ejRef = doc(db, `savedRoutines/${ref.id}/dias/${String(d.id)}/ejercicios/${e.id}`);
//       batch.set(ejRef, { nombre: e.nombre, series: e.series });
//     }
//   }

//   if (uid) {
//     const userRutinaRef = doc(db, `usuarios/${uid}/savedRoutines/${ref.id}`);
//     batch.set(userRutinaRef, {
//       rutinaId: ref.id,
//       nombre: ai.rutina.nombre,
//       nivelDificultad: ai.rutina.nivelDificultad,
//       createdAt: now(),
//     });
//   }

//   await batch.commit();
//   return ref.id;
// }
export async function saveRoutineFromAI(ai: AiRoutineJSON, userId?: string): Promise<string> {
  if (!isValidAiRoutine(ai)) throw new Error("AI JSON inválido");

  const uid = userId ?? "anon";

  // 1) Guarda doc principal en savedRoutines
  const ref = await addDoc(savedRoutinesCol(), {
    ...ai.rutina,
    userId: uid,
    createdAt: now(),
    updatedAt: now(),
    serverUpdatedAt: serverTimestamp(),
  });

  // 2) Subcolecciones en savedRoutines/{id}/dias/.../ejercicios
  const batch = writeBatch(db);
  for (const d of ai.dias) {
    const diaRef = doc(db, `savedRoutines/${ref.id}/dias/${String(d.id)}`);
    batch.set(diaRef, { nombre: d.nombre });

    for (const e of d.ejercicios) {
      const ejRef = doc(db, `savedRoutines/${ref.id}/dias/${String(d.id)}/ejercicios/${e.id}`);
      batch.set(ejRef, { nombre: e.nombre, series: e.series });
    }
  }

  // (Opcional) puntero bajo el usuario
  if (uid && uid !== "anon") {
    const userPtr = doc(db, `usuarios/${uid}/savedRoutines/${ref.id}`);
    batch.set(userPtr, {
      rutinaId: ref.id,
      nombre: ai.rutina.nombre,
      nivelDificultad: ai.rutina.nivelDificultad,
      createdAt: now(),
    });
  }

  await batch.commit();
  return ref.id;
}

export async function listRutinasForUser(userId: string) {
  const q = query(rutinasCol(), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Rutina) }));
}

/**
 * Obtiene una rutina AI guardada (desde savedRoutines) con todos sus detalles
 */
export async function getSavedRoutineDeep(rutinaId: string): Promise<RutinaCompleta | null> {
  const snap = await getDoc(doc(savedRoutinesCol(), rutinaId));
  if (!snap.exists()) return null;

  const r = { id: snap.id, ...(snap.data() as Rutina) };

  const diasSnap = await getDocs(savedDiasCol(rutinaId));
  const diasOrdered = diasSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as DiaRutina) }))
    .sort((a, b) => Number(a.id) - Number(b.id));

  const dias = await Promise.all(
    diasOrdered.map(async (dia) => {
      const ejSnap = await getDocs(savedEjerciciosCol(rutinaId, dia.id));
      const ejercicios = ejSnap.docs.map((e) => ({
        id: e.id,
        ...(e.data() as EjercicioDia),
      }));
      return { ...dia, ejercicios };
    })
  );

  return { ...r, dias };
}

/**
 * Lista todas las rutinas AI de un usuario (desde savedRoutines donde userId coincide)
 */
export async function listAiRoutinesForUser(userId: string): Promise<Array<{ id: string } & Rutina>> {
  const q = query(savedRoutinesCol(), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Rutina) }));
}

/**
 * Verifica si una rutina es AI (existe en savedRoutines con userId)
 */
export async function isAiRoutine(rutinaId: string, userId?: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(savedRoutinesCol(), rutinaId));
    if (!snap.exists()) return false;
    const data = snap.data() as Rutina & { userId?: string };
    // Si tiene userId, es una rutina AI
    if (data.userId) {
      // Si se proporciona userId, verificar que coincida
      if (userId) {
        return data.userId === userId;
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Obtiene una rutina (ya sea normal o AI) con todos sus detalles
 * Intenta primero como rutina normal, luego como rutina AI
 */
export async function getRutinaDeepOrAi(rutinaId: string, userId?: string): Promise<RutinaCompleta | null> {
  // Primero intentar como rutina normal
  const rutinaNormal = await getRutinaDeep(rutinaId);
  if (rutinaNormal) return rutinaNormal;

  // Si no existe, intentar como rutina AI
  const rutinaAI = await getSavedRoutineDeep(rutinaId);
  if (rutinaAI) {
    // Si se proporciona userId, verificar que sea del usuario
    if (userId) {
      const isAi = await isAiRoutine(rutinaId, userId);
      if (!isAi) return null;
    }
    return rutinaAI;
  }

  return null;
}

/**
 * Elimina una rutina AI (desde savedRoutines) con todas sus subcolecciones
 */
export async function deleteSavedRoutine(rutinaId: string) {
  // 1) borrar ejercicios de cada día (en batches)
  const diasSnap = await getDocs(savedDiasCol(rutinaId));

  // Borramos en lotes para no pasar el límite de 500 operaciones por batch
  const commitBatches = async (ops: Array<() => void>) => {
    // Ejecuta en chunks de 450 (margen)
    const CHUNK = 450;
    for (let i = 0; i < ops.length; i += CHUNK) {
      const batch = writeBatch(db);
      ops.slice(i, i + CHUNK).forEach((fn) => fn.call({ batch }));
      // @ts-ignore - accedemos batch vía closure
      await batch.commit();
    }
  };

  const ops: Array<() => void> = [];

  for (const diaDoc of diasSnap.docs) {
    const diaId = diaDoc.id;
    const ejSnap = await getDocs(savedEjerciciosCol(rutinaId, diaId));

    // borrar ejercicios
    ejSnap.docs.forEach((e) => {
      const delRef = doc(db, `savedRoutines/${rutinaId}/dias/${diaId}/ejercicios/${e.id}`);
      ops.push(function () {
        // @ts-ignore
        this.batch.delete(delRef);
      });
    });

    // borrar el día
    const delDiaRef = doc(db, `savedRoutines/${rutinaId}/dias/${diaId}`);
    ops.push(function () {
      // @ts-ignore
      this.batch.delete(delDiaRef);
    });
  }

  // ejecutar borrado de subcolecciones y días
  if (ops.length > 0) {
    await commitBatches(ops);
  }

  // 2) borrar el documento de rutina AI
  await deleteDoc(doc(savedRoutinesCol(), rutinaId));
}