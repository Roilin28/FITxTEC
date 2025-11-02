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
} from "firebase/firestore";
import { db, auth } from "./firebase";


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
      !["Beginner","Intermediate","Advanced"].includes(r.nivelDificultad) ||
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




export async function saveRoutineFromAI(ai: AiRoutineJSON): Promise<string> {
  if (!isValidAiRoutine(ai)) throw new Error("AI JSON inválido");

  const uid = auth.currentUser?.uid ?? "anon"; 

  const ref = await addDoc(rutinasCol(), {
    ...ai.rutina,
    userId: uid,
    createdAt: now(),
    updatedAt: now(),
    serverUpdatedAt: serverTimestamp(),
  });

  const batch = writeBatch(db);
  for (const d of ai.dias) {
    const diaRef = doc(db, `rutinas/${ref.id}/dias/${String(d.id)}`);
    batch.set(diaRef, { nombre: d.nombre });

    for (const e of d.ejercicios) {
      const ejRef = doc(db, `rutinas/${ref.id}/dias/${String(d.id)}/ejercicios/${e.id}`);
      batch.set(ejRef, { nombre: e.nombre, series: e.series });
    }
  }
  await batch.commit();
  return ref.id;
}
