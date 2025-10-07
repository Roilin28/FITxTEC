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
import { db } from "./firebase";

/* ================== Interfaces ================== */

export interface Rutina {
  nombre: string;
  cantidadDias: number;        // 4
  tiempoAproximado: string;    // "60-75 min"
  nivelDificultad: "Beginner" | "Intermediate" | "Advanced";
  descripcion: string;
  notas?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface DiaRutina {
  nombre: string;              // "Upper Body Workout"
}

export interface EjercicioDia {
  nombre: string;              // "Pull Ups"
  series: number;              // 3,4...
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

